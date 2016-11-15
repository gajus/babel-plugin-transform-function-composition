# babel-plugin-transform-function-composition

[![Travis build status](http://img.shields.io/travis/gajus/babel-plugin-transform-function-composition/master.svg?style=flat-square)](https://travis-ci.org/gajus/babel-plugin-transform-function-composition)
[![NPM version](http://img.shields.io/npm/v/babel-plugin-transform-function-composition.svg?style=flat-square)](https://www.npmjs.org/package/babel-plugin-transform-function-composition)
[![Canonical Code Style](https://img.shields.io/badge/code%20style-canonical-blue.svg?style=flat-square)](https://github.com/gajus/canonical)
[![Twitter Follow](https://img.shields.io/twitter/follow/kuizinas.svg?style=social&label=Follow)](https://twitter.com/kuizinas)

Transpiles [function-bind call expressions](https://github.com/babel/babel/tree/master/packages/babel-plugin-syntax-function-bind) to partially applied call expressions. Uses the invocation context to set the last parameter of the callee function.

Syntactically, the `babel-plugin-syntax-function-bind` also allows the reader to read the functions in left to right order of application, rather than reading from the innermost expression out.

* Familiar with [Ramda](http://ramdajs.com/)? This transpiler enables a syntactic sugar for [pipe](http://ramdajs.com/docs/#pipe) function.
* Coming from [Clojure](http://clojure.org/)? This transpiler enables a syntactic sugar for [thread-first](http://clojure.org/guides/threading_macros#thread-first) macro.

> ***BIG WARNING***: This is a proof-of-concept. See [Motivation](#motivation).

* [Example transpilation](#example-transpilation)
* [Motivation](#motivation)
  * [Participating](#participating)
* [ECMAScript Proposal](#ecmascript-proposal)
  * [Difference from This-Binding Syntax proposal](#difference-from-this-binding-syntax-proposal)
  * [Difference from the Pipeline Operator proposal](#difference-from-the-pipeline-operator-proposal)
  * [The reason for using the `::` syntax](#the-reason-for-using-the--syntax)
* [Usage examples](#usage-examples)
  * [Implementing Bluebird API](#implementing-bluebird-api)
  * [Composing Ramda functions](#composing-ramda-functions)

## Example transpilation

Input:

```js
apple
  ::foo('foo parameter 0', 'foo parameter 1')
  ::bar('bar parameter 0')
  ::baz('baz parameter 0');
```

Output:

```js
baz(
  'baz parameter 0',
  bar(
    'bar parameter 0',
    foo(
      'foo parameter 0',
      'foo parameter 1',
      apple
    )
  )
);
```

## Motivation

To make functional programming in JavaScript sweeter 🍧🍨🍦.

### Participating

Help this proposal to get more attention by spreading the word (or [retweet](https://twitter.com/kuizinas/status/798622847102959616) the original announcement)!

Participate in a [reddit](https://www.reddit.com/r/javascript/comments/5d4u2t/babel_plugin_that_adds_syntactic_sugar/) discussion to share your thoughts and suggestions.

## ECMAScript Proposal

There is no active proposal for this functionality.

I am looking for feedback. If there is sufficient interest, I will proceed with a proposal.

### Difference from This-Binding Syntax proposal

ECMAScript [This-Binding Syntax](https://github.com/tc39/proposal-bind-operator) proposal introduces a new operator `::` which performs `this` binding and method extraction, i.e.

The following input:

```js
foo::bar()::baz()
```

Becomes the following output:

```js
var _context;

(_context = (_context = foo, bar).call(_context), baz).call(_context);
```

`babel-plugin-transform-function-composition` uses the `::` operator to create a partially applied function such that the left hand side of the operator is set as the the first parameter to the target function on the right hand side, i.e.

The following input:

```js
foo::bar()::baz()
```

Becomes the following output:

```js
baz(bar(foo));
```

### Difference from the Pipeline Operator proposal

ECMAScript [Pipeline Operator](https://github.com/mindeavor/es-pipeline-operator) proposal introduces a new operator `|>` which is a syntactic sugar on a function call with a single argument. In other words, `sqrt(64)` is equivalent to `64 |> sqrt`.

The biggest difference between `::` and `|>` is that the latter permits only a single parameter.

> NOTE: There is no Babel transpiler for the Pipeline Operator proposal.
> See https://github.com/mindeavor/es-pipeline-operator/issues/33

### The reason for using the `::` syntax

The `::` syntax conflicts with the [This-Binding Syntax](https://github.com/tc39/proposal-bind-operator) proposal. However, at the time of writing this This-Binding Syntax proposal remains in stage 0 without an active champion (see [What's keeping this from Stage 1?](https://github.com/tc39/proposal-bind-operator/issues/24)). In the mean time, the syntax support has been added to Babel ([babel-plugin-syntax-function-bind](https://github.com/babel/babel/tree/master/packages/babel-plugin-syntax-function-bind)).

The reason for choosing the `::` operator for this proposal is to enable early adoption of this functionality.

> NOTE: Should this implementation develop into a proposal, it is possible that an alternative syntax will be proposed (e.g. `->>`).

## Usage examples

### Implementing Bluebird API

[Bluebird](http://bluebirdjs.com/) is a promise library that provides non-standard utilities used to abstract common `Promise` operations.

Here is an example of using [`Promise.map`](http://bluebirdjs.com/docs/api/promise.map.html) and [`Promise.filter`](http://bluebirdjs.com/docs/api/promise.filter.html):

```js
import Promise from 'bluebird';

Promise
  .resolve([
    'foo',
    'bar',
    'baz'
  ])
  .map((currentValue) => {
    return currentValue.toUpperCase();
  })
  .filter((currentValue) => {
    return currentValue.indexOf('B') === 0;
  });
```

Bluebird achieves this by providing a custom implementation of [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) object. This can be achieved by adding `map` and `filter` functions to the native `Promise.prototype`.

> Note: Augmenting the built-in prototype is considered an [anti-pattern](https://github.com/shichuan/javascript-patterns/blob/master/general-patterns/built-in-prototypes.html).
> This approach is mentioned only for the sake of completeness of the example.

You can use `::` to achieve an equivalent composition:

```js
const map = async (callback, promise) => {
  const values = await promise;

  return values.map(callback);
};

const filter = async (callback, promise) => {
  const values = await promise;

  return values.filter(callback);
};

Promise
  .resolve([
    'foo',
    'bar',
    'baz'
  ])
  ::map((currentValue) => {
    return currentValue.toUpperCase();
  })
  ::filter((currentValue) => {
    return currentValue.indexOf('B') === 0;
  });
```

In both cases, the result of the operation is:

```js
[
  'BAR',
  'BAZ'
]
```

Bluebird is heavy dependency (31Kb). Using function composition you have implemented equivalent functionality without the bundle size overhead.

### Composing Ramda functions

[Ramda](https://github.com/ramda/ramda) is a functional flavor utility library. Ramda is designed to enable build functions as sequences of simpler functions, each of which transforms the data and passes it along to the next.

Here is an example of using [`R.pipe`](http://ramdajs.com/docs/#pipe) to perform left-to-right function composition:

```js
import {
  assocPath,
  pipe
} from 'ramda';

pipe(
  assocPath(['repository', 'type'], 'git'),
  assocPath(['repository', 'url'], 'https://github.com/gajus/babel-plugin-transform-function-composition')
)({
  name: 'babel-plugin-transform-function-composition'
})
```

You can use `::` to achieve an equivalent composition:

```js
import {
  assocPath
} from 'ramda';

({
  name: 'babel-plugin-transform-function-composition'
})
  ::assocPath(['repository', 'type'], 'git')
  ::assocPath(['repository', 'url'], 'https://github.com/gajus/babel-plugin-transform-function-composition');

```

In both cases, the result of the operation is:

```js
{
  name: 'babel-plugin-transform-function-composition',
  repository: {
    type: 'git',
    url: 'https://github.com/gajus/babel-plugin-transform-function-composition'
  }
}
```
