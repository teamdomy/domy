import { accessSync, constants } from "fs";
import webpack from "webpack";
import Memory from "memory-fs";

export class PackService {

  /**
   * Bundles the content using Webpack
   *
   * @param {string} pathway
   * @param {string} name
   */
  public create(pathway: string, name: string): Promise<Buffer> {

    return new Promise((resolve, reject) => {

      const entry = process.cwd() + "/" + pathway;
      const segments = entry.split("/");
      const filename = segments.pop();
      const config = this.setup(segments);

      config.entry = entry;
      config.output = {
        path: "/output",
        filename: "component.js",
        libraryTarget: "var",
        library: name
      };

      const memory = new Memory();
      const compiler = webpack(config);

      compiler.outputFileSystem = memory;

      compiler.run((err, stats) => {
        if (err) {
          console.error(err.stack || err);
          if (err.details) {
            return reject(err.details);
          }
        }

        const info = stats.toJson();

        if (stats.hasErrors()) {
          return reject(info.errors);
        }

        if (stats.hasWarnings()) {
          //
        }

        return resolve(memory.readFileSync("/output/component.js"));
      });
    });

  }

  /**
   * Loads the webpack configuration
   *
   * @param {Array<string>} segments
   * @return any
   */
  private setup(segments: string[]) {

    if (Array.isArray(segments) && segments.length > 0) {
      const pathway = segments.join("/") + "/webpack.config.js";

      try {
        accessSync(pathway, constants.R_OK);

        // config file found
        return module.require(pathway);
      } catch (err) {

        segments.pop();
        return this.setup(segments);
      }
    } else {
      // config file was not found, returning default config
      return module.require("../configs/pack.config.js");
    }

  }

}
