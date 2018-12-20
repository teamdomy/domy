import { Command } from "commander";
import { DomService } from "../services/dom.service";
import { LogService } from "../services/log.service";
import { PackService } from "../services/pack.service";

export class DomCommand {

  constructor(
    private cm = new Command(),
    private lg = new LogService(),
    private dm = new DomService(),
    private pk = new PackService()
  ) {

  }

  /**
   * Initiates class related commands
   *
   * @return {void}
   */
  public start(): void {

    this.get();
    this.add();
    this.del();

    this.cm.parse(process.argv);
  }

  /**
   * Extracts data structure from the system
   *
   * @return {Command}
   */
  public get(): Command {
    this.cm.command("get")
      .alias("g")
      .arguments("<name>")
      .description("get the component by its name")
      // path to the dir where file will be created
      .option("-f --file <pathway>")
      .option("-d --dir <pathway>")
      .action((name: string, args: { file: string, dir: string }) => {
        if (typeof name === "string") {
          this.dm.get(args.dir, name)
            .then(data => this.dm.save(args.dir, name, args.file, data))
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
   * Inserts data structure in the system (from file)
   *
   * @return {Command}
   */
  public add(): Command {
    this.cm.command("add")
      .alias("a")
      .arguments("<name> <pathway>")
      .description("add the component from the file")
      // ignore all local conf and use the defpack straight away
      .option("-i --ignore")
      .option("-d --dir <pathway>")
      .action((name: string, pathway: string, args: { dir: string }) => {
        if (typeof name === "string" && typeof pathway === "string") {
          this.pk.create(pathway, name)
            .then(content =>
              this.dm.set(args.dir, name, content.toString("utf8"))
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
   * Removes data structure from the system (by name)
   *
   * @return {Command}
   */
  public del(): Command {
    this.cm.command("del")
      .alias("d")
      .arguments("<name>")
      .description("remove the component by its name")
      .option("-d --dir <pathway>")
      .action((name: string, args: { dir: string }) => {
        if (typeof name === "string") {
          this.dm.del(args.dir, name)
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
