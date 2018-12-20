import { expect } from "chai";
import { stub } from "sinon";
import { DomCommand } from "../../src/commands/dom.command";
import { HttpRepository } from "../../src/repositories/http.repository";
import { PackService } from "../../src/services/pack.service";
import { LogService } from "../../src/services/log.service";
import { LocalRepository } from "../../src/repositories/local.repository";
import { DomService } from "../../src/services/dom.service";

describe("DomCommand", () => {

  const command = new DomCommand();

  let logstub;
  let nodestub;
  let domstub;
  let localstub;

  beforeEach(() => {
    logstub = stub(LogService.prototype, "success");
    nodestub = stub(HttpRepository.prototype, "request");
    domstub = stub(DomService.prototype, "save");
    localstub = stub(LocalRepository.prototype, "credentials")
      .get(() =>
        Promise.resolve({
          token: "test_token",
          user: {
            user: "test_user",
            dir: "test_user"
          }
        })
      );
  });

  afterEach(() => {
    logstub.restore();
    nodestub.restore();
    domstub.restore();
    localstub.restore();
  });

  it("get() should return string", done => {

    nodestub.callsFake(options => {
      expect(options.method).to.equal("GET");
      expect(options.path).to.be.a("string");
      expect(options.path).to.contain("test_user");
      expect(options.path).to.contain("Example");

      return Promise.resolve(
        JSON.stringify("test_content")
      );
    });

    domstub.callsFake((dir, name, pathway, content) => {
      expect(dir).to.undefined;
      expect(name).to.equal("Example");
      expect(pathway).to.undefined;
      expect(content).to.equal("test_content");

      return Promise.resolve(true);
    });

    logstub.callsFake(() => {
      done();
    });

    command.get().parse(
      ["node", "domy", "get", "Example"]
    );
  });

  it("add() should return boolean", done => {

    logstub.callsFake(() => {
      done();
    });

    stub(PackService.prototype, "create")
      .withArgs("example.js", "Example")
      .returns(Promise.resolve(Buffer.from("test_content")));

    nodestub.callsFake((options, content) => {
      expect(options.method).to.equal("PUT");
      expect(options.path).to.be.a("string");
      expect(options.path).to.contain("test_user");
      expect(options.path).to.contain("Example");

      expect(content).to.be.a("string");

      return Promise.resolve(true);
    });

    command.add().parse(
      ["node", "domy", "add", "Example", "example.js"]
    );
  });

  it("del() should return boolean", done => {

    logstub.callsFake(() => {
      done();
    });

    nodestub.callsFake(options => {
      expect(options.method).to.equal("DELETE");
      expect(options.path).to.be.a("string");
      expect(options.path).to.contain("test_user");
      expect(options.path).to.contain("Example");

      return Promise.resolve(true);
    });

    command.del().parse(
      ["node", "domy", "del", "Example"]
    );
  });

});
