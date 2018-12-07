import http from "http";
import { readFile, writeFile} from "fs";
import env from "../../env/dev.env.json";

export class DataService {

  /**
   * Makes http get request
   *
   * @param {string} kind
   * @param {string} key
   * @return {Promise<string>}
   */
  public get(kind: string, key: string): Promise<string> {

    if (
      typeof kind === "string" &&
      typeof key === "string"
    ) {

      return this.getRecord().then(config => {
        if (config.app !== "undefined") {
          return this.request({
            hostname: env.host,
            method: "GET",
            port: env.port,
            path: env.links[kind] + "/" + config.app + "/" + key,
          }).then(data => JSON.parse(data));
        } else {
          throw new Error("User is not logged in");
        }
      });
    } else {
      throw new Error("Unable to make http get request");
    }
  }

  /**
   * Makes http put request
   *
   * @param {string} kind
   * @param {string} key
   * @param {any} value
   * @return {Promise<string>}
   */
  public put(kind: string, key: string, value: any): Promise<string> {

    if (
      typeof kind === "string" &&
      typeof key === "string" &&
      typeof value !== "undefined"
    ) {

      return this.getRecord().then(config => {
        if (
          config.app !== "undefined" &&
          config.token !== "undefined"
        ) {

          const data = JSON.stringify(value);

          return this.request({
            hostname: env.host,
            method: "PUT",
            port: env.port,
            path: env.links[kind] + "/" + config.app + "/" + key,
            headers: {
              "Content-Type": "application/json",
              "Content-Length": Buffer.byteLength(data),
              "X-Domy-Token": config.token
            }
          }, data);
        } else {
          throw new Error("User is not logged in");
        }
      });
    } else {
      throw new Error("Unable to make http put request");
    }
  }

  /**
   * Makes http post request
   *
   * @param {string} kind
   * @param {string} key
   * @param {string} app
   * @param {any} value
   * @return {Promise<string>}
   */
  public post(kind: string, key: string, app: string, value: any): Promise<string> {

    if (
      typeof kind === "string" &&
      typeof key === "string" &&
      typeof value !== "undefined"
    ) {

      const data = JSON.stringify(value);

      // POST should never be used with metadata directly
      return this.request({
        hostname: env.host,
        method: "POST",
        port: env.port,
        path: env.links[kind] + "/" + app + "/" + key,
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(data)
        }
      }, data);
    } else {
      throw new Error("Unable to make http post request");
    }
  }

  /**
   * Makes http delete request
   *
   * @param {string} kind
   * @param {string} key
   * @return {Promise<string>}
   */
  public delete(kind: string, key: string): Promise<string> {

    if (
      typeof kind === "string" &&
      typeof key === "string"
    ) {

      return this.getRecord().then(config => {
        if (
          config.app !== "undefined" &&
          config.token !== "undefined"
        ) {

          return this.request({
            hostname: env.host,
            method: "DELETE",
            port: env.port,
            path: env.links[kind] + "/" + config.app + "/" + key,
            header: {
              "X-Domy-Token": config.token
            }
          });
        } else {
          throw new Error("User is not logged in");
        }
      });
    } else {
      throw new Error("Unable to make http delete request");
    }
  }

  /**
   * Wraps http request
   *
   * @param {any} options
   * @param {any} data
   * @return {Promise<string>}
   */
  public request(options, data?: any): Promise<string> {
    return new Promise((resolve, reject) => {
      const request = http.request(options, response => {
        if (response.statusCode === 200) {
          let result = "";
          response.setEncoding("utf8");
          response.on("data", chunk => result += chunk);
          response.on("error", error => reject(error));
          response.on("end", () => resolve(result));
        } else {
          reject(response.statusMessage);
        }
      });

      request.on("error", error => reject(error));

      if (data) {
        request.write(data);
      }

      request.end();
    });
  }

  /**
   * Returns current user credentials
   *
   * @return {Promise<config>}
   */
  public getRecord(): Promise<any>  {
    return this.read(env.config).then(data => {
      if (data instanceof Buffer) {
        return JSON.parse(
          Buffer.from(data.toString(), "base64").toString()
        );
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
   * @return {Promise<string>}
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
}
