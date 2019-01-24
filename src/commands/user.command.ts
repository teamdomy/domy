import { Command } from "commander";
import { UserService } from "../services/user.service";
import { LogService } from "../services/log.service";

export class UserCommand {

  constructor(
    private cm = new Command(),
    private lg = new LogService(),
    private us = new UserService()
  ) {

  }

  /**
   * Instantiates class related commands
   *
   * @return {void}
   */
  public start(): Command {

    this.signup();
    this.login();

    this.cm.parse(process.argv);

    return this.cm;
  }

  /**
   * Registers the user in the system
   *
   * @return {Command}
   */
  public signup(): Command {
    this.cm.command("signup")
      .alias("s")
      .description("registers the user in the system")
      .action(() => {
        this.us.inquire("signup").then(data => {

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

                this.us.signup(data.username, data.password, data.email)
                  .then(result => this.lg.success())
                  .catch(err => this.lg.failure(err));
              } else {
                this.lg.failure(
                  "Expecting username and password to be at least 5 characters long"
                );
              }
            } else {
              this.lg.failure(
                "Expecting an alphanumeric username and a valid email"
              );
            }
          } else {
            this.lg.failure(
              "Wrong command-line arguments"
            );
          }
        });

      });

    return this.cm;
  }

  /**
   * Logs the user in the system
   *
   * @return {Command}
   */
  public login(): Command {
    this.cm.command("login")
      .alias("l")
      .description("logs the user in the system")
      .action(() => {
        this.us.inquire("login").then(data => {

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

                this.us.login(data.username, data.password)
                  .then(() => this.lg.success())
                  .catch(err => this.lg.failure(err));

              } else {
                this.lg.failure(
                  "Expecting username and password to be at least 5 characters long"
                );
              }
            } else {
              this.lg.failure(
                "Expecting an alphanumeric username"
              );
            }
          } else {
            this.lg.failure(
              "Wrong command-line arguments"
            );
          }

        });
      });

    return this.cm;
  }
}
