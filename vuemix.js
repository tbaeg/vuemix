function getDefaultData() {
    return {};
};

function newFunc(context, store, func) {
    return function () {
        func.apply(context, arguments);
    }.bind(null, store);
}

var Vuemix = {};

Vuemix.create = function (schema, store, as) {
    if (!schema) {
        throw Error('First parameter `schema` is required.');
    }

    if (!store || typeof store !== 'object') {
        throw Error('Second parameter `store` is required and should be a plain Object.');
    }

    if (!as) {
        throw Error('Property `as` is required.');
    }

    var storeMixin = schema.component ? Object.assign({}, schema.component) : {};

    storeMixin.beforeCreate = function () {
        var self = this;
        var _data = (typeof self.$options.data === 'function') ?
            self.$options.data :
            getDefaultData;

        self.$options.data = function () {
            var data = _data();

            if (data.hasOwnProperty(as)) {
                throw new Error('Uh oh! We have a name collision for:' + as);
            }

            data[as] = store;
            return data;
        }

        if (schema.methods) {
            var _methods = {};
            var methods = schema.methods;

            for (var key in methods) {
                if (methods.hasOwnProperty(key)) {
                    if (typeof methods[key] === 'function') {
                        _methods[key] = newFunc(self, store, methods[key]);
                    } else {
                        throw Error('Ensure properties for `methods` are all functions.');
                    }
                }
            }

            storeMixin.__proto__ = _methods;

            for (var key in storeMixin) {
                if (storeMixin.hasOwnProperty(key)) {
                    delete storeMixin[key];
                }
            }
        }
    }

    return storeMixin;
}

// Polyfill
if (typeof Object.assign != 'function') {
    Object.assign = function (target, varArgs) { // .length of function is 2
        'use strict';
        if (target == null) { // TypeError if undefined or null
            throw new TypeError('Cannot convert undefined or null to object');
        }

        var to = Object(target);

        for (var index = 1; index < arguments.length; index++) {
            var nextSource = arguments[index];

            if (nextSource != null) { // Skip over if undefined or null
                for (var nextKey in nextSource) {
                    // Avoid bugs when hasOwnProperty is shadowed
                    if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                        to[nextKey] = nextSource[nextKey];
                    }
                }
            }
        }
        return to;
    };
}

if (typeof define === 'function' && define.amd) {
    define([], function () {
        'use strict';

        return Vuemix;
    });
} else if (typeof module === 'object' && module.exports) {
    module.exports = Vuemix;
} else {
    window.Vuemix = Vuemix;
}