import env from "../../env/dev.env.json";
import { existsSync, link, readFile, writeFile, statSync, readdirSync, mkdir } from "fs";
import { join } from "path";

export class FileService {

  private user: {
    user: string,
    dir: string,
    key: string
  };


  /**
   * Resolves the base directory
   *
   * @param {string} catalog
   * @return {Promise<string>}
   */
  public resolve(catalog: string): Promise<string> {
    if (typeof catalog === "undefined") {
      return this.config().then(data => data.dir);
    } else {
      return Promise.resolve(catalog);
    }
  }

  /**
   * Identifies the user
   *
   * @return {Promise<string>}
   */
  public identify(): Promise<string> {
    return this.config().then(data => data.key);
  }

  /**
   * Returns current user credentials
   *
   * @return {Promise<config>}
   */
  public config(): Promise<any> {
    if (this.user && this.user.hasOwnProperty("dir")) {
      return Promise.resolve(this.user);
    } else {

      const pathway = join(__dirname, env.configs.user);

      if (existsSync(pathway)) {
        return this.read(pathway)
          .then(data => {
            if (data) {
              this.user = JSON.parse(data.toString());
              return this.user;
            } else {
              throw new Error("User is not authenticated");
            }
          });
      } else {
        return Promise.reject("User is not authenticated");
      }
    }
  }

  /**
   * Persists user credentials locally
   *
   * @param {string} user
   * @param {string} token
   * @return {Promise<boolean>}
   */
  public persist(user: string, token: string): Promise<boolean> {
    if (
      typeof user !== "undefined" &&
      typeof token !== "undefined"
    ) {

      return this.write(
        join(__dirname, env.configs.user),
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
   * @return {Promise<string>}
   */
  public read(pathway: string): Promise<string> {
    return new Promise((resolve, reject) => {
      readFile(pathway, (err, data) => {
        if (err) {
          reject("Can't read data from the local file");
        } else {
          resolve(data.toString());
        }
      });
    });
  }

  /**
   * Makes a new name for a file
   *
   * @param {string} source
   * @param {string} output
   * @return {Promise<void>}
   */
  public link(source: string, output: string): Promise<void> {
    return new Promise((resolve, reject) => {
      link(source, output, err => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * Creates directory
   *
   * @param {string} pathname
   * @return {Promise<void>}
   */
  public mkdir(pathname: string): Promise<void> {
    return new Promise((resolve, reject) => {
      mkdir(pathname, err => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * Selects files from the directory
   *
   * @param {string} pathway
   * @return {Array<string>}
   */
  public pick(pathway: string): Array<string> {
    if (pathway && existsSync(pathway)) {

      return readdirSync(pathway).reduce((folder: string[], file: string): string[] => {
        const reference = pathway + "/" + file;

        if (statSync(reference).isDirectory()) {
          folder.push(...this.pick(reference));
        } else {
          folder.push(reference);
        }

        return folder;

      }, []);
    } else {
      throw new Error("Can't read from component directory");
    }
  }

  /**
   * Finds the root of the host project
   *
   * @param {Array<string>} segments
   * @return {Array<string>}
   */
  public grub(segments: string[]): string[] {

    if (Array.isArray(segments) && segments.length > 0) {

      const pathway = segments.join("/");

      const guess = [
        pathway + "/package.json",
        pathway + "/stencil.config.js",
        pathway + "/ionic.config.json"
      ];

      const root = guess.filter(route =>
        existsSync(route)
      );

      if (root && root.length) {
        return segments;
      } else {
        segments.pop();
        return this.grub(segments);
      }

    } else {
      throw new Error("Couldn't find root directory");
    }

  }
}
