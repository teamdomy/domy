import { Command } from "commander";
import { UserService } from "../services/user.service";
import { LogService } from "../services/log.service";

export class UserCommand {

  constructor(
    private command = new Command(),
    private logService = new LogService(),
    private userService = new UserService()
  ) {

  }

  /**
   * Instantiates class related commands
   *
   * @return {void}
   */
  public start(): void {

    this.signup();
    this.login();

    this.command.parse(process.argv);
  }

  /**
   * Registers the user in the system
   *
   * @return {Command}
   */
  public signup(): Command {
    this.command.alias("s")
      .command("signup")
      .description("registers the user in the system")
      .action(() => {
        this.userService.inquire("signup").then(data => {

          if (
            typeof data.username === "string" &&
            typeof data.password === "string" &&
            typeof data.email === "string"
          ) {

            if (
              /\S+@\S+\.\S+/.test(data.email) &&
              /^[a-zA-Z0-9_\-\_]*$/.test(data.username)
            ) {
              if (
                data.username.length > 5 &&
                data.password.length > 5
              ) {

                this.userService.signup(data.username, data.password, data.email)
                  .then(result => this.logService.success())
                  .catch(err => this.logService.failure(err));
              } else {
                this.logService.failure(
                  "Expecting username and password to be at least 5 characters long"
                );
              }
            } else {
              this.logService.failure(
                "Expecting an alphanumeric username and a valid email"
              );
            }
          } else {
            this.logService.failure(
              "Wrong command-line arguments"
            );
          }
        });

      });

    return this.command;
  }

  /**
   * Logs the user in the system
   *
   * @return {Command}
   */
  public login(): Command {
    this.command.alias("l")
      .command("login")
      .description("logs the user in the system")
      .action(() => {
        this.userService.inquire("login").then(data => {

          if (
            typeof data.username === "string" &&
            typeof data.password === "string"
          ) {

            if (
              /^[a-zA-Z0-9_]*$/.test(data.username)
            ) {

              if (
                data.username.length > 5 &&
                data.password.length > 5
              ) {

                this.userService.login(data.username, data.password)
                  .then(() => this.logService.success())
                  .catch(err => this.logService.failure(err));

              } else {
                this.logService.failure(
                  "Expecting username and password to be at least 5 characters long"
                );
              }
            } else {
              this.logService.failure(
                "Expecting an alphanumeric username"
              );
            }
          } else {
            this.logService.failure(
              "Wrong command-line arguments"
            );
          }

        });
      });

    return this.command;
  }
}
