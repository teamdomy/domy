import env from "../../env";
import { join } from "path";
import {
  existsSync,
  link,
  readFile,
  writeFile,
  statSync,
  readdirSync,
  mkdir,
  lstatSync,
  unlinkSync,
  rmdirSync
} from "fs";


export class FileService {

  protected segments: string;

  protected user: {
    user: string,
    dir: string,
    key: string
  };


  /**
   * Returns current user credentials
   *
   * @return {Promise<config>}
   */
  public configure(): Promise<any> {
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
   * Resolves the base directory
   *
   * @param {string} catalog
   * @return {Promise<string>}
   */
  public resolve(catalog: string): Promise<string> {
    if (typeof catalog === "undefined") {
      return this.configure().then(data => data.dir);
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
    return this.configure().then(data => data.key);
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
          reject("Can't save data locally");
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
          reject("Can't read data from the file");
        } else {
          resolve(data.toString());
        }
      });
    });
  }

  /**
   * Creates a link to the file
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
   * Creates a directory
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
   * @param {string} base
   * @param {string} dir
   * @return {Array<string>}
   */
  public pick(base: string, dir: string): Array<string> {

    const pathway = join(base, dir);

    if (pathway && existsSync(pathway)) {

      return readdirSync(pathway).reduce((folder: string[], file: string): string[] => {
        const reference = join(pathway, file);
        const address = join(dir, file);

        if (statSync(reference).isDirectory()) {
          folder.push(...this.pick(base, address));
        } else {
          folder.push(address);
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
   * @return {Array<string>}
   */
  public grub(): string {

    if (this.segments !== undefined) {
      return this.segments;
    } else {

      const delve = (segments: Array<string>) => {
        if (Array.isArray(segments) && segments.length > 0) {

          const pathway = segments.join("/");
          const guesses = [
            join(pathway, "package.json"),
            join(pathway, "stencil.config.js"),
            join(pathway, "ionic.config.json")
          ];

          const root = guesses.filter(route =>
            existsSync(route)
          );

          if (root && root.length) {
            this.segments = segments.join("/");
            return this.segments;
          } else {
            segments.pop();
            return delve(segments);
          }

        } else {
          throw new Error("Couldn't find root directory");
        }
      };

      return delve(
        process.cwd().split("/")
      );
    }

  }

  /**
   * Removes a directory recursively
   *
   * @param {string} directory
   * @return {void}
   */
  public rimraf(directory: string): void {
    if (existsSync(directory)) {
      readdirSync(directory).forEach(entry => {
        const pathway = join(directory, entry);
        if (lstatSync(pathway).isDirectory()) {
          this.rimraf(pathway);
        } else {
          unlinkSync(pathway);
        }
      });
      rmdirSync(directory);
    }
  }

  /**
   * Inspects compiled files
   *
   * @param {string} root
   * @param {any[]} components
   * @return {void}
   */
  public inspect(root: string, components: any[]): void {

    const message = "Unable to find compiled files";

    if (root && Array.isArray(components) && components.length) {
      const base = join(root, "dist", "collection");
      for (const component of components) {

        const styles = Object.keys(component.styles)
          .reduce((acc, key) => {
            if (
              component.styles.hasOwnProperty(key) &&
              component.styles[key].stylePaths.length
            ) {
              acc = acc.concat(component.styles[key].stylePaths);
            }

            return acc;
            }, []);

        if (!existsSync(join(base, component.componentPath))) {
          throw new Error(message);
        }

        for (const style of styles) {
          if (!existsSync(join(base, style))) {
            throw new Error(message);
          }
        }

      }
    }
  }

  /**
   * Removes previously installed components
   *
   * @param {string} catalog
   * @param {string} component
   * @param {string} release
   * @return {void}
   */
  public clear(catalog: string, component: string, release: string): Promise<void> {

    return this.resolve(catalog).then(dir => {
      const root = this.grub();
      const version = this.versioning(release);

      return this.rimraf(
        join(root, "node_modules", "@", dir, component, version)
      );
    });
  }

  /**
   * Resolves current component version
   *
   * @param {string} version
   * @return string
   */
  public versioning(version: string): string {
    if (version !== undefined) {
      return version;
    } else {
      return "master";
    }
  }
}
