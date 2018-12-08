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
      .arguments("<trunk>")
      .description("extract the structure from the virtual dom")
      .option("-f --file [pathway]") // path to the file
      .action((trunk: string, args: { file: string }) => {
        if (typeof trunk === "string") {

          this.dm.get(trunk)
            .then(data => {

              if (typeof args.file !== "undefined") {
                this.dm.save(args.file, data)
                  .then(() => this.lg.success())
                  .catch(err => this.lg.failure(err));
              } else {
                console.info(data);
              }
            })
            .catch(err => this.lg.failure(err));

        } else {
          this.lg.failure(
            "Method expects the parameter to be a string"
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
      .description("add the structure to the virtual dom")
      .action((name: string, pathway: string) => {
        if (
          typeof name === "string" &&
          typeof pathway === "string"
        ) {

          this.pk.create(pathway, name)
            .then(content => this.dm.set(name, content.toString("utf8")))
            .then(() => this.lg.success())
            .catch(err => this.lg.failure(err));
        } else {
          this.lg.failure(
            "Method expects both parameters to be strings"
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
    this.cm.command("remove")
      .alias("delete")
      .arguments("<trunk>")
      .description("remove the structure from the virtual dom")
      .action((trunk: string) => {
        if (typeof trunk === "string") {
          this.dm.del(trunk)
            .then(() => this.lg.success())
            .catch(err => this.lg.failure(err));
        } else {
          this.lg.failure(
            "Method expects both parameters to be strings"
          );
        }
      });

    return this.cm;
  }

}
