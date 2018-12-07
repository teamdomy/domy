import colors from "colors";
import pad from "pad";

export class LogService {

  /**
   * Writes 'successful' logs to the CLI
   *
   * @return {void}
   */
  public success(): void {
    console.info(
      pad("\nGenerating dom structure...", 30),
      colors.green("done")
    );
    console.info(
      pad("Finishing the process...", 30),
      colors.green("done")
    );
    console.info(
      pad("Procedure result:", 30),
      colors.green("success")
    );
  }

  /**
   * Writes 'failed' logs to the CLI
   *
   * @param {string} error
   * @return {void}
   */
  public failure(error: string): void {
    console.error(
      pad("\nGenerating dom structure...", 30),
      colors.red("aborted")
    );
    console.error(
      pad("Finishing the process...", 30),
      colors.red("aborted")
    );
    console.error(
      pad("Procedure result:", 30),
      colors.red("failure")
    );
    console.error("DOMError: ", colors.yellow(error));
  }
}
