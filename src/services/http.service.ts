import { RequestOptions, request } from "https";
import { IncomingMessage } from "http";
import env from "../../env";

export class HttpService {

  /**
   * Makes a http get request
   *
   * @param {string[]} segments
   * @return {Promise<string>}
   */
  public get(segments: Array<string>): Promise<string> {

    const options = {
      port: env.port,
      method: "GET",
      path: this.trail(segments)
    };

    if (
      segments[0] !== undefined &&
      ~segments[0].indexOf("pkg")
    ) {
      options["hostname"] = env.links.pkg;
    } else {
      options["hostname"] = env.links.src;
    }

    return this.request(options);
  }

  /**
   * Makes a http post request
   *
   * @param {<string>[]} segments
   * @param {string} value
   * @return {Promise<string>}
   */
  public post(segments: Array<string>, value: string): Promise<string> {

      return this.request({
        hostname: env.links.src,
        port: env.port,
        method: "POST",
        path: this.trail(segments),
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(value)
        }
      }, value);
  }

  /**
   * Makes a http put request
   *
   * @param {<string>[]} segments
   * @param {string} key
   * @param {string} value
   * @return {Promise<string>}
   */
  public put(segments: Array<string>, key: string, value: string): Promise<string> {
    return this.request({
      hostname: env.links.src,
      port: env.port,
      method: "PUT",
      path: this.trail(segments),
      headers: {
        "Content-Length": Buffer.byteLength(value),
        "X-Domy-Token": key
      }
    }, value);
  }

  /**
   * Makes a http delete request
   *
   * @param {<string>[]} segments
   * @param {string} key
   * @return {Promise<string>}
   */
  public delete(segments: Array<string>, key: string): Promise<string> {
    return this.request({
      hostname: env.links.src,
      port: env.port,
      method: "DELETE",
      path: this.trail(segments),
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
   * @param {string[]} segments
   * @return {string}
   */
  public trail(segments: string[]): string {
    if (Array.isArray(segments) && segments.length) {
      return segments.reduce((a, b) => a + "/" + b);
    } else {
      throw new Error("Unable to create a http path");
    }
  }

}
