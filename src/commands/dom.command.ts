import { Command } from "commander";
import { DomService } from "../services/dom.service";
import { LogService } from "../services/log.service";

export class DomCommand {

  constructor(
    private cm = new Command(),
    private lg = new LogService(),
    private dm = new DomService(),
  ) {

  }

  /**
   * Initiates class related commands
   *
   * @return {void}
   */
  public start(): void {

    this.install();
    this.publish();
    this.unpublish();

    this.cm.parse(process.argv);
  }

  /**
   * Installs component from the registry
   *
   * @return {Command}
   */
  public install(): Command {
    this.cm.command("install")
      .alias("i")
      .arguments("<name>")
      .description("install component from the registry")
      .option("-f --file <data>")
      .option("-c --catalog <data>")
      .action((name: string, args: { file: string, catalog: string }) => {
        if (typeof name === "string") {
          this.dm.get(args.catalog, name)
            .then(data =>
              this.dm.save(args.catalog, name, args.file, data)
            )
            .then(() => this.lg.success())
            .catch(err => this.lg.failure(err));
        } else {
          this.lg.failure(
            "Wrong command-line arguments"
          );
        }
      });

    return this.cm;
  }

  /**
   * Publishes components to the registry
   *
   * @return {Command}
   */
  public publish(): Command {
    this.cm.command("publish")
      .alias("p")
      .arguments("<name> <pathway>")
      .description("publish components to the registry")
      .option("-c --catalog <data>")
      .action((name: string, pathway: string, args: { catalog: string, ignore: boolean }) => {
        if (typeof name === "string" && typeof pathway === "string") {
          this.dm.prepare(pathway)
            .then(content =>
              this.dm.set(args.catalog, name, content)
            )
            .then(() => this.lg.success())
            .catch(err => this.lg.failure(err));
        } else {
          this.lg.failure(
            "Wrong command-line arguments"
          );
        }
      });

    return this.cm;
  }

  /**
   * Removes component from the registry
   *
   * @return {Command}
   */
  public unpublish(): Command {
    this.cm.command("unpublish")
      .arguments("<name>")
      .description("remove component from the registry")
      .option("-c --catalog <data>")
      .action((name: string, args: { catalog: string }) => {
        if (typeof name === "string") {
          this.dm.del(args.catalog, name)
            .then(() => this.lg.success())
            .catch(err => this.lg.failure(err));
        } else {
          this.lg.failure(
            "Wrong command-line arguments"
          );
        }
      });

    return this.cm;
  }

  /**
   * Uninstalls component from local directory
   *
   * @return {Command}
   */
  public uninstall(): Command {
    this.cm.command("uninstall")
      .alias("remove")
      .arguments("<name>")
      .description("remove locally installed component")
      .option("-c --catalog <data>")
      .action((name: string, args: { catalog: string }) => {
        if (typeof name === "string") {

          //

        } else {
          this.lg.failure(
            "Wrong command-line arguments"
          );
        }
      });

    return this.cm;
  }
}
