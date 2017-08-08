# Vuemix
Stupid simple store library for mixin based state management in Vue.js

<a href="https://www.npmjs.com/package/vuemix"><img src="https://img.shields.io/badge/size-<2kB-green.svg" alt="License"></a>
<a href="https://www.npmjs.com/package/vuemix"><img src="https://img.shields.io/badge/version-2.0.0-blue.svg" alt="Version"></a>
<a href="https://www.npmjs.com/package/vuemix"><img src="https://img.shields.io/badge/license-MIT-red.svg" alt="License"></a>

## Requirements
* `Vue` 2.0.0+

## Motivation
* I do want it to be stupid simple (no magic, people should understand what's going on).
* I do **NOT** want to have code such as `mapMutations` in my components.
* I do want to avoid namespace collisions to a reasonable degree.
* I do want to be able to have global **AND** instanced stores.
* I do want to leverage what `Vue` is already providing.
* I do want to be flexible and unopinionated as possible.

## API
`Vuemix` only has one method: `create`. Easy, right?

`Vuemix.create(schema, store, as)`

* Parameter: `schema`
    * REQUIRED
    * Description:
        * `methods`
            * Functions that execute actions/mutations to your state, but are not required. All functions recieve the store as the first argument of the function. As a bonus, functions also have a `this` context of the `Vue` component itself; so, one is able to access component instance specific properties/methods.
        * `mixin`
            * Properties that will be directly bound to the `Vue` component like any other mixin.
    * Type: `Object`.
    * Example:
        ```
        var SCHEMA = {
            methods: {
                updateMessage: function (store, value) {
                    store.state.value = value;
                },
                increment: function (store) {
                    console.log('Store method: increment');
                    store.methods.updateMessage(store.state.value + 1);
                }
            },
            mixin: {
                beforeMount: function () {
                    console.log('Mixin method: beforeMount');
                },
                methods: {
                    increment: function() {
                        console.log('Mixin method: increment');
                        this.test.value++;
                    }
                }
            }
        };
        ```

* Parameter: `store`
    * REQUIRED
    * Description: Object maintaining the source of truth for the store.
    * Type: `Object`.
    * Example:
        ```
        var store = {
            value: 0
        };
        ```

* Parameter: `as`
    * OPTIONAL
    * Description: Property name the store will bind as to the `Vue` component.
    * Type: `String`.
    * Example:
        ```
        var name = 'test';
        ```

## Usage

### ES6 Example

If you were write a small wrapper in ES6, it may look something like.
```
import Vuemix from 'vuemix';

function createTestStore() {
    return {
        value: 0
    };
}

const GLOBAL_STORE = createTestStore();
const SCHEMA = {
    methods: {
        setValue({state}, value) {
            store.value = value;
        }
    },
    component: {
        methods: {
            setValue(value) {
                console.log('Mixin method: setValue', value);
            }
        }
    }
};

export default {
    new(as) {
        return Vuemix.create(SCHEMA, createTestStore(), as);
    },
    global(as) {
        return Vuemix.create(SCHEMA, GLOBAL_STORE, as);
    }
};
```

Then, use like this.
```
<template>
    <span>Value: <span>{{myTest.value}}</span></span>
</template>

<script>
import TestStoreMixin from '/test/store/mixin';

// The store data will bind to the component as 'myTest'
const testStore = TestStoreMixin.global('myTest');

export default {
    mixins: [testStore],
    template: '#test',
    methods: {
        clicked() {
            console.log(this.myTest.value); // 0
            testStore.setValue(1);
            console.log(this.myTest.value); // 1
        }
    }
};
</script>
```

### ES5 Example

Not a complex example but should give you an idea. This [example](https://github.com/tbaeg/vuemix/blob/master/examples/index.html) is in the [examples](https://github.com/tbaeg/vuemix/tree/master/examples) directory.

You can also view live [here](https://rawgit.com/tbaeg/vuemix/master/examples/index.html).
```
// Helper function for generating new test store state
function createTestStore() {
    return {
        value: 0
    };
}

var GLOBAL_STORE = createTestStore();
var SCHEMA = {
    // Worried about naming collisions from these methods and the methods being mixed in?
    // The methods are attached to the mixin's prototype so `Vue` does not attach those
    // methods to the component itself preventing name collisions! Nice!
    methods: {
        updateMessage: function (store, value) {
            store.state.value = value;
        },
        increment: function (store) {
            console.log('Store method: increment');
            store.methods.updateMessage(store.state.value + 1);
        }
    },
    mixin: {
        beforeMount: function () {
            console.log('Mixin method: beforeMount');
        },
        methods: {
            increment: function() {
                console.log('Mixin method: increment');
                this.test.value++;
            }
        }
    }
};

// Your state is linked by object references.
// Notice, we explicitly pass in the global or a new test `store` object.
// By doing this, it keeps how you manage state extremely liberal.

// Global Store
var globalStore = Vuemix.create(SCHEMA, GLOBAL_STORE, 'test');

// Instance Store
var instanceStore = Vuemix.create(SCHEMA, createTestStore(), 'test');

Vue.component('test', {
    mixins: [globalStore],
    template: '#test',
    data: function () {
        return {
            other: null
        };
    },
    methods: {
        clicked: function () {
            // RECOMMENDED: Update global state via store methods
            globalStore.updateMessage(1);
        }
    }
});

Vue.component('test2', {
    mixins: [globalStore],
    template: '#test',
    data: function () {
        return {
            other: null
        };
    },
    methods: {
        clicked: function () {
            // NOT RECOMMENDED: Update global state directly
            this.test.value = 2;
        }
    }
});

Vue.component('test3', {
    mixins: [instanceStore],
    template: '#test',
    computed: {
        other: function () {
            return this.test.value + 1;
        }
    },
    methods: {
        clicked: function () {
            instanceStore.increment();
        }
    }
});
```
