'use strict';

/**
 * @param {TAFFY} data - The TaffyDB containing the data that jsdoc parsed.
 * @param {object} opts - Options passed into jsdoc.
 */
module.exports.publish = function (data, opts)
{
    // remove undocumented stuff.
    // data({undocumented: true}).remove();

    const docs = data().get();
    console.log(docs);
}
