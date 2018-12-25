import { Command } from "commander";
import { DomService } from "../services/dom.service";
import { LogService } from "../services/log.service";
import { PackService } from "../services/pack.service";

export class DomCommand {

  constructor(
    private cm = new Command(),
    private lg = new LogService(),
    private ds = new DomService(),
    private pc = new PackService()
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
   * Installs a component locally
   *
   * @return {Command}
   */
  public install(): Command {
    this.cm.command("install")
      .alias("i")
      .arguments("<name>")
      .description("installs a component locally")
      .option("-f --file <pathway>")
      .option("-d --dir <pathway>")
      .action((name: string, args: { file: string, dir: string }) => {
        if (typeof name === "string") {
          this.ds.get(args.dir, name)
            .then(data => this.ds.save(args.dir, name, args.file, data))
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
   * Publishes a component to the registry
   *
   * @return {Command}
   */
  public publish(): Command {
    this.cm.command("publish")
      .alias("p")
      .arguments("<name> <pathway>")
      .description("publishes a component to the registry")
      .option("-i --ignore") // ignore local webpack
      .option("-d --dir <pathway>")
      .action((name: string, pathway: string, args: { dir: string, ignore: boolean }) => {
        if (typeof name === "string" && typeof pathway === "string") {
          this.pc.create(pathway, name)
            .then(content =>
              this.ds.set(args.dir, name, content.toString("utf8"))
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
   * Removes a component from the storage
   *
   * @return {Command}
   */
  public unpublish(): Command {
    this.cm.command("unpublish")
      .arguments("<name>")
      .description("removes a component from the storage")
      .option("-d --dir <pathway>")
      .action((name: string, args: { dir: string }) => {
        if (typeof name === "string") {
          this.ds.del(args.dir, name)
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

}
