/**
 * fread
 *
 *    Library test
 */

'use strict'

var assert = require('assert'),
lib        = require('../lib/fread');

describe('Lint test', function() {
  it('should not throw errors', function() {
    var errors = false;
    try{
      var receiver = new lib.fread();
    }catch(e){
      console.log(e);
      errors = true;
    }
    assert.equal(errors, false);
  })
})
