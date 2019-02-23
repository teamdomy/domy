a Custom Elements storage
======================================

[![License](https://img.shields.io/hexpm/l/plug.svg)](https://github.com/teamdomy/domy/blob/master/LICENSE.md)
[![NPM](https://img.shields.io/npm/v/domy-cli.svg)](https://www.npmjs.com/package/domy-cli)
![Issues](https://img.shields.io/github/issues/teamdomy/domy.svg)

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

Log in to the system from another computer or using another account:
```sh
domy login
```

Build the project by running Stencil compiler, `Domy` comes with the latest one:
```sh
domy compile
```

Publish all compiled components by submitting the whole directory:
```sh
domy publish --version 0.1.0
```
 *Execute the command in the root (base) directory of your project*   
 *The version is optional. Non-versioned components will be sent to the **master** branch*

It's possible to publish just one component by passing its **class name**
```sh
domy publish MyComponent --version 0.1.0
```

Install the component in another project using its **class name**:
```sh
domy install MyComponent --version 0.1.0
```

*Installed components will be tracked in package.json `webcomponents` compartment*

To install all components listed in package.json `webcomponents` compartment, drop the **class name**:

```sh
domy install
```

Components are installed in the **node_modules/@** directory and could be reused in another **Stencil** application:

```js
// master is a non-versioned release
import "@/MyComponent/master" // or

// 0.1.0 is a versioned release
import "@/MyComponent/0.1.0"
```

Remove a component from the registry (unpublish it):
```sh
domy remove MyComponent --purge
```
