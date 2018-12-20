import { Command } from "commander";
import { UserService } from "../services/user.service";
import { LogService } from "../services/log.service";

export class UserCommand {

  constructor(
    private cm = new Command(),
    private ls = new LogService(),
    private us = new UserService()
  ) {

  }

  /**
   * Initiates class related commands
   *
   * @return {void}
   */
  public start(): void {

    this.signup();
    this.login();

    this.cm.parse(process.argv);
  }

  /**
   * Registers the user in the system
   *
   * @return {Command}
   */
  public signup(): Command {
    this.cm.command("signup")
      .alias("s")
      .description("create your own account")
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
                  .then(result => this.ls.success())
                  .catch(err => this.ls.failure(err));
              } else {
                this.ls.failure(
                  "Expecting username and password to be at least 5 characters long"
                );
              }
            } else {
              this.ls.failure(
                "Expecting an alphanumeric username and a valid email"
              );
            }
          } else {
            this.ls.failure(
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
      .description("log into the system")
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
                  .then(() => this.ls.success())
                  .catch(err => this.ls.failure(err));

              } else {
                this.ls.failure(
                  "Expecting username and password to be at least 5 characters long"
                );
              }
            } else {
              this.ls.failure(
                "Expecting an alphanumeric username"
              );
            }
          } else {
            this.ls.failure(
              "Wrong command-line arguments"
            );
          }

        });
      });

    return this.cm;
  }
}
