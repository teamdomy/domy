import env from "../../env/dev.env.json";
import user from "../configs/user.config.json";

export class WebRepository {

  /**
   * Makes the sync http get request
   *
   * @param {string} type
   * @param {string} key
   * @param {string} dir
   * @return {Function}
   */
  public wait(type: string, key: string): string {
    if (user.dir) {
      return JSON.parse(
        this.expect({
          method: "GET",
          path: env.links[type] + "/" + user.dir + "/" + key
        })
      );
    } else {
      throw new Error("Couldn't find user credentials");
    }
  }

  /**
   * Wraps the http request in a Promise
   *
   * @param {any} options
   * @param {any} data
   * @return {Promise<string>}
   */
  public request(options, data = null): Promise<string> {

    return new Promise((resolve, reject) => {

      const request = new XMLHttpRequest();
      const path = env.host + ":" + env.port + options.hostname;

      request.onload = () => resolve(request.responseText);
      request.onerror = () => reject("Unable to make HTTP request");

      for (const key in options.header) {
        if (options.header.hasOwnProperty(key)) {
          request.setRequestHeader(
            options.header[key].name,
            options.header[key].value
          );
        }
      }

      request.open(options.method, path);
      request.send(data);
    });

  }

  /**
   * Makes the BLOCKING http request
   *
   * @deprecated since version 1.0
   * @param options
   */
  public expect(options): string {

    const request = new XMLHttpRequest();
    const path = env.host + ":" + env.port + options.hostname;

    request.setRequestHeader("X-Domy-Origin", "web");
    request.open(options.method, path, false);  // `false` makes the request synchronous
    request.send(null);

    if (request.status === 200) {
      return request.responseText;
    } else {
      throw new Error("Unable to make HTTP request");
    }
  }
}
