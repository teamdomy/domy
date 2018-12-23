import { IncomingMessage, RequestOptions, request } from "http";
import env from "../../env/dev.env.json";
import { FileService } from "./file.service";

export class HttpService {

  constructor(
    private fl = new FileService()
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

    return this.fl.credentials.then(config => {

      const index = dir ? dir : config.dir;

      return this.request({
        method: "GET",
        path: this.fl.sign(type, index, key),
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
      return this.fl.credentials.then(config => {

        const index = dir ? dir : config.dir;
        const data = JSON.stringify(value);

        return this.request({
          method: "PUT",
          path: this.fl.sign(type, index, key),
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

    return this.fl.credentials.then(config => {

      const index = dir ? dir : config.dir;

      return this.request({
        method: "DELETE",
        path: this.fl.sign(type, index, key),
        headers: {
          "X-Domy-Token": config.token
        }
      });
    });
  }

  /**
   * Wraps the http request
   *
   * @param {any} options
   * @param {any} data
   * @return {Promise<string>}
   */
  public request(options: RequestOptions, data?: any): Promise<string> {

    options.port = env.port;
    options.hostname = env.host;

    return new Promise((resolve, reject) => {
      const query = request(options, (response: IncomingMessage) => {
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
