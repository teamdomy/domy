import env from "../../env/prod.env.json";
import { readFile, writeFile } from "fs";
import { join } from "path";

export class FileService {

  /**
   * Returns current user credentials
   *
   * @return {Promise<config>}
   */
  public get credentials(): Promise<any> {
      return this.read(join(__dirname, env.user))
        .then(data => {
          if (data) {
            return JSON.parse(data.toString());
          } else {
            throw new Error("User is not authenticated");
          }
        });
  }

  /**
   * Persists locally user credentials
   *
   * @param {string} user
   * @param {string} token
   * @return {Promise<boolean>}
   */
  public persist(user: string, token: string) {
    if (
      typeof user !== "undefined" &&
      typeof token !== "undefined"
    ) {

      return this.write(
        join(__dirname, env.user),
        JSON.stringify({
          user: user,
          dir: user,
          key: token
        })
      );

    } else {
      throw Error("Incomplete credentials");
    }
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
