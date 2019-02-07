[![Domy Header](https://storage.googleapis.com/domy/static/github.png)](http://domy.io)

a package manager for web components.
======================================


[![License](https://img.shields.io/hexpm/l/plug.svg)](https://github.com/teamdomy/domy/blob/master/LICENSE.md)
[![NPM](https://img.shields.io/npm/v/domy-cli.svg)](https://www.npmjs.com/package/domy-cli)
![Issues](https://img.shields.io/github/issues/teamdomy/domy.svg)

**Alpha Release**

It's a zero configuration package manager for web components based on [Stencil](https://github.com/ionic-team/stencil) compiler.

### Installation

Install `Domy` package using `NPM` registry:
```sh
npm install -g domy-cli
```

### Utilization

Sign up by using your `username`, `password` and `email`:
```sh
domy signup
```


To log in to the system from another computer run:
```sh
domy login
```
*`username` and `password` will be required*

Compile the project by running the local Stencil version or `Domy` inner version:
```sh
domy compile
```

Publish all compiled components by submitting the whole directory:
```sh
domy publish --release 0.1.0
```
 *Execute the command in the root (base) directory of your project*   
 *The release semver is optional. Non-versioned components will be sent to the **master** branch*


Publish a specific component by passing its **class name**
```sh
domy publish MyComponent --release 0.1.0
```

To install the component in another project, run the command (in the root directory):
```sh
domy install MyComponent --release 0.1.0
```

*Installed components are tracked in package.json*

To install all components listed in package.json `webcomponents` compartment:

```sh
domy install
```

Components are installed in the **node_modules/@domy** directory and are imported as usual.

```js
// master is a non-versioned release
import "@domy/MyComponent/master" // or

// 0.1.0 is a versioned release
import "@domy/MyComponent/0.1.0"
```

Remove component from the registry (unpublish it):
```sh
domy remove MyComponent
```
