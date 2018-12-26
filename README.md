<img src="https://avatars3.githubusercontent.com/u/43493912?s=200&v=4" alt="Domy Logo" width="75" height="75">  Domy: package manager for components
======================================


[![License](https://img.shields.io/hexpm/l/plug.svg)](https://github.com/teamdomy/domy-cli/blob/master/LICENSE.md)
[![NPM](https://img.shields.io/npm/v/domy-cli.svg)](https://www.npmjs.com/package/domy-cli)
![Issues](https://img.shields.io/github/issues/teamdomy/domy-cli.svg)

Domy is a zero configuration package manager for components. It helps you to publish and to reuse any component directly from an existing app, no metadata or configuration files required.
Basically, Domy will reuse the configuration data of your main app (ex. webpack.config.js) to transpile the component.

It's an **alpha release**, it works only with React components with simple configuration.

### Installation

Install `Domy` package using `NPM` registry:
```sh
npm install -g domy-cli
```


### Utilization

Sign up with your `username`, `password` and `email`:
```sh
domy signup
```


To log in to the system (credentials are stored locally):
```sh
domy login
```
*`username` and `password` will be required*


To save any component in the registry, navigate to the component's directory and execute:
```sh
domy publish <name> <file>
```
 - *where `name` is the component name*
 - *and `file` is path to the file*
 
 *(ex. domy publish ComponentName ComponentFile.js)*


Now, to install the component, navigate to the root directory of another project and run:
```sh
domy install <name>
```
(*ex. domy install ComponentName*)

*New directory named `components` will be created in the root of your app (where package.json is located), installed `component` will be saved there. It can be required as a simple file/module with relative path*

Remove the component from your registry (local file won't be deleted):
```sh
domy unpublish ComponentName
```

