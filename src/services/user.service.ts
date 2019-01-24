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

    const content = JSON.stringify(
      { user: user, pass: pass, mail: mail }
      );

    return this.ht.post(["/usr", "signup"], content)
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

    const content = JSON.stringify(
      { user: user, pass: pass }
    );

    return this.ht.post(["/usr", "login"], content)
      .then(token => this.fl.persist(user, token));
  }

  /**
   * Creates an auth dialog
   *
   * @param {string} group
   * @return {Promise<any>}
   */
  public inquire(group: string): Promise<any> {
    if (group === "login") {
      return prompt(chat.login);
    } else if (group === "signup") {
      return prompt(chat.signup);
    } else {
      throw new Error("Wrong inquiry option group");
    }
  }
}
