import { expect } from "chai";
import { stub } from "sinon";
import { DomService } from "../../src/services/dom.service";
import { DataService } from "../../src/services/data.service";

describe("DomService", () => {

  const service = new DomService();

  let datastub;
  let recordstub;

  beforeEach(() => {
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

    service.get("Example").then(result => {
      expect(result).to.equal("test_content");
      done();
    });
  });

  it("set() should return boolean", done => {

    datastub.callsFake((options, content) => {
      expect(options.method).to.equal("PUT");
      expect(options.path).to.be.a("string");
      expect(options.path).to.contain("Example");
      expect(options.port).to.be.a("number");

      expect(JSON.parse(content)).to.equal("test_content");

      return Promise.resolve(
        JSON.stringify(true)
      );
    });

    service.set("Example", "test_content")
      .then(result => {
        expect(JSON.parse(result)).to.be.true;
        done();
      });
  });

  it("del() should return boolean", done => {

    datastub.callsFake(options => {
      expect(options.method).to.equal("DELETE");
      expect(options.path).to.be.a("string");
      expect(options.path).to.contain("Example");
      expect(options.port).to.be.a("number");

      return Promise.resolve(true);
    });

    service.del("Example").then(result => {
      expect(result).to.be.true;
      done();
    });
  });

});
