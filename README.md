# jsdoc2tsd

## Warning: Highly Experimental

This library's goal is to be able to take as input a jsdoc annotated source JavaScript
file (or many files) and output a single TypeScript Declaration File (.d.ts).

It is distributed as a JSDoc3 template. Running jsdoc with this as the template should
result in a TypeScript Definition File.

## Gotchas

### Validation

This library provides almost no validation beyong what jsdoc provides. Meaning if you
have invalid jsodc comments, this will likely output an invalid TypeScript Definition File.
On the brightside, that means you will find invalid jsdoc pretty quickly.

Additionally there are things that jsdoc things are fine, that TypeScript does not.
One example would be a member variable marked with `@constant`. While that is valid
jsdoc, it is not valid TS:

```ts
class MyClass {
    const member: number; // ERROR: A class member cannot have the 'const' keyword.
}
```

So there a few cases like this where the jsdoc is massaged into valid TS.

### `module:...`

This syntax is used to link to another module's docs. If you use it
to describe the code, it will be ignored.

For example, this JavaScript:

```js
const Loader = require('resource-loader');

/**
 * @class
 * @extends module:resource-loader/Loader
 */
function MyClass() {
    Loader.call(this);
}

MyClass.prototype = Object.create(Loader.prototype);
```

Will generate this declaration:

```ts
class MyClass {
}
```

Instead you can include their jsdoc commented source or write your own jsdocs to
describe `Loader` and then just use `@extends Loader`.

### Method/Member Overrides

Any method or member that has the same name as one in the parent of a child class
will be ignored.

For example, this JavaScript:

```js
/**
 * @class
 */
class Parent {
    constructor() {
        /**
         * A property.
         *
         * @member {boolean}
         */
        this.someprop = true;
    }
}

/**
 * @class
 * @extends Parent
 */
class Child extends Parent {
    constructor() {
        /**
         * The property again
         *
         * @member {boolean}
         */
        this.someprop = false;
    }
}
```

Will generate this declaration:

```ts
class Parent {
    someprop: boolean;
}

class Child extends Parent {
}
```

## Unsupported Tags

Tags that describe the code, but support is not implemented are:

- [`@default`](http://usejsdoc.org/tags-default.html) - No TS equivalent
- [`@deprecated`](http://usejsdoc.org/tags-deprecated.html) - No TS equivalent ([issue](https://github.com/Microsoft/TypeScript/issues/390))
- [`@event`](http://usejsdoc.org/tags-event.html) - No TS equivalent
- [`@exports`](http://usejsdoc.org/tags-exports.html) - **Unimplemented**
- [`@external`](http://usejsdoc.org/tags-external.html) - **Unimplemented**
- [`@fires`](http://usejsdoc.org/tags-fires.html) - No TS equivalent
- [`@listens`](http://usejsdoc.org/tags-listens.html) - No TS equivalent
- [`@override`](http://usejsdoc.org/tags-override.html) - No TS equivalent ([issue](https://github.com/Microsoft/TypeScript/issues/2000))
- [`@readonly`](http://usejsdoc.org/tags-readonly.html) - No TS equivalent (implemented in v2)
- [`@throws`](http://usejsdoc.org/tags-throws.html) - No TS equivalent

Additionally, tags that are just metadata and don't actually describe
the code are ignored. These are:

- [`@author`](http://usejsdoc.org/tags-author.html)
- [`@classdesc`](http://usejsdoc.org/tags-classdesc.html)
- [`@copyright`](http://usejsdoc.org/tags-copyright.html)
- [`@description`](http://usejsdoc.org/tags-description.html)
- [`@example`](http://usejsdoc.org/tags-example.html)
- [`@file`](http://usejsdoc.org/tags-file.html)
- [`@license`](http://usejsdoc.org/tags-license.html)
- [`@requires`](http://usejsdoc.org/tags-requires.html)
- [`@see`](http://usejsdoc.org/tags-see.html)
- [`@since`](http://usejsdoc.org/tags-since.html)
- [`@summary`](http://usejsdoc.org/tags-summary.html)
- [`@todo`](http://usejsdoc.org/tags-todo.html)
- [`@tutorial`](http://usejsdoc.org/tags-tutorial.html)
- [`@version`](http://usejsdoc.org/tags-version.html)

All other tags *should* work...
