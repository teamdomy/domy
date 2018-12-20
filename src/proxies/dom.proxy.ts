import { HttpRepository } from "../repositories/http.repository";


/**
 * Proxies "require" method
 *
 * @return {Promise<any>}
 */

if (typeof Proxy !== "undefined") {

  const hr = new HttpRepository();

  module.exports = new Proxy(Object, {
    get: (target, property) => {
      const result = hr.wait("deprecated", "", <string>property);
      return new Function(result)();
    }
  });

} else {
  throw new Error("Unable to instantiate a Proxy");
}
