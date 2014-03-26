(function (root, factory) {
	'use strict';
	if (typeof define === 'function' && define.amd) {
		// AMD. Register as an anonymous module.
		define([], factory);
	} else {
		// Browser globals
		root.fread = factory();
	}
}(this, function () {
	'use strict';

	// dom node factory
	var element = {
		create: function(tag_type, attributes){
			attributes = attributes || {};
			var el = document.createElement(tag_type)
				, styles = 'style' in attributes && attributes['style'] || []
				, i
				, x
				, style_string = '';

			delete attributes['style'];

			for(i in attributes){
				el.setAttribute(i, attributes[i]);
			}
	
			for(x in styles){
				style_string += x+':'+styles[x]+';';
			}
			el.setAttribute('style', style_string);
			return el;
		}
	};
	// utility methods
	var util = {
		merge: function(a, b){
			if(typeof b === 'undefined' || !b){
				return a;
			}
			for(var c in a){
				if(b.hasOwnProperty(c)){
					a[c] = b[c];
				}
			}
			return a;
		},
		is_queryable: function(elem){
			return 'querySelector' in elem;
		}
	};
	
	/**
	*  Main library code, accepts a params object
	*  {
	*    in <DOM selector>: selector for file input (e.g. #file-input),
	*    out <DOM selector>: selector for output
	*  }
	*/
	function fread(params){
		if(typeof document === 'undefined'){
			return false;
		}

		var defaults = {
			// if no file input was supplied, just look for any file input on the page
			in: 'input[type="file"]',
			 // if no output file was provided, create a table
			out: 'table',
			before:  function(){},
			after:   function(){},
			 writer:  null
		};

		this.image_pattern  = 'image.*';
		this.csv_pattern    = 'text.*';

		this.params 		 = util.merge(defaults, params);

		this.in_target 	 = (this.params.in  && document.querySelector(this.params.in))  || document.querySelector(defaults.in);
		this.out_target  = (this.params.out && document.querySelector(this.params.out)) || defaults.out;
		// exit if no DOM nodes are provided for in and out targets and writer isn't implemented
		if(!util.is_queryable(this.in_target) || !util.is_queryable(this.out_target)){
			return false;
		}

		var _this = this;
		this.in_target.addEventListener('change', function(e){
			_this.params.before.call(e)
			_this.handler.call(_this, e, _this.params.after);
		}, false);
	}

	fread.prototype = {
		in_target: null,
		out_target: null,
		data: [],
		handler: function(evt, after) {
			var files = evt.target.files
				, _this = this
				, type  = false
				, data  = []
				, writer;

			for (var i = 0, f; f = files[i]; i++) {
				if (f.type.match(_this.csv_pattern)) {
					type = 'csv';
				} else if (f.type.match(_this.image_pattern)) {
					type = 'image';
				} else {
				  continue;
				}

				if('writer' in _this.params && _this.params.writer !== null){
					writer = _this.params.writer;
				} else {
					writer = _this.writers[type];
				}

				data = _this.readers[type].call(_this, f, evt, writer, after);
			}
		},
		writers: {
			csv: function(headings, data){
				var _this = this
				, headers = false
				, max_length = headings.length
				, tbody = _this.out_target.querySelector('tbody');

				var head = element.create('tr')
					, outp = '';

				for(var x = 0; x < headings.length; x++){
				  outp += ['<th>', headings[x], '</th>'].join('');
				}
				head.innerHTML = outp;
				_this.out_target.querySelector('thead').appendChild(head);

				data.forEach(function(row, index){
					var tr = document.createElement('tr')
						, i = 0
						, out = '';

					for( ; i < max_length; i++){
					  out += ['<td>', row[i], '</td>'].join('');
					}

					tr.innerHTML = out;
					tbody.appendChild(tr);
				});
			},
			image: function(data){
				// Render thumbnail.
				var _this = this
					, span = element.create('div', {
						'class': 'thumb-container'
					})
				, thumb = element.create('img', {
					'src': data.src,
					'title': escape(data.name),
					'class': 'thumb'
				});
				span.appendChild(thumb);
				_this.out_target.appendChild(span, null);
			}
		},
		// leaving open to other readers being added
		readers: {
			csv: function(file, evt, writer, after){
				var reader = new FileReader()
					, _this  = this;
		
				reader.onload = (function(theFile, writer) {
					return function(e) {
						var span = document.createElement('span')
							, rows = e.target.result.split('\n')
							, max_length = 0;
						
						rows.forEach(function(row, index){
							var row_data = row.split(',');
							_this.data.push(row_data);
						});
						
						var args = [_this.data[0], _this.data.slice(1)];
						// call writer
						writer.apply(_this, args);
						// call after callback
						after.apply(_this, args);
					};
				})(file, writer);
				reader.readAsText(file);
			},
			image: function(file, evt, writer, after){
				var _this = this;
				var reader = new FileReader();

				// Closure to capture the file information.
				reader.onload = (function(image_file) {
					return function(e) {
						// push data-src into result object
						image_file.src = e.target.result;
						// add to dataset
						_this.data.push(image_file);
						// call writer
						writer.call(_this, image_file);
						// call after callback
						after.call(_this, _this.data);
					};
				})(file);

				// Read in the image file as a data URL.
				reader.readAsDataURL(file);
			}
		}
	};
	return fread;
}));
