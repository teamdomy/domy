import { join, resolve } from "path";
import { FileService } from "./file.service";
import { spawn } from "child_process";

export class PackService {

  constructor(
    private fileService = new FileService()
  ) {

  }

  /**
   * Compiles the project
   *
   * @return {void}
   */
  public build(): void {

    const options = {
      cwd: process.cwd()
    };

    const pathway = resolve(__dirname, "..", "node_modules/@stencil/core/bin/stencil");
    const compiler = spawn("node", [pathway, "build", "--docs"], options);

    compiler.stdout.on("data", data => {
      if (data !== undefined) {
        console.info(data.toString());
      }
    });

    compiler.stderr.on("data", data => {
      if (data !== undefined) {
        console.error(data.toString());
      }
    });

    compiler.on("close", () => {});
  }

  /**
   * Adds component name and versioning to package.json
   *
   * @param {string} component
   * @param {string} release
   * @return {Promise<boolean>}
   */
  public update(component: string, release: string): Promise<boolean> {
    if (component !== undefined) {

      const base = join(this.fileService.grub(), "package.json");

      this.fileService.read(base)
        .then(data => JSON.parse(data))
        .then(config => {
          if (!config.hasOwnProperty("webcomponents")) {
            config["webcomponents"] = {};
          }

          config["webcomponents"][component] = this.fileService.versioning(release);

          return this.fileService.write(base, JSON.stringify(config, null, 2));
        });

    } else {
      return Promise.resolve(true);
    }
  }

  /**
   * Reads webcomponent list from package.json
   *
   * @param {string} component
   * @param {string} release
   * @return {Promise<any>}
   */
  public read(component: string, release: string) {
    if (component !== undefined) {
      const response = {};
      response[component] = this.fileService.versioning(release);
      return Promise.resolve(response);
    } else {

      const base = join(this.fileService.grub(), "package.json");

      return this.fileService.read(base)
        .then(data => JSON.parse(data))
        .then(config => {
          if (config.hasOwnProperty("webcomponents")) {
            return config["webcomponents"];
          } else {
            return {};
          }
        });
    }
  }
}
