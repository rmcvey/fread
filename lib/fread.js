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

    function fread(params){
      if(typeof document === 'undefined'){
        return false;
      }

			var defaults = {
        // if no file input was supplied, just look for any file input on the page
				in: 'input[type="file"]',
        // if no output file was provided, create a table
				out: 'table',
        // future versions will allow different file types to be read
				pattern: 'text.*',
				before:  function(){},
				after:   function(){}
			};

			this.params 		 = this._util.merge(defaults, params);

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
				var files = evt.target.files;
				var _this = this;

				for (var i = 0, f; f = files[i]; i++) {
					// Only process text files.
					if (!f.type.match(_this.params.out.pattern)) {
					  continue;
					}
					_this._readers.csv.call(_this, f, evt, after);
				}

		  },
			_util: {
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
			},
      // leaving open to other readers being added
			_readers: {
				csv: function(file, evt, after){
					var reader = new FileReader()
					  , _this  = this
            , headers = false;

					reader.onload = (function(theFile) {
					  return function(e) {
					    var span 		= document.createElement('span')
								, rows 		= e.target.result.split('\n')
								, max_length = 0;

							rows.forEach(function(row, index){
								var row_data = row.split(',')
									, elem = _this.out_target.querySelector('tbody')
									, tr 	 = document.createElement('tr')
									, out = ''
									, i = 0
									, start = '<td>'
									, end = '</td>';

								if(index == 0 && !headers){
									elem = _this.out_target.querySelector('thead');
									max_length = row_data.length;
                  headers  = true;
									start    = '<th>';
									end      = '</th>';
								}

								for( ; i < max_length; i++){
									out += [start, row_data[i], end].join('');
								}
								tr.innerHTML = out;
								elem.appendChild(tr);
								_this.data.push(row_data);
							});
              after.call(_this, _this.data);
						};
					})(file);
					reader.readAsText(file);
				}
			}
		}
		return fread;
}));
