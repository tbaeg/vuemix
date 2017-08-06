function getDefaultData() {
    return {};
};

const Vuemix = {
    create(schema, store, as) {
        if (!schema) {
            throw Error('First parameter `schema` is required.');
        }

        if (!store || typeof store !== 'object') {
            throw Error('Second parameter `store` is required and should be a plain Object.');
        }

        if (!as) {
            throw Error('Property `as` is required.');
        }

        const storeMixin = schema.component ? Object.assign({}, schema.component) : {};

        storeMixin.beforeCreate = function () {
            const self = this;
            const _data = (typeof self.$options.data === 'function') ?
                self.$options.data :
                getDefaultData;

            self.$options.data = function () {
                const data = _data();

                if (data.hasOwnProperty(as)) {
                    throw new Error('Uh oh! We have a name collision for:' + as);
                }

                data[as] = store;
                return data;
            }

            if (schema.methods) {
                const _methods = {};
                const methods = schema.methods;

                for (const key in methods) {
                    if (methods.hasOwnProperty(key)) {
                        if (typeof methods[key] === 'function') {
                            _methods[key] = methods[key].bind(self, store);
                            // _methods[key] = newFunc(self, store, methods[key]);
                        } else {
                            throw Error('Ensure properties for `methods` are all functions.');
                        }
                    }
                }

                storeMixin.__proto__ = _methods;

                for (const key in storeMixin) {
                    if (storeMixin.hasOwnProperty(key)) {
                        delete storeMixin[key];
                    }
                }
            }
        }

        return storeMixin;
    }
};

export default Vuemix;
