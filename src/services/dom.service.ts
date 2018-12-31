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
   * Extracts the data structure from the system
   *
   * @param {string} catalog
   * @param {string} name
   * @return {Promise<string>}
   */
  public get(catalog: string, name: string): Promise<string> {
    return this.ht.get("dom", catalog, name)
      .then(data => {
        if (data) {
          return JSON.parse(data);
        } else {
          throw new Error("The component is undefined");
        }
      });
  }

  /**
   * Inserts the data structure in the system
   *
   * @param {string} catalog
   * @param {string} name
   * @param {string} content
   * @return {Promise<string>}
   */
  public set(catalog: string, name: string, content: any[]): Promise<string> {
    return this.ht.put("dom", catalog, name, content);
  }

  /**
   * Removes the data structure from the system
   *
   * @param {string} catalog
   * @param {string} name
   * @return {Promise<string>}
   */
  public del(catalog: string, name: string): Promise<string> {
    return this.ht.delete("dom", catalog, name);
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
   * Saves the data structure in the file
   *
   * @param {string} catalog
   * @param {string} name
   * @param {string} pathway
   * @param {string} content
   * @return {Promise<boolean>}
   */
  public save(
    catalog: string,
    name: string,
    pathway: string,
    content: string
  ): Promise<boolean> {

    let address: string;

    if (typeof pathway !== "undefined") {
      address = pathway;
    } else {
      const segments = this.uproot(
        process.cwd().split("/")
      );

      const root = segments.join("/") + "/components";

      if (!existsSync(root)) {
        mkdirSync(root);
      }

      address = root;

      // recreate remote catalog locally
      if (typeof catalog !== "undefined") {
        address += "/" + catalog;
      }
    }

    address += "/" + name + ".js";

    return this.fl.write(address, content);
  }

  /**
   * Finds the root of the host project
   *
   * @param {Array<string>} segments
   * @return {Array<string>}
   */
  public uproot(segments: string[]): string[] {
    const pathway = segments.join("/") + "/package.json";

    if (Array.isArray(segments) && segments.length > 0) {

      if (existsSync(pathway)) {
        return segments;
      } else {
        segments.pop();
        return this.uproot(segments);
      }

    } else {
      throw new Error("Can't find root directory with npm");
    }

  }
}
