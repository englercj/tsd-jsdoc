/** @module constructors */

/**
 * Class documentation.
 */
class MyClass {

    /**
     * Constructor documentation.
     * @public
     * @param {number} a
     * @param {string} b
     */
    constructor(a, b) {}
}

/**
 * Class documentation.
 */
class MyClass2 {

    /**
     * Constructor documentation.
     * @protected
     * @param {number} a
     * @param {string} b
     */
    constructor(a, b) {}
}

/**
 * Class documentation.
 */
class MyClass3 {

    /**
     * Constructor documentation.
     * @package
     * @param {number} a
     * @param {string} b
     */
    constructor(a, b) {}
}

/**
 * Class documentation.
 */
class MyClass4 {

    /**
     * Constructor documentation.
     * @private
     * @param {number} a
     * @param {string} b
     */
    constructor(a, b) {}
}

module.exports = {
    MyClass: MyClass,
    MyClass2: MyClass2,
    MyClass3: MyClass3,
    MyClass4: MyClass4
}
