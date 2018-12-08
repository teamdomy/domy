import { expect } from "chai";
import { stub, fake } from "sinon";
import { DomCommand } from "../../src/commands/dom.command";
import { DataService } from "../../src/services/data.service";
import { PackService } from "../../src/services/pack.service";
import { LogService } from "../../src/services/log.service";

describe("DomCommand", () => {

  const command = new DomCommand();

  let datastub;
  let logstub;
  let recordstub;

  beforeEach(() => {
    logstub = stub(LogService.prototype, "success");
    datastub = stub(DataService.prototype, "request");
    recordstub = stub(DataService.prototype, "getRecord")
      .returns(
        Promise.resolve({
          app: "test_app",
          token: "test_token"
        })
      );
  });

  afterEach(() => {
    datastub.restore();
    logstub.restore();
    recordstub.restore();
  });

  it("get() should return string", done => {

    datastub.callsFake(options => {
      expect(options.method).to.equal("GET");
      expect(options.path).to.be.a("string");
      expect(options.path).to.contain("Example");
      expect(options.port).to.be.a("number");

      return Promise.resolve(
        JSON.stringify("test_content")
      );
    });

    stub(console, "info").callsFake(data => {
      expect(data).to.equal("test_content");
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

    datastub.callsFake((options, content) => {
      expect(options.method).to.equal("PUT");
      expect(options.path).to.be.a("string");
      expect(options.path).to.contain("Example");
      expect(options.port).to.be.a("number");

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

    datastub.callsFake(options => {
      expect(options.method).to.equal("DELETE");
      expect(options.path).to.be.a("string");
      expect(options.path).to.contain("Example");
      expect(options.port).to.be.a("number");

      return Promise.resolve(true);
    });

    command.del().parse(
      ["node", "domy", "remove", "Example"]
    );
  });

});
