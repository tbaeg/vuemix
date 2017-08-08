function getDefaultData() {
    return {};
};

const Vuemix = {
    create(schema, store, as = null) {
        if (!schema || typeof schema !== 'object') {
            throw Error('First parameter `schema` is required.');
        }

        if (!store || typeof store !== 'object') {
            throw Error('Second parameter `store` is required and should be a plain Object.');
        }

        const storeMixin = schema.mixin ? Object.assign({}, schema.mixin) : {};

        storeMixin.beforeCreate = function () {
            const self = this;

            if (as && typeof as === 'string') {
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
            }

            if (schema.methods) {
                const _methods = {};
                const methods = schema.methods;
                const args = {state: store, methods: _methods};

                for (const key in methods) {
                    if (methods.hasOwnProperty(key)) {
                        if (typeof methods[key] === 'function') {
                            _methods[key] = methods[key].bind(self, args);
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
