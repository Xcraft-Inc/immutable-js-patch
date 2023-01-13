'use strict';

var Immutable = require('immutable');

var tryParseInt = function(n) {
  var int = parseInt(n);
  return isNaN(int) ? n : int;
};

var primitivePatch = function (op, value) {
  if (op === '+' || op === '!=') {
    return value;
  } else if (op === '-') {
    return null;
  }
};

var mapPatch = function(map, firstPath, restPath, op, value) {
  if (op === '+') {
    if (restPath.length > 0 && map.get(firstPath) === undefined) {
      var baseValue = (restPath[0].match(/^\d+$/)) ? Immutable.List() : Immutable.Map();
      return map.set(firstPath, anyPatch(baseValue, restPath, op, value));
    } else {
      return map.set(firstPath, anyPatch(map.get(firstPath), restPath, op, value));
    }
  } else if (op === '!=') {
    if (restPath.length > 0) {
      return map.set(firstPath, anyPatch(map.get(firstPath), restPath, op, value));
    } else {
      return map.set(firstPath, value);
    }
  } else if (op === '-') {
    if (restPath.length > 0) {
      return map.set(firstPath, anyPatch(map.get(firstPath), restPath, op, value));
    } else {
      return map.remove(firstPath);
    }
  } else {
    throw new Error('map patch Error, unknown op: ' + op);
  }
};

var sequencePatch = function(sequence, firstPath, restPath, op, value) {
  firstPath = tryParseInt(firstPath);
  if (op === '+') {
    if (sequence.get(firstPath) === undefined) {
      if (restPath.length > 0) {
        var baseValue = (restPath[0].match(/^\d+$/)) ? Immutable.List() : Immutable.Map();
        return sequence.set(firstPath, anyPatch(baseValue, restPath, op, value));
      } else {
        // special case, add to the end
        if (firstPath === '-') {
          return sequence.push(value);
        }
        // special case, return the value
        return sequence.set(firstPath, value);
      }
    } else {
      if (restPath.length > 0) {
        return sequence.set(firstPath, anyPatch(sequence.get(firstPath), restPath, op, value));
      } else {
        // special case, return the value
        sequence = sequence.push(0);
        const {size} = sequence;
        for (let i = size - 1; i > firstPath; --i) {
          sequence = sequence.set(i, sequence.get(i - 1));
        }
        return sequence.set(firstPath, value);
      }
    }
  } else if (op === '!=') {
    if (restPath.length > 0) {
      return sequence.set(firstPath, anyPatch(sequence.get(firstPath), restPath, op, value));
    } else {
      return sequence.set(firstPath, value);
    }
  } else if (op === '-') {
    if (restPath.length > 0) {
      return sequence.set(firstPath, anyPatch(sequence.get(firstPath), restPath, op, value));
    } else {
      const {size} = sequence;
      for (let i = firstPath; i < size - 1; ++i) {
        sequence = sequence.set(i, sequence.get(i + 1));
      }
      return sequence.setSize(size - 1);
    }
  } else {
    throw new Error('sequence patch Error, unknown op: ' + op);
  }
};

var isRecord = function(any) {
  return (
    any != null
    && typeof any.updateIn === 'function'
    && typeof any.set === 'function'
  )
}

var anyPatch = function(any, pathArray, op, value) {
  var firstPath, restPath;

  if (Immutable.Iterable.isIndexed(any)) {
   if (pathArray.length === 0) { return any; }
   firstPath = pathArray[0];
   restPath = pathArray.slice(1);
   return sequencePatch(any, firstPath, restPath, op, value);
  } else if (Immutable.Iterable.isKeyed(any) || isRecord(any)) {
    // if the object is a record or a keyed iterable immutable object
    if (pathArray.length === 0) { return any; }
    firstPath = pathArray[0];
    restPath = pathArray.slice(1);
    return mapPatch(any, firstPath, restPath, op, value);
  } else {
    if (pathArray.length === 0) { return value; }
    return primitivePatch(op, value);
  }
};

var eachPatchInternal = function(value, patches) {
  for (const patch of patches) {
    var pathArray = patch.path;
    value = anyPatch(value, pathArray, patch.op, Immutable.fromJS(patch.value));
  }
  return value;
};

var eachPatch = function(value, patches) {
  return value.withMutations((value) => {
    if (patches.length === 1) {
      var onlyPatch = patches[0];
      if (onlyPatch.op === '!=' && onlyPatch.path.length === 0) {
        return onlyPatch.value;
      }
    }
    return eachPatchInternal(value, patches);
  })
};

eachPatch.default = eachPatch;
module.exports = eachPatch;
