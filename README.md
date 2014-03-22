# fread

[![Build Status](https://secure.travis-ci.org/rob/fread.png?branch=master)](http://travis-ci.org/rob/fread)

fread is a tiny javascript library that allows you to display uploaded files (currently only CSV files).

Provide an input selector, output table selector and optional before/after callbacks.

## fread API
### options
- in <string>:  file input selector
- out <string>: output table selector
- before <function>: called before table is rendered
- after <function>: called after table is rendered, receives an argument representing each row

### usage
    var fread = new fread({
      in: '#file-input',
      out: '#table-output',
      before: function(evt){
        // perform some action before render
      },
      after: function(rows){
        // perform some action with rows array
      }
    });
