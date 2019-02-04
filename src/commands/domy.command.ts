import { Command } from "commander";
import { DomyService } from "../services/domy.service";
import { LogService } from "../services/log.service";
import { PackService } from "../services/pack.service";

export class DomyCommands {

  constructor(
    private command = new Command(),
    private domyService = new DomyService(),
    private packService = new PackService(),
    private logService = new LogService(),
  ) {

  }

  /**
   * Instantiates class related commands
   *
   * @return {void}
   */
  public start(): void {

    this.publish();
    this.install();
    this.remove();

    this.command.parse(process.argv);
  }

  /**
   * Pushes components to the registry
   *
   * @return {Command}
   */
  public publish(): Command {
    this.command.alias("p")
      .command("publish")
      .arguments("[component]")
      .option("-c --catalog <data>")
      .option("-v --release <data>")
      .description("push a component to the registry")
      .action((component: string, options) => {

        this.domyService.assert(component)
          .then(() =>
            this.domyService.gather(component, options.release, options.catalog)
          )
          .then(() => this.logService.success())
          .catch(err => this.logService.failure(err));
      });

    return this.command;
  }

  /**
   * Pulls components from the registry
   *
   * @return {Command}
   */
  public install(): Command {
    this.command.alias("i")
      .command("install")
      .arguments("[component]")
      .option("-c --catalog <data>")
      .option("-v --release <data>")
      .description("pull a component from the registry")
      .action((component: string, options) => {

        this.domyService.assert(component)
          .then(() =>
            this.domyService.scatter(options.catalog, component, options.release)
          )
          .then(() => this.logService.success())
          .catch(err => this.logService.failure(err));
      });

    return this.command;
  }

  /**
   * Removes components from the registry
   *
   * @return {Command}
   */
  public remove(): Command {
    this.command.alias("r")
      .command("remove")
      .arguments("<component>")
      .option("-c --catalog <data>")
      .option("-v --release <data>")
      .option("-p --purge")
      .description("remove a component from the registry")
      .action((component: string, options) => {

        this.domyService.assert(component)
          .then(() =>
            this.domyService.list(options.catalog, component, options.release)
          )
          .then(files =>
            Promise.all(
              files.map(file => this.domyService.del(file))
            )
          )
          .then(() => this.logService.success())
          .catch(err => this.logService.failure(err));

      });

    return this.command;
  }

  /**
   * Lists components (catalog)
   *
   * @return {Command}
   */
  public list(): Command {
    // todo: the default catalog is the username
    this.command.alias("ls")
      .command("list")
      .option("-c --catalog <catalog>")
      .description("list collection components")
      .action(options => {
        //
      });

    return this.command;
  }


  /**
   * Compiles files
   *
   * @return {Command}
   */
  public compile(): void {
    this.command.alias("build")
      .command("compile")
      .description("compile files")
      .action(() => this.packService.build());
  }
}
