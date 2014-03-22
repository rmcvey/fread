# fread

[![Build Status](https://secure.travis-ci.org/rob/fread.png?branch=master)](http://travis-ci.org/rmcvey/fread)

fread is a tiny javascript library that allows you to display uploaded files (currently only CSV files). It has no external dependencies.


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

See examples/index.html for a full example

### Installation

    bower install fread

or Download and include lib/fread.js in your page
