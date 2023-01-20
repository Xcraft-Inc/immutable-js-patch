'use strict';

var Immutable = require('immutable');
var assert = require('assert');
var patch = require('../src/patch');

describe('Map patch', function() {
  it('returns same Map when ops are empty', function() {
    var map = Immutable.Map({a: 1, b:2});
    var ops = Immutable.List();

    var result = patch(map, ops);

    assert.ok(Immutable.is(map, result));
  });

  it('adds missing value in empty map', function() {
    var map = Immutable.Map();
    var ops = [
      {op: '+', path: ['a'], value: 1}
    ];

    var result = patch(map, ops);
    var expected = Immutable.Map({a: 1});

    assert.ok(Immutable.is(result, expected));
  });

  it('adds missing value in map', function() {
    var map = Immutable.Map({a: 1});
    var ops = [
      {op: '+', path: ['b'], value: 2}
    ];

    var result = patch(map, ops);
    var expected = Immutable.Map({a: 1, b: 2});

    assert.ok(Immutable.is(result, expected));
  });

  it('replaces value in map', function() {
    var map = Immutable.Map({a: 1, b: 1});
    var ops = [
      {op: '!=', path: ['b'], value: 2}
    ];

    var result = patch(map, ops);
    var expected = Immutable.Map({a: 1, b: 2});

    assert.ok(Immutable.is(result, expected));
  });

  it('removes value in map', function() {
    var map = Immutable.Map({a: 1, b: 2});
    var ops = [
      {op: '-', path: ['b']}
    ];

    var result = patch(map, ops);
    var expected = Immutable.Map({a: 1});

    assert.ok(Immutable.is(result, expected));
  });

  it('replaces objects', function () {
    var value = {a: 1};
    var newValue = Immutable.Map({b: 2});
    var result = patch(value, [
      {op: '!=', path: [], value: newValue}
    ]);

    assert.deepEqual(result, newValue);
  });

  describe('nested maps', function() {
    it('adds missing value in nested map', function() {
      var map = Immutable.fromJS({a: 1, b: {c: 3}});
      var ops = [
        {op: '+', path: ['b', 'd'], value: 4}
      ];

      var result = patch(map, ops);
      var expected = Immutable.fromJS({a: 1, b: {c: 3, d: 4}});

      assert.ok(Immutable.is(result, expected));
    });

    it('creates nested map', function() {
      var map = Immutable.fromJS({a: 1});
      var ops = [
        {op: '+', path: ['b', 'c'], value: 2}
      ];

      var result = patch(map, ops);
      var expected = Immutable.fromJS({a: 1, b: {c: 2}});

      assert.ok(Immutable.is(result, expected));
    });

    it('replaces value in nested map', function() {
      var map = Immutable.fromJS({a: 1, b: {c: 3}});
      var ops = [
        {op: '+', path: ['b', 'c'], value: 4}
      ];

      var result = patch(map, ops);
      var expected = Immutable.fromJS({a: 1, b: {c: 4}});

      assert.ok(Immutable.is(result, expected));
    });

    it('removes value in nested map', function() {
      var map = Immutable.fromJS({a: 1, b: {c: 3, d: 4}});
      var ops = [
        {op: '-', path: ['b', 'd']}
      ];

      var result = patch(map, ops);
      var expected = Immutable.fromJS({a: 1, b: {c: 3}});

      assert.ok(Immutable.is(result, expected));
    });
  });

  describe('escaped paths', function() {
    it('add unescaped path', function() {
      var map = Immutable.fromJS({'a': 1, 'b': {'c': 3}});
      var ops = [
        {op: '+', path: ['b', 'prop/prop'], value: 4}
      ];

      var expected = Immutable.fromJS({'a': 1, 'b': {'c': 3, 'prop/prop': 4}});
      var result = patch(map, ops);

      assert.ok(Immutable.is(result, expected));
    });

    it('replaces unescaped path', function() {
      var map = Immutable.fromJS({'a': 1, 'b': {'c': 3, 'prop/prop': 4}});
      var ops = [
        {op: '!=', path: ['b', 'prop/prop'], value: 10}
      ];

      var expected = Immutable.fromJS({'a': 1, 'b': {'c': 3, 'prop/prop': 10}});
      var result = patch(map, ops);

      assert.ok(Immutable.is(result, expected));
    });

    it('removes unescaped path', function() {
      var map = Immutable.fromJS({'a': 1, 'b': {'c': 3, 'prop/prop': 4}});
      var ops = [
        {op: '-', path: ['b', 'prop/prop']}
      ];

      var expected = Immutable.fromJS({'a': 1, 'b': {'c': 3}});
      var result = patch(map, ops);

      assert.ok(Immutable.is(result, expected));
    });
  });

  describe('patch nested sequences', function() {
    it('adds missing value in nested sequence', function() {
      var map = Immutable.fromJS({a: 1, b: [1,2,3]});
      var ops = [
        {op: '+', path: ['b', '3'], value: 4}
      ];

      var result = patch(map, ops);
      var expected = Immutable.fromJS({a: 1, b: [1,2,3,4]});

      assert.ok(Immutable.is(result, expected));
    });

    it('adds nested sequence', function() {
      var map = Immutable.fromJS({a: 1});
      var ops = [
        {op: '+', path: ['b'], value: [1]}
      ];

      var result = patch(map, ops);
      var expected = Immutable.fromJS({a: 1, b: [1]});

      assert.ok(Immutable.is(result, expected));
    });

    it('replaces value in nested sequence', function() {
      var map = Immutable.fromJS({a: 1, b: [1,2,3]});
      var ops = [
        {op: '!=', path: ['b', '2'], value: 4}
      ];

      var result = patch(map, ops);
      var expected = Immutable.fromJS({a: 1, b: [1,2,4]});

      assert.ok(Immutable.is(result, expected));
    });

    it('removes value in nested sequence', function() {
      var map = Immutable.fromJS({a: 1, b: [1,2,3]});
      var ops = [
        {op: '-', path: ['b', '2']}
      ];

      var result = patch(map, ops);
      var expected = Immutable.fromJS({a: 1, b: [1,2]});

      assert.ok(Immutable.is(result, expected));
    });
  });

  describe('pacthes shallow value', function() {
    it('replaces shallow value', function() {
      var a = Immutable.fromJS({"role":"user","store":[]})
      var ops = [
        {"op":"!=","path":["role"],"value":"admin"},
        {"op":"!=","path":["store"],"value":2}
      ];

      var result = patch(a, ops);
      var expected = Immutable.fromJS({"role":"admin","store":2});

      assert.ok(Immutable.is(result, expected));
    })
  });
});