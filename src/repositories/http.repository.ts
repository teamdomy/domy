import { request } from "http";
import env from "../../env/dev.env.json";
import { LocalRepository } from "./local.repository";

export class HttpRepository {

  constructor(
    private lr = new LocalRepository()
  ) {

  }

  /**
   * Makes the http get request
   *
   * @param {string} type
   * @param {string} dir
   * @param {string} key
   * @return {Promise<string>}
   */
  public get(type: string, dir: string, key: string): Promise<string> {

    return this.lr.credentials.then(config => {

      const index = dir ? dir : config.user.dir;

      return this.request({
        method: "GET",
        path: this.lr.sign(type, index, key),
      });
    });


  }

  /**
   * Makes the http put request
   *
   * @param {string} type
   * @param {string} dir
   * @param {string} key
   * @param {any} value
   * @return {Promise<string>}
   */
  public put(type: string, dir: string, key: string, value: any): Promise<string> {

    if (typeof value !== "undefined") {
      return this.lr.credentials.then(config => {

        const index = dir ? dir : config.user.dir;
        const data = JSON.stringify(value);

        return this.request({
          method: "PUT",
          path: this.lr.sign(type, index, key),
          headers: {
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(data),
            "X-Domy-Token": config.token
          }
        }, data);

      });
    } else {
      throw new Error("Unable to make http put request");
    }
  }

  /**
   * Makes the http post request
   *
   * @param {string} type
   * @param {string} key
   * @param {any} value
   * @return {Promise<string>}
   */
  public post(type: string, key: string, value: any): Promise<string> {

    if (typeof value !== "undefined") {

      const data = JSON.stringify(value);
      const pathway = env.links[type] + "/" + key;

      return this.request({
        method: "POST",
        path: pathway,
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
   * Makes the http delete request
   *
   * @param {string} type
   * @param {string} dir
   * @param {string} key
   * @return {Promise<string>}
   */
  public delete(type: string, dir: string, key: string): Promise<string> {

    return this.lr.credentials.then(config => {

      const index = dir ? dir : config.user.dir;

      return this.request({
        method: "DELETE",
        path: this.lr.sign(type, index, key),
        headers: {
          "X-Domy-Token": config.token
        }
      });
    });
  }

  /**
   * Blocks the http get request
   *
   * @deprecated since version 0.5.0
   *
   * on the feature approval:
   * - remove the loop
   * - move it to the separate process
   *
   * @param {string} type
   * @param {string} dir
   * @param {string} key
   * @return {string}
   */
  public wait(type: string, dir: string, key: string): string {

    let response: string;

    this.get(type, dir, key)
      .then(data => response = data);

    setTimeout(() => {
      response = "domy:timeout";
      throw new Error("Load timeout for component");
    }, 3000);

    while (!response) {}

    return response;
  }

  /**
   * Wraps the http request
   *
   * @param {any} options
   * @param {any} data
   * @return {Promise<string>}
   */
  public request(options, data?): Promise<string> {

    options.port = env.port;
    options.hostname = env.host;

    return new Promise((resolve, reject) => {
      const query = request(options, response => {
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

      query.on("error", error => reject(error));

      if (data) {
        query.write(data);
      }

      query.end();
    });
  }

}
