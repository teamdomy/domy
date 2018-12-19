import env from "../../env/dev.env.json";
import { readFile, writeFile } from "fs";
import { join } from "path";

export class LocalRepository {

  /**
   * Returns the current user credentials
   *
   * @return {Promise<config>}
   */
  public get credentials(): Promise<{token: string, user: any}> {
    return Promise.all([
      this.read(join(__dirname, env.key)),
      this.read(join(__dirname, env.user))
    ]).then(data => {
      if (
        data[0] instanceof Buffer &&
        data[1] instanceof Buffer
      ) {

        return {
          token: JSON.parse(data[0].toString()),
          user: JSON.parse(data[1].toString())
        };
        // return Buffer.from(data.toString()).toString();
      } else {
        throw new Error("User is not authenticated");
      }
    });
  }

  /**
   * Writes data to the file
   *
   * @param {string} pathway
   * @param {string} data
   * @return {Promise<boolean>}
   */
  public write(pathway: string, data: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      writeFile(pathway, data, err => {
        if (err) {
          reject("Can't save data to the local file");
        } else {
          resolve(true);
        }
      });
    });
  }

  /**
   * Reads data from the file
   *
   * @param {string} pathway
   * @return {Promise<string | Buffer>}
   */
  public read(pathway: string): Promise<string | Buffer> {
    return new Promise((resolve, reject) => {
      readFile(pathway, (err, data) => {
        if (err) {
          reject("Can't read data from the local file");
        } else {
          resolve(data);
        }
      });
    });
  }

  /**
   * Creates a http route
   *
   * @param {string} type
   * @param {string} dir
   * @param {string} key
   * @return {string}
   */
  public sign(type: string, dir: string, key: string): string {
    if (typeof type === "string" && typeof key === "string" ) {
      return env.links[type] + "/" + dir + "/" + key;
    } else {
      throw new Error("Unable to create a http path");
    }
  }
}
