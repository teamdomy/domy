import { expect } from "chai";
import { stub } from "sinon";
import { DomService } from "../../src/services/dom.service";
import { HttpRepository } from "../../src/repositories/http.repository";
import { LocalRepository } from "../../src/repositories/local.repository";

describe("DomService", () => {

  const service = new DomService();

  let nodestub;
  let localstub;

  beforeEach(() => {
    nodestub = stub(HttpRepository.prototype, "request");
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
    nodestub.restore();
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

    service.get(undefined, "Example")
      .then(result => {
        expect(result).to.equal("test_content");
        done();
      });
  });

  it("set() should return boolean", done => {

    nodestub.callsFake((options, content) => {
      expect(options.method).to.equal("PUT");
      expect(options.path).to.be.a("string");
      expect(options.path).to.contain("dir");
      expect(options.path).to.contain("Example");

      expect(JSON.parse(content)).to.equal("test_content");

      return Promise.resolve(
        JSON.stringify(true)
      );
    });

    service.set("dir", "Example", "test_content")
      .then(result => {
        expect(JSON.parse(result)).to.be.true;
        done();
      });
  });

  it("del() should return boolean", done => {

    nodestub.callsFake(options => {
      expect(options.method).to.equal("DELETE");
      expect(options.path).to.be.a("string");
      expect(options.path).to.contain("dir");
      expect(options.path).to.contain("Example");

      return Promise.resolve(true);
    });

    service.del("dir", "Example")
      .then(result => {
        expect(result).to.be.true;
        done();
      });
  });

});
