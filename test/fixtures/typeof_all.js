/**
 * @property {Class<MyClass>} x
 * @property {Class.< MyClass >} y
 * @property {string|Class<MyClass>} z
 * @property {Class<MyClass>|string} u
 * @property {Array<Class<MyClass>>} v
 * @property {Class<Array<MyClass>>} w
 * @property {Class<MyClass[]>} q
 * @property {Class<Class<MyClass>>} r
 * @property {Class<Array<Class<MyClass>>>} s
 */
class Foobar1 {}

/**
 * @property {typeof MyClass} x
 * @property {typeof  MyClass } y
 * @property {string|typeof MyClass} z
 * @property {typeof MyClass|string} u
 * @property {Array<typeof MyClass>} v
 * @property {typeof Array<MyClass>} w
 * @property {typeof MyClass[]} q
 * @property {typeof typeof MyClass} r
 * @property {typeof Array<typeof MyClass>} s
 */
class Foobar2 {}
