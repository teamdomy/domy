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
    this.compile();

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
      .option("-v --version <data>")
      .description("push a component to the registry")
      .action((component: string, options) => {

        if (typeof options.version !== "string") {
          options.version = undefined;
        }

        this.domyService.assert(component)
          .then(() =>
            this.domyService.gather(component, options.version, options.catalog)
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
      .option("-v --version <data>")
      .description("pull a component from the registry")
      .action((component: string, options) => {

        if (typeof options.version !== "string") {
          options.version = undefined;
        }

        this.domyService.assert(component)
          .then(() =>
            this.domyService.scatter(options.catalog, component, options.version)
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
      .option("-v --version <data>")
      .option("-p --purge")
      .description("remove a component from the registry")
      .action((component: string, options) => {

        if (typeof options.version !== "string") {
          options.version = undefined;
        }

        this.domyService.assert(component)
          .then(() => {
            if (options.purge) {
              this.domyService.list(options.catalog, component, options.version)
                .then(files =>
                  Promise.all(
                    files.map(file => this.domyService.del(file))
                  )
                );
            }

            // todo: remove the component locally and change package.json
            // todo: return it from the function

          })
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
      .option("-c --catalog <data>")
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
      .description("compile all files from the project")
      .action(() =>
        this.packService.build()
      );
  }
}
