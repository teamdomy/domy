import { prompt } from "inquirer";
import { expect } from "chai";
import { stub } from "sinon";
import { UserCommand } from "../../src/commands/user.command";
import { HttpService } from "../../src/services/http.service";
import { LogService } from "../../src/services/log.service";
import { UserService } from "../../src/services/user.service";
import { FileService } from "../../src/services/file.service";

describe("UserCommand", () => {

  const command = new UserCommand();

  let nodestub;
  let persiststub;
  let logstub;
  let inqstub;

  beforeEach(() => {
    nodestub = stub(HttpService.prototype, "request");
    persiststub = stub(FileService.prototype, "persist")
      .callsFake((user, token) => {
        expect(user).to.equal("test_user");
        expect(token).to.equal("test_token");
        return Promise.resolve(true);
      });
    logstub = stub(LogService.prototype, "success");
    inqstub = stub(UserService.prototype, "inquire");
  });

  afterEach(() => {
    nodestub.restore();
    persiststub.restore();
    logstub.restore();
    inqstub.restore();
  });

  it("signup() should return string", done => {

    inqstub.withArgs("signup")
      .returns(Promise.resolve({
        username: "test_user",
        password: "test_pass",
        email: "test@email.te"
      }));

    logstub.callsFake(() => {
      done();
    });

    nodestub.callsFake((options, data) => {
      expect(options.method).to.equal("POST");
      expect(options.path).to.be.a("string");
      expect(options.path).to.contain("signup");

      const content = JSON.parse(data);

      expect(content.user).to.equal("test_user");
      expect(content.pass).to.equal("test_pass");
      expect(content.mail).to.equal("test@email.te");

      return Promise.resolve("test_token");
    });

    const program = command.signup();
    program.parse(["node", "domy", "signup"]);
  });

  it("login() should return string", done => {

    inqstub.withArgs("login")
      .returns(Promise.resolve({
        username: "test_user",
        password: "test_pass"
      }));

    logstub.callsFake(data => {
      done();
    });

    nodestub.callsFake((options, data) => {
      expect(options.method).to.equal("POST");
      expect(options.path).to.be.a("string");
      expect(options.path).to.contain("login");

      const content = JSON.parse(data);

      expect(content.user).to.equal("test_user");
      expect(content.pass).to.equal("test_pass");

      return Promise.resolve("test_token");
    });

    const program = command.login();
    program.parse(["node", "domy", "login"]);
  });

});
