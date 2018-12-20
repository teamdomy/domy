import { expect } from "chai";
import { stub } from "sinon";
import { UserService } from "../../src/services/user.service";
import { HttpRepository } from "../../src/repositories/http.repository";

describe("UserService", () => {

  const service = new UserService();

  let nodeStub;
  let persiststub;

  beforeEach(() => {
    nodeStub = stub(HttpRepository.prototype, "request");
    persiststub = stub(UserService.prototype, "persist")
      .callsFake((user, token) => {
        expect(user).to.equal("test_user");
        expect(token).to.equal("test_token");
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

      expect(content.user).to.equal("test_user");
      expect(content.pass).to.equal("test_pass");
      expect(content.mail).to.equal("test@email.te");

      return Promise.resolve("test_token");
    });

    service.signup(
      "test_user",
      "test_pass",
      "test@email.te"
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

      expect(content.user).to.equal("test_user");
      expect(content.pass).to.equal("test_pass");

      return Promise.resolve("test_token");
    });

    service.login(
      "test_user",
      "test_pass"
    ).then(result => {
      expect(result).to.be.true;
      done();
    });
  });

});
