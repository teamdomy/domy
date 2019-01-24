import { IncomingMessage, RequestOptions, request } from "http";
import env from "../../env/dev.env.json";

export class HttpService {

  /**
   * Makes a http get request
   *
   * @param {string[]} options
   * @return {Promise<string>}
   */
  public get(options: Array<string>): Promise<string> {
    return this.request({
      method: "GET",
      path: this.trail(options)
    });
  }

  /**
   * Makes a http post request
   *
   * @param {<string>[]} options
   * @param {string} value
   * @return {Promise<string>}
   */
  public post(options: Array<string>, value: string): Promise<string> {
      return this.request({
        method: "POST",
        path: this.trail(options),
        headers: {
          "Content-Length": Buffer.byteLength(value)
        }
      }, value);
  }

  /**
   * Makes a http put request
   *
   * @param {<string>[]} options
   * @param {string} key
   * @param {string} value
   * @return {Promise<string>}
   */
  public put(options: Array<string>, key: string, value: string): Promise<string> {
    return this.request({
      method: "PUT",
      path: this.trail(options),
      headers: {
        "Content-Length": Buffer.byteLength(value),
        "X-Domy-Token": key
      }
    }, value);
  }

  /**
   * Makes a http delete request
   *
   * @param {<string>[]} options
   * @param {string} key
   * @return {Promise<string>}
   */
  public delete(options: Array<string>, key: string): Promise<string> {
    return this.request({
      method: "DELETE",
      path: this.trail(options),
      headers: {
        "X-Domy-Token": key
      }
    });
  }

  /**
   * Wraps a http request
   *
   * @param {RequestOptions} options
   * @param {string} data
   * @return {Promise<string>}
   */
  public request(options: RequestOptions, data?: string): Promise<string> {

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

      if (data !== undefined && data.length) {
        query.write(data);
      }

      query.end();
    });
  }

  /**
   * Creates a http route
   *
   * @param {string[]} options
   * @return {string}
   */
  public trail(options: string[]): string {
    if (Array.isArray(options) && options.length) {
      return options.reduce((a, b) => a + "/" + b);
    } else {
      throw new Error("Unable to create a http path");
    }
  }

}
