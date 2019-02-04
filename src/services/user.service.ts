import chat from "../configs/chat.config";
import { prompt } from "inquirer";
import { HttpService } from "./http.service";
import { FileService } from "./file.service";

export class UserService {

  constructor(
    private httpService = new HttpService(),
    private fileService = new FileService()
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

    return this.httpService.post(["/usr", "signup"], content)
      .then(token => this.fileService.persist(user, token));
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

    return this.httpService.post(["/usr", "login"], content)
      .then(token => this.fileService.persist(user, token));
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
