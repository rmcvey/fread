/*! fread - v0.1.1 - 2014-03-23
* http://github.com/rmcvey
* Copyright (c) 2014 Rob McVey; Licensed  */
// Uses AMD or browser globals to create a module.

// Grabbed from https://github.com/umdjs/umd/blob/master/amdWeb.js.
// Check out https://github.com/umdjs/umd for more patterns.

// Defines a module "fread".
// Note that the name of the module is implied by the file name. It is best
// if the file name and the exported global have matching names.

// If you do not want to support the browser global path, then you
// can remove the `root` use and the passing `this` as the first arg to
// the top function.

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
      }
    };

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
				after:   function(){}
			};

      this.image_pattern  = 'image.*';
      this.csv_pattern    = 'text.*';

      this.params 		 = util.merge(defaults, params);

			this.in_target 	= (this.params.in  && document.querySelector(this.params.in))  || document.querySelector(defaults.in);
			this.out_target  = (this.params.out && document.querySelector(this.params.out)) || defaults.out;

      if(!'querySelector' in this.in_target || !'querySelector' in this.out_target){
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

          if('writer' in _this.params){
            writer = _this.params.writer;
          } else {
            writer = _this.writers[type];
          }

          data = _this.readers[type].call(_this, f, evt, writer, after);
				}
		  },
      writers: {
        csv: function(data){
          var _this = this
          , headers = false
          , max_length = 0
          , tbody = _this.out_target.querySelector('tbody');

          data.forEach(function(row, index){
            var start = '<td>'
              , end = '</td>'
              , tr 	 = document.createElement('tr')
              , elem  = tbody
              , out = ''
              , i = 0;

            if(index == 0 && !headers){
              elem = _this.out_target.querySelector('thead');
              max_length = row.length;
              headers  = true;
              start    = '<th>';
              end      = '</th>';
            } else {
              elem = tbody;
            }

            for( ; i < max_length; i++){
              out += [start, row[i], end].join('');
            }
            
            tr.innerHTML = out;
            elem.appendChild(tr);
          });
        },
        image: function(e, data){
          // Render thumbnail.
          var _this = this
          , span = element.create('div', {
            'class': 'thumb-container'
          })
          , thumb = element.create('img', {
            'src':   e.target.result,
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
					    var span 		= document.createElement('span')
								, rows 		= e.target.result.split('\n')
								, max_length = 0;

							rows.forEach(function(row, index){
								var row_data = row.split(',');
								_this.data.push(row_data);
							});
              // call writer
              writer.call(_this, _this.data);
              // call after callback
              after.call(_this, _this.data);
						};
					})(file, writer);
					reader.readAsText(file);
				},
        image: function(file, evt, writer, after){
          var _this = this;
          var reader = new FileReader();

          // Closure to capture the file information.
          reader.onload = (function(theFile) {
            return function(e) {
              _this.data.push(theFile);
              // call writer
              writer.call(_this, e, theFile);
              // call after callback
              after.call(_this, theFile);
            };
          })(file);

          // Read in the image file as a data URL.
          reader.readAsDataURL(file);
        }
			}
		}
		return fread;
}));
