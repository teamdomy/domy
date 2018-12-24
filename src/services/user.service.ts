import chat from "../configs/chat.config";
import { prompt } from "inquirer";
import { HttpService } from "./http.service";
import { FileService } from "./file.service";

export class UserService {

  constructor(
    private ht = new HttpService(),
    private fl = new FileService()
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

    return this.ht.post("usr", "signup", value)
      .then(token => this.fl.persist(user, token));
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

    return this.ht.post("usr", "login", value)
      .then(token => this.fl.persist(user, token));
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
}
