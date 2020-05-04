/** @module test-export-20190913220822 */

class _NotExported {
}

/**
 *
 */
class _Foo {
}

/**
 * Default export with 'export default' on a lambda function.
 * @returns {_Foo | null}
 */
export default function() {
    return null;
}
