'use strict';

var GetIntrinsic = require('es-abstract/GetIntrinsic');
var callBound = require('es-abstract/helpers/callBound');
var has = require('has');

var $TypeError = GetIntrinsic('%TypeError%');
var $WeakMap = GetIntrinsic('%WeakMap%', true);
var $Map = GetIntrinsic('%Map%', true);
var $push = callBound('Array.prototype.push');

var $mapGet = callBound('WeakMap.prototype.get', true)
	|| callBound('Map.prototype.get', true)
	|| function (objects, O) { // eslint-disable-line consistent-return
		for (var i = 0; i < objects.length; i += 1) {
			if (objects[i].O === O) {
				return objects[i].V;
			}
		}
	};
var $mapSet = callBound('WeakMap.prototype.set', true)
	|| callBound('Map.prototype.set', true)
	|| function (objects, O, slots) {
		for (var i = 0; i < objects.length; i += 1) {
			if (objects[i].O === O) {
				objects[i].V = slots;
				return;
			}
		}
		$push(objects, {
			O: O,
			V: slots
		});
	};
var map = ($WeakMap || $Map) ? new ($WeakMap || $Map)() : []; // eslint-disable-line no-extra-parens

var SLOT = {
	assert: function (O, slot) {
		if (!O || (typeof O !== 'object' && typeof O !== 'function')) {
			throw new $TypeError('`O` is not an object');
		}
		if (typeof slot !== 'string') {
			throw new $TypeError('`slot` must be a string');
		}
		if (!SLOT.has(O, slot)) {
			throw new $TypeError('Object lacks internal slot ' + slot);
		}
	},
	get: function (O, slot) {
		if (!O || (typeof O !== 'object' && typeof O !== 'function')) {
			throw new $TypeError('`O` is not an object');
		}
		if (typeof slot !== 'string') {
			throw new $TypeError('`slot` must be a string');
		}
		var slots = $mapGet(map, O);
		return slots && slots['$' + slot];
	},
	has: function (O, slot) {
		if (!O || (typeof O !== 'object' && typeof O !== 'function')) {
			throw new $TypeError('`O` is not an object');
		}
		if (typeof slot !== 'string') {
			throw new $TypeError('`slot` must be a string');
		}
		var slots = $mapGet(map, O) || {};
		return has(slots, '$' + slot);
	},
	set: function (O, slot, V) {
		if (!O || (typeof O !== 'object' && typeof O !== 'function')) {
			throw new $TypeError('`O` is not an object');
		}
		if (typeof slot !== 'string') {
			throw new $TypeError('`slot` must be a string');
		}
		var slots = $mapGet(map, O);
		if (!slots) {
			slots = {};
			$mapSet(map, O, slots);
		}
		slots['$' + slot] = V;
	}
};

if (Object.freeze) {
	Object.freeze(SLOT);
}

module.exports = SLOT;
