import { HttpRepository } from "../repositories/http.repository";
import { LocalRepository } from "../repositories/local.repository";
import { existsSync, mkdirSync } from "fs";

export class DomService {

  constructor(
    private hr = new HttpRepository(),
    private lr = new LocalRepository()
  ) {

  }

  /**
   * Extracts the data structure from the system
   *
   * @param {string} dir
   * @param {string} name
   * @return {Promise<string>}
   */
  public get(dir: string, name: string): Promise<string> {
    return this.hr.get("dom", dir, name)
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
   * @param {string} dir
   * @param {string} name
   * @param {string} content
   * @return {Promise<string>}
   */
  public set(dir: string, name: string, content: string): Promise<string> {
    return this.hr.put("dom", dir, name, content);
  }

  /**
   * Removes the data structure from the system
   *
   * @param {string} dir
   * @param {string} name
   * @return {Promise<string>}
   */
  public del(dir: string, name: string): Promise<string> {
    return this.hr.delete("dom", dir, name);
  }

  /**
   * Saves the data structure in the file
   *
   * @param {string} dir
   * @param {string} name
   * @param {string} pathway
   * @param {string} content
   * @return {Promise<boolean>}
   */
  public save(
    dir: string,
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

      address = root

      // recreate remote dir locally
      if (typeof dir !== "undefined") {
        address += "/" + dir;
      }
    }

    address += "/" + name + ".js";

    return this.lr.write(address, content);
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
