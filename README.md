# jsdoc2tsd

## Warning: Highly Experimental

This library's goal is to be able to take as input a jsdoc annotated source JavaScript
file (or many files) and output a single TypeScript Declaration File (.d.ts).

It is distributed as a JSDoc3 template. Running jsdoc with this as the template should
result in a TypeScript Definition File.

## Installation

You can install this module from npm:

```
$> npm install tsd-jsdoc
```

## Usage

To use this module, simply specify it as the template for your normal jsdoc generation.

For example, from the command-line you can do:

```
$> jsdoc -t node_modules/tsd-jsdoc -r .
```

Or add this to your JSON configuration:

```json
{
    "opts": {
        "template": "./node_modules/tsd-jsdoc"
    }
}
```

## Validation

This library provides very little validation beyond what JSDoc provides. Meaning if you
have invalid JSDoc comments, this will likely output an invalid TypeScript Definition File.

Additionally there are things that JSDoc allows, that TypeScript does not. This library
tries to make these differences transparent, and translate from one to the other when
necessary. It can't handle anything though, and you can generate invalid Typescript
even if your JSDoc is valid.

## Unsupported Tags

Tags that describe the code, but support is not implemented are:

- [`@default`](http://usejsdoc.org/tags-default.html) - No TS equivalent
- [`@deprecated`](http://usejsdoc.org/tags-deprecated.html) - No TS equivalent ([issue](https://github.com/Microsoft/TypeScript/issues/390))
- [`@event`](http://usejsdoc.org/tags-event.html) - No TS equivalent
- [`@exports`](http://usejsdoc.org/tags-exports.html) - Everything is exported
- [`@external`](http://usejsdoc.org/tags-external.html) - Not sure what behavior would be expected
- [`@fires`](http://usejsdoc.org/tags-fires.html) - No TS equivalent
- [`@listens`](http://usejsdoc.org/tags-listens.html) - No TS equivalent
- [`@override`](http://usejsdoc.org/tags-override.html) - No TS equivalent ([issue](https://github.com/Microsoft/TypeScript/issues/2000))
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

All other jsdoc tags should work fine.

## Supported ClosureCompiler Tags

ClosureCompiler has a couple tags beyond the built-in jsdoc tags that can improve your TypeScript output. Here is a complete
list of the tags from CC that are supported in this template:

- [`@template`](https://github.com/google/closure-compiler/wiki/Annotating-JavaScript-for-the-Closure-Compiler#template-t) - For generics

# Rewrite todo

- Comb through gotchas and ensure they are correct still
- Close github issues
