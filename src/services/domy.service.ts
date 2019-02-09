import { HttpService } from "./http.service";
import { FileService } from "./file.service";
import { existsSync, mkdirSync } from "fs";
import { join } from "path";
import { PackService } from "./pack.service";

export class DomyService {

  constructor(
    private httpService = new HttpService(),
    private fileService = new FileService(),
    private packService = new PackService()
  ) {

  }

  /**
   * Lists files in the catalog
   *
   * @param {string} catalog
   * @param {string} title
   * @param {string} version
   * @return {Promise<string[]>}
   */
  public list(catalog: string, title: string, version: string): Promise<string[]> {

    const release = this.fileService.versioning(version);

    return this.fileService.resolve(catalog).then(dir =>
      this.httpService.get(["/etc", dir, title, release])
        .then(result => {
          if (result && result.length) {
            return JSON.parse(result);
          } else {
            throw new Error("Can't list component contents");
          }
        })
    );
  }

  /**
   * Pulls files from the registry
   *
   * @param {string} file
   * @return {Promise<string>}
   */
  public get(file: string): Promise<string> {
    return this.httpService.get(["/" + file])
      .then(result => {
        if (result && result.length) {
          return result;
        } else {
          throw new Error("The component is undefined");
        }
      });
  }

  /**
   * Pushes files to the registry
   *
   * @param {string} catalog
   * @param {string} name
   * @param {string} version
   * @param {string} pathway
   * @param {string} content
   * @return {Promise<string>}
   */
  public set(
    catalog: string,
    name: string,
    version: string,
    pathway: string,
    content: string
  ): Promise<string> {
    return this.fileService.resolve(catalog).then(dir =>
      this.fileService.identify().then(key =>
        this.httpService.put(["/lib", dir, name, version, pathway], key, content)
      )
    );
  }

  /**
   * Removes files from the registry
   *
   * @param {string} file
   * @return {Promise<string>}
   */
  public del(file: string): Promise<string> {
    return this.fileService.identify().then(key =>
      this.httpService.delete(["/lib", file], key)
    );
  }

  /**
   * Gathers transpiled components
   *
   * @param {string} name
   * @param {string} version
   * @param {string} catalog
   * @return {string} {Promise<void>}
   */
  public async gather(name: string, version: string, catalog: string): Promise<void> {

    const base = this.fileService.grub();

    // todo: get output dir (dist) from stencil config
    const collection = "dist/collection/collection-manifest.json";
    const webcomponents = "dist/web-components.json";

    const manifest = await this.fileService.read(
      join(base, collection)
    ).then(data => JSON.parse(data));

    const details = await this.fileService.read(
      join(base, webcomponents)
    ).then(data => JSON.parse(data));

    let components: Array<any>;

    const release = this.fileService.versioning(version);

    if (name !== undefined) {
      components = manifest.components.filter(component =>
        name === component.componentClass
      );
    } else {
      components = manifest.components;
    }

    this.fileService.inspect(base, components);

    for (const component of components) {

      const title = component.componentClass;
      const styles = component.styles["$"].stylePaths;
      const pipe = this.pipe(title, base, release, catalog);

      // collection manifest
      await  pipe(collection, JSON.stringify({
          components: [component],
          collections: manifest.collections,
          compiler: manifest.compiler,
          global: manifest.global
      }));

      // component details
      await pipe(webcomponents, JSON.stringify({
        tags: details.tags.filter(tag =>
          tag.label === component.tag
        )
      }));

      // component js
      await pipe(join("dist", "collection", component.componentPath));

      // component styles
      for (const style of styles) {
        await pipe(join("dist", "collection", style));
      }

    }

  }

  /**
   * Scatters transpiled components
   *
   * @param {string} catalog
   * @param {string} component
   * @param {string} version
   */
  public scatter(catalog: string, component: string, version: string): Promise<boolean[]> {

    return this.packService.read(component, version)
      .then(components =>
        Promise.all(Object.keys(components).map(key =>
          this.fileService.clear(catalog, key, components[key])
            .then(() => this.list(catalog, key, components[key]))
            .then(files =>
              Promise.all(files.map(file =>
                this.get(file).then(content =>
                    this.save(catalog, key, file, content)
                  )
                )
              )
            )
            .then(() =>
              component ? this.packService.update(key, version) : true
            )
        ))
    );
  }

  /**
   * Pipes files using http
   *
   * @param {string} name
   * @param {string} base
   * @param {string} version
   * @param {string} catalog
   * @return {(a,b?) => Promise<void>}
   */
  public pipe(
    name: string,
    base: string,
    version: string,
    catalog: string
  ): (a, b?) => Promise<void> {

    return (pathway: string, content?: string) => Promise.resolve()
      .then(() =>
        content ? content : this.fileService.read(join(base, pathway))
      )
      .then(data => {
        const bulk = data ? data : "\n";
        this.set(catalog, name, version, pathway, bulk);
      });
  }

  /**
   * Saves files (local fs)
   *
   * @param {string} catalog
   * @param {string} component
   * @param {string} pathway
   * @param {string} content
   * @return {Promise<boolean>}
   */
  public save(
    catalog: string,
    component: string,
    pathway: string,
    content: string
  ): Promise<boolean> {

    const root = this.fileService.grub();

    const domy = join(root, "node_modules", "@domy");
    const base = catalog ? join(domy, catalog) : domy;

    [domy, base].forEach(point => {
      if (!existsSync(point)) {
        mkdirSync(point);
      }
    });

    const address = pathway.substring(
      pathway.indexOf(component)
    );

    const dirs = address.split("/");
    let acc = "";

    //  purposely ignored last index (filename)
    for (let i = 0; i < dirs.length - 1; i++) {
      acc = join(acc, dirs[i]);
      const absolute = join(base, acc);
      if (!existsSync(absolute)) {
        mkdirSync(absolute);
      }
    }

    return this.fileService.write(join(base, address), content);

  }

  /**
   * Checks component name
   *
   * @param {string} name
   * @return {Promise<boolean>}
   */
  public assert(name: string): Promise<boolean> {

    return new Promise((resolve, reject) => {
      if (name === undefined) {
        resolve(false);
      } else if (
        name.length >= 2 &&
        /^[a-zA-Z0-9_\-\_]*$/.test(name)
      ) {
        resolve(true);
      } else {
        reject("Component name should contain at least 2 alphanumeric chars");
      }
    });
  }

}
