import env from "../../env/dev.env.json";
import { prompt } from "inquirer";
import { DataService } from "./data.service";

export class UserService {

  public app: string;
  public token: string;

  constructor(
    private dt = new DataService()
  ) {

  }

  /**
   * Registers the user in the system
   *
   * @param {string} user
   * @param {string} pass
   * @param {string} mail
   * @param {string} app
   * @return {Promise<boolean>}
   */
  public signup(user: string, pass: string, mail: string, app: string): Promise<boolean> {
    return this.dt.post(
      "usr",
      "signup",
      app,
      { user: user, pass: pass, mail: mail }
      ).then(token => this.persist(app, token));
  }

  /**
   * Logs the user in the system
   *
   * @param {string} user
   * @param {string} pass
   * @param {string} app
   * @return {Promise<boolean>}
   */
  public login(user: string, pass: string, app: string): Promise<boolean> {
    return this.dt.post(
      "usr",
      "login",
      app,
      { user: user, pass: pass }
    ).then(token => this.persist(app, token));
  }

  /**
   * Saves credentials in the file
   *
   * @param {string} app
   * @param {string} token
   * @return {Promise<boolean>}
   */
  public persist(app: string, token: string): Promise<boolean> {
    if (
      typeof app !== "undefined" &&
      typeof token !== "undefined"
    ) {

      this.app = app;
      this.token = token;

      const data = Buffer.from(
        JSON.stringify({
          app: this.app,
          token: this.token
        })
      );

      return this.dt.write(
        env.config,
        data.toString("base64")
      );

    } else {
      throw Error(
        "Incomplete credentials"
      );
    }
  }

  /**
   * Creates a dialog using Inquirer
   *
   * @param {string} type
   * @return {Promise<any>}
   */
  public ask(type: string): Promise<any> {

    let response;

    if (type === "login") {
      response = prompt([
        {
          type: "input",
          name: "username",
          message: "Enter the username"
        },
        {
          type: "input",
          name: "password",
          message: "Enter the password"
        },
        {
          type: "input",
          name: "email",
          message: "Enter the email",
        },
        {
          type: "input",
          name: "app",
          message: "Enter your app name"
        }
      ]);
    } else if (type === "signup") {
      response = prompt([
        {
          type: "input",
          name: "username",
          message: "Enter the username"
        },
        {
          type: "input",
          name: "password",
          message: "Enter the password"
        },
        {
          type: "input",
          name: "app",
          message: "Enter your app name"
        }
      ]);
    } else {
      throw new Error("Wrong inquiry option");
    }

    return response;
  }
}
