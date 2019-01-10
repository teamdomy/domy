import { HttpService } from "./http.service";
import { FileService } from "./file.service";
import { existsSync, mkdirSync } from "fs";

export class DomService {

  constructor(
    private ht = new HttpService(),
    private fl = new FileService()
  ) {

  }

  /**
   * Lists files in the registry
   *
   * @param {string} catalog
   * @param {string} name
   * @param {string} version
   * @return {Promise<string[]>}
   */
  public list(catalog: string, name: string, version: string): Promise<string[]> {
    return this.fl.resolve(catalog).then(dir =>
      this.ht.get(["etc", dir, name, version])
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
   * Pulls a file from the registry
   *
   * @param {string} file
   * @return {Promise<string>}
   */
  public get(file: string): Promise<string> {
    return this.ht.get(["pkg", file])
      .then(result => {
        if (result && result.length) {
          return result;
        } else {
          throw new Error("The component is undefined");
        }
      });
  }

  /**
   * Sends a file to the registry
   *
   * @param {string} catalog
   * @param {string} name
   * @param {string} version
   * @param {string} file
   * @param {string} content
   * @return {Promise<string>}
   */
  public set(
    catalog: string,
    name: string,
    version: string,
    file: string,
    content: string
  ): Promise<string> {
    return this.fl.resolve(catalog).then(dir =>
      this.fl.identify().then(key =>
        this.ht.put(["lib", dir, name, version, file], key, content)
      )
    );
  }

  /**
   * Removes a file from the registry
   *
   * @param {string} file
   * @return {Promise<string>}
   */
  public del(file: string): Promise<string> {
    return this.fl.identify().then(key =>
      this.ht.delete(["pkg", file], key)
    );
  }

  /**
   * Prepares directory contents
   *
   * @param {string} pathway
   * @return {Promise<any[]}
   */
  public prepare(pathway: string): Promise<any[]> {
    return this.fl.collect(process.cwd() + "/" + pathway);
  }

  /**
   * Saves a file locally
   *
   * @param {string} pathway
   * @param {string} content
   * @return {Promise<boolean>}
   */
  public save(pathway: string, content: string): Promise<boolean> {

    const segments = this.fl.grub(
      process.cwd().split("/")
    );

    const home = segments.join("/") + "/webcomponents";

    if (!existsSync(home)) {
      mkdirSync(home);
    }

    return this.fl.write(home + pathway, content);
  }

}
