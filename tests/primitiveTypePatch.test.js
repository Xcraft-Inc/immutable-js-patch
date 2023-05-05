'use strict';

var Immutable = require('immutable');
var assert = require('assert');
var patch = require('../src/patch');

describe('xcraft.immutablepatch.primitive-types-patch', function() {
  it('returns same value when ops are empty', function () {
    var value = 1;
    var result = patch(value, []);

    assert.equal(result, value);
  });

  it('replaces numbers', function () {
    var value = 1;
    var newValue = 10;
    var result = patch(value, [
      {op: '!=', path: [], value: newValue}
    ]);

    assert.equal(result, newValue);
  });

  it('replaces strings', function () {
    var value = '1';
    var newValue = '10';
    var result = patch(value, [
      {op: '!=', path: [], value: newValue}
    ]);

    assert.equal(result, newValue);
  });

  it('when op is remove returns null', function () {
    var value = {a: 1};
    var result = patch(value, [
      {op: '-', path: []}
    ]);

    assert.equal(result, null);
  });
});
