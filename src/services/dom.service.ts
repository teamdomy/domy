import { DataService } from "./data.service";

export class DomService {

  constructor(
    private dt = new DataService()
  ) {

  }

  /**
   * Extracts data structure from the system
   *
   * @param {string} trunk
   * @return {Promise<string>}
   */
  public get(trunk: string): Promise<string> {
    return this.dt.get("dom", trunk);
  }

  /**
   * Inserts data structure in the system
   *
   * @param {string} name
   * @param {string} content
   * @return {Promise<string>}
   */
  public set(name: string, content: string): Promise<string> {
    return this.dt.put("dom", name, content);
  }

  /**
   * Removes data structure from the system
   *
   * @param {string} name
   * @return {Promise<string>}
   */
  public del(name: string): Promise<string> {
    return this.dt.delete("dom", name);
  }

  /**
   * Saves data structure in the file
   *
   * @param {string} pathway
   * @param {string} data
   * @return {Promise<boolean>}
   */
  public save(pathway: string, data: string): Promise<boolean> {
    return this.dt.write(pathway, data);
  }

}
