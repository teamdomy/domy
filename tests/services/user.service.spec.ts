import { expect } from "chai";
import { stub } from "sinon";
import { UserService } from "../../src/services/user.service";
import { HttpService } from "../../src/services/http.service";
import { FileService } from "../../src/services/file.service";

describe("UserService", () => {

  const service = new UserService();

  const name = "test_user";
  const pass = "test_pass";
  const key = "test_token";
  const mail = "test@email.te";

  let nodeStub;
  let persiststub;

  beforeEach(() => {
    nodeStub = stub(HttpService.prototype, "request");
    persiststub = stub(FileService.prototype, "persist")
      .callsFake((user, token) => {
        expect(user).to.equal(name);
        expect(token).to.equal(key);
        return Promise.resolve(true);
      });
  });

  afterEach(() => {
    nodeStub.restore();
    persiststub.restore();
  });

  it("signup() should return a string", done => {

    nodeStub.callsFake((options, data) => {
      expect(options.method).to.equal("POST");
      expect(options.path).to.be.a("string");
      expect(options.path).to.contain("signup");

      const content = JSON.parse(data);

      expect(content.user).to.equal(name);
      expect(content.pass).to.equal(pass);
      expect(content.mail).to.equal(mail);

      return Promise.resolve(key);
    });

    service.signup(
      name,
      pass,
      mail
    ).then(result => {
      expect(result).to.be.true;
      done();
    });
  });

  it("login() should return a string", done => {

    nodeStub.callsFake((options, data) => {
      expect(options.method).to.equal("POST");
      expect(options.path).to.be.a("string");
      expect(options.path).to.contain("login");

      const content = JSON.parse(data);

      expect(content.user).to.equal(name);
      expect(content.pass).to.equal(pass);

      return Promise.resolve(key);
    });

    service.login(
      name,
      pass
    ).then(result => {
      expect(result).to.be.true;
      done();
    });
  });

});
