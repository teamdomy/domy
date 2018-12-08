import { prompt } from "inquirer";
import { expect } from "chai";
import { stub, replace, fake } from "sinon";
import { UserCommand } from "../../src/commands/user.command";
import { DataService } from "../../src/services/data.service";
import { LogService } from "../../src/services/log.service";
import { UserService } from "../../src/services/user.service";

describe("UserCommand", () => {

  const command = new UserCommand();

  let datastub;
  let userstub;
  let logstub;
  let inqstub;

  beforeEach(() => {
    datastub = stub(DataService.prototype, "request");
    userstub = stub(UserService.prototype, "persist");
    logstub = stub(LogService.prototype, "success");
    inqstub = stub(UserService.prototype, "ask");
  });

  afterEach(() => {
    datastub.restore();
    userstub.restore();
    logstub.restore();
    inqstub.restore();
  });

  it("signup() should return string", done => {

    inqstub.withArgs("signup")
      .returns(Promise.resolve({
        username: "test_user",
        password: "test_pass",
        email: "test@email.te",
        app: "test_app"
      }));

    logstub.callsFake(() => {
      done();
    });

    userstub.callsFake((app, data) => {
      const token = JSON.parse(data);

      expect(app).to.equal("test_app");
      expect(token).to.equal("test_token");

      return Promise.resolve(true);
    });

    datastub.callsFake((options, data) => {
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

    const program = command.signup();
    program.parse(["node", "domy", "signup"]);
  });

  it("login() should return string", done => {

    inqstub.withArgs("login")
      .returns(Promise.resolve({
        username: "test_user",
        password: "test_pass",
        app: "test_app"
      }));

    logstub.callsFake(data => {
      done();
    });

    userstub.callsFake((app, data) => {
      const token = JSON.parse(data);

      expect(app).to.equal("test_app");
      expect(token).to.equal("test_token");

      return Promise.resolve(true);
    });

    datastub.callsFake((options, data) => {
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

    const program = command.login();
    program.parse(["node", "domy", "login"]);
  });

});
