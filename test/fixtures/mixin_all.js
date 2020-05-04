/** @module mixins */

/**
 * @mixin
 */
function MyMixin1() {
}

/**
 * @mixin
 */
class MyMixin2 {
}

/**
 * @interface
 */
class MyInterface {
}

/**
 * @class
 */
class MyBaseClass {
}

/**
 * @class
 * @extends MyBaseClass
 * @mixes MyMixin1
 * @mixes MyMixin2
 * @implements MyInterface
 */
class MyMixedClass extends MyBaseClass {

}

module.exports = {
    MyMixedClass: MyMixedClass
}
