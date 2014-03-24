# fread - js file reader

[![Build Status](https://secure.travis-ci.org/rmcvey/fread.png?branch=master)](http://travis-ci.org/rmcvey/fread)

fread is a tiny javascript library that allows you to display uploaded files via the FileReader API (currently only CSV and Image files). It has no external dependencies.

Read more documentation and [see examples here](https://rmcvey.github.io/fread/)

## fread API
### options
- in <string>:  file input selector
- out <string>: output table selector
- before <function>: called before table is rendered
- after <function>: called after table is rendered, receives an argument representing each row

### default usage
    <input type="file" id="files" name="files[]" multiple />
    <table id="list" class="table table-bordered table-striped">
      <thead></thead>
      <tbody></tbody>
    </table>
    // use default writer
    var fread = new fread({
      in: '#files',
      out: '#list'
      before: function(evt){
        // perform some action before render
      },
      after: function(headers, rows){
        // perform some action with rows array
      }
    });

### custom writer
    // use a custom writer
    var fread = new fread({
      in: '#file-input',
      writer: function(headers, rows){
        // write data to the page
      }
    });

See examples/index.html or the [live example](https://rmcvey.github.io/fread/example.html)

### Installation

    bower install fread

or Download and include lib/fread.js in your page
