import env from "../../env/prod.env.json";
import { existsSync, readdir, readFile, writeFile, statSync } from "fs";
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
      return this.read(join(__dirname, env.configs.user))
        .then(data => {
          if (data) {
            this.user = JSON.parse(data.toString());
            return this.user;
          } else {
            throw new Error("User is not authenticated");
          }
        });
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
   * Collects directory contents
   *
   * @param {string} pathway
   * @return {Promise<any[]>}
   */
    public collect(pathway: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
      if (pathway && existsSync(pathway)) {
        readdir(pathway, (err, data) => {
          if (err) {
            reject(err);
          } else {
            resolve(Promise.all(
              data.map(async name => {

                const link = pathway + "/" + name;

                if (statSync(link).isDirectory()) {
                  return {
                    type: "dir",
                    name: name,
                    list: await this.collect(link)
                  };
                } else {
                  return {
                    type: "file",
                    name: name,
                    content: await this.read(link)
                  };
                }

              })
            ));
          }
        });
      } else {
        reject("Can't read data from the directory");
      }
    });
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
        existsSync(pathway)
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
