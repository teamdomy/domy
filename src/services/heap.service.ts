import { spawn } from "child_process";
import { resolve } from "path";


export class HeapService {

  /**
   * Builds the project
   *
   * @return {void}
   */
  public make(): void {

    const options = {
      cwd: process.cwd()
    };

    const pathway = resolve(__dirname, "..", "node_modules/@stencil/core/bin/stencil");
    const compiler = spawn("node", [pathway, "build", "--docs"], options);

    compiler.stdout.on("data", (data) => {
      console.info(data);
    });

    compiler.stderr.on("data", (data) => {
      console.error(data);
    });

    compiler.on("close", (code) => {
      console.info("Compiler closed");
    });
  }
}
