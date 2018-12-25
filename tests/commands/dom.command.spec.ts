import { expect } from "chai";
import { stub } from "sinon";
import { DomCommand } from "../../src/commands/dom.command";
import { HttpService } from "../../src/services/http.service";
import { PackService } from "../../src/services/pack.service";
import { LogService } from "../../src/services/log.service";
import { FileService } from "../../src/services/file.service";
import { DomService } from "../../src/services/dom.service";

describe("DomCommand", () => {

  const command = new DomCommand();

  let logstub;
  let nodestub;
  let domstub;
  let localstub;

  beforeEach(() => {
    logstub = stub(LogService.prototype, "success");
    nodestub = stub(HttpService.prototype, "request");
    domstub = stub(DomService.prototype, "save");
    localstub = stub(FileService.prototype, "credentials")
      .get(() =>
        Promise.resolve({
          user: "test_user",
          key: "test_token",
          dir: "test_user"
        })
      );
  });

  afterEach(() => {
    logstub.restore();
    nodestub.restore();
    domstub.restore();
    localstub.restore();
  });

  it("install() should return string", done => {

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

    command.install().parse(
      ["node", "domy", "install", "Example"]
    );
  });

  it("publish() should return boolean", done => {

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

    command.publish().parse(
      ["node", "domy", "publish", "Example", "example.js"]
    );
  });

  it("unpublish() should return boolean", done => {

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

    command.unpublish().parse(
      ["node", "domy", "unpublish", "Example"]
    );
  });

});
