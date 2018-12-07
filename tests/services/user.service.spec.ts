import { expect } from "chai";
import { stub } from "sinon";
import { UserService } from "../../src/services/user.service";
import { DataService } from "../../src/services/data.service";

describe("UserService", () => {

  const service = new UserService();

  let dataStub;
  let userstub;

  beforeEach(() => {
    dataStub = stub(DataService.prototype, "request");
    userstub = stub(UserService.prototype, "persist");
  });

  afterEach(() => {
    dataStub.restore();
    userstub.restore();
  });

  it("signup() should return a string", done => {

    userstub.callsFake((app, data) => {
      const token = JSON.parse(data);

      expect(app).to.equal("test_app");
      expect(token).to.equal("test_token");

      return Promise.resolve(true);
    });

    dataStub.callsFake((options, data) => {
      expect(options.method).to.equal("POST");
      expect(options.path).to.be.a("string");
      expect(options.path).to.contain("signup");
      expect(options.port).to.be.a("number");

      const content = JSON.parse(data);

      expect(content.user).to.equal("test_user");
      expect(content.pass).to.equal("test_pass");
      expect(content.mail).to.equal("test@email.te");

      return Promise.resolve(
        JSON.stringify("test_token")
      );
    });

    service.signup(
      "test_user",
      "test_pass",
      "test@email.te",
      "test_app"
    ).then(result => {
      expect(result).to.be.true;
      done();
    });
  });

  it("login() should return a string", done => {

    userstub.callsFake((app, data) => {
      const token = JSON.parse(data);

      expect(app).to.equal("test_app");
      expect(token).to.equal("test_token");

      return Promise.resolve(true);
    });

    dataStub.callsFake((options, data) => {
      expect(options.method).to.equal("POST");
      expect(options.path).to.be.a("string");
      expect(options.path).to.contain("login");
      expect(options.port).to.be.a("number");

      const content = JSON.parse(data);

      expect(content.user).to.equal("test_user");
      expect(content.pass).to.equal("test_pass");

      return Promise.resolve(
        JSON.stringify("test_token")
      );
    });

    service.login(
      "test_user",
      "test_pass",
      "test_app"
    ).then(result => {
      expect(result).to.be.true;
      done();
    });
  });

});
