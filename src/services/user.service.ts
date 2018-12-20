import env from "../../env/dev.env.json";
import chat from "../configs/chat.config";
import { prompt } from "inquirer";
import { HttpRepository } from "../repositories/http.repository";
import { LocalRepository } from "../repositories/local.repository";
import { join } from "path";

export class UserService {

  constructor(
    private hr = new HttpRepository(),
    private lr = new LocalRepository()
  ) {

  }

  /**
   * Registers the user in the system
   *
   * @param {string} user
   * @param {string} pass
   * @param {string} mail
   * @return {Promise<boolean>}
   */
  public signup(user: string, pass: string, mail: string): Promise<boolean> {

    const value = { user: user, pass: pass, mail: mail };

    return this.hr.post("usr", "signup", value)
      .then(token => this.persist(user, token));
  }

  /**
   * Logs the user in the system
   *
   * @param {string} user
   * @param {string} pass
   * @return {Promise<boolean>}
   */
  public login(user: string, pass: string): Promise<boolean> {

    const value = { user: user, pass: pass };

    return this.hr.post("usr", "login", value)
      .then(token => this.persist(user, token));
  }

  /**
   * Creates a dialog using Inquirer
   *
   * @param {string} type
   * @return {Promise<any>}
   */
  public inquire(type: string): Promise<any> {
    if (type === "login") {
      return prompt(chat.login);
    } else if (type === "signup") {
      return prompt(chat.signup);
    } else {
      throw new Error("Wrong inquiry option");
    }
  }

  /**
   * Saves the credential in the file
   *
   * @param {string} user
   * @param {string} token
   * @return {Promise<boolean>}
   */
  public persist(user: string, token: string) {
    if (
      typeof user !== "undefined" &&
      typeof token !== "undefined"
    ) {

      return Promise.all([
        this.lr.write(
          join(__dirname, env.key),
          JSON.stringify(
            Buffer.from(token).toString()
          )
        ),
        this.lr.write(
          join(__dirname, env.user),
          JSON.stringify({
            user: user,
            dir: user
          })
        )
      ]).then(result => result[0] && result[1]);

    } else {
      throw Error("Incomplete credentials");
    }
  }
}
