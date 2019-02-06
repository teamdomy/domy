import { expect } from "chai";
import { stub } from "sinon";
import manifest from "../static/collection-manifest.json";
import components from "../static/web-components.json";
import { DomyService } from "../../src/services/domy.service";
import { HttpService } from "../../src/services/http.service";
import { FileService } from "../../src/services/file.service";

describe("DomyService", () => {

  const service = new DomyService();

  let request;
  let write;
  let configure;


  beforeEach(() => {

    request = stub(HttpService.prototype, "request");

    write = stub(FileService.prototype, "write")
      .returns(
        Promise.resolve(true)
      );

    configure = stub(FileService.prototype, "configure")
      .returns(
        Promise.resolve(
          JSON.stringify({
            user: "test_user",
            key: "test_key",
            dir: "test_user"
          })
        )
      );
  });

  afterEach(() => {
    request.restore();
    write.restore();
    configure.restore();
  });


  it("list() should return a Promise<string[]>", done => {

    const content = [
      "dir/file.js",
      "dir/file.css",
      "dir/file.json"
    ];

    request.callsFake(options => {
      expect(options.method).to.equal("GET");
      expect(options.path).to.be.a("string");
      expect(options.path).to.contain("test_user");
      expect(options.path).to.contain("latest");

      return Promise.resolve(
        JSON.stringify(content)
      );
    });

    service.list("test_user", "component", "latest")
      .then(result => {
        expect(result).to.contain("dir/file.js");
        expect(result).to.contain("dir/file.css");
        done();
      });
  });

  it("get() should return a Promise<string>", done => {

    request.callsFake(options => {
      expect(options.method).to.equal("GET");
      expect(options.path).to.be.a("string");
      expect(options.path).to.contain("Example.jsx");

      return Promise.resolve(
        JSON.stringify("test_content")
      );
    });

    service.get("Example.jsx")
      .then(result => {
        expect(result).to.equal(
          JSON.stringify("test_content")
        );
        done();
      });
  });

  it("set() should return a Promise<string>", done => {

    request.callsFake((options, content) => {
      expect(options.method).to.equal("PUT");
      expect(options.path).to.be.a("string");
      expect(options.path).to.contain("dir");
      expect(options.path).to.contain("Example");
      expect(content).to.equal("test_content");

      return Promise.resolve(
        JSON.stringify(true)
      );
    });

    service.set(
      "dir",
      "Example",
      "latest",
      "dir/first.jsx",
      "test_content"
    )
      .then(result => {
        expect(JSON.parse(result)).to.be.true;
        done();
      });
  });

  it("del() should return a Promise<string>", done => {

    request.callsFake(options => {
      expect(options.method).to.equal("DELETE");
      expect(options.path).to.be.a("string");
      expect(options.path).to.contain("Example");

      return Promise.resolve(true);
    });

    service.del("Example.jsx")
      .then(result => {
        expect(result).to.be.true;
        done();
      });
  });

  // // it("extract() should return an Object", () => {
  // //
  // //   const data = service.extract(
  // //     manifest,
  // //     manifest.components[0]
  // //   );
  // //
  // //   expect(data.components.length).to.equal(1);
  // //   expect(data).to.have.ownProperty("compiler");
  // // });

  it("gather() should return a Promise<void>", done => {

     request.callsFake((options, content) => {
       expect(options.method).to.equal("PUT");
       expect(options.path).to.be.a("string");
       expect(options.path).to.contain("catalog");
       expect(options.path).to.contain("app-home");
       expect(content).to.be.a("string");

       return Promise.resolve(
         JSON.stringify(true)
       );
     });

     const read = stub(FileService.prototype, "read")
      .onCall(0).returns(
        Promise.resolve(
          JSON.stringify(manifest)
        )
      )
      .onCall(1).returns(
        Promise.resolve(
          JSON.stringify(components)
        )
      )
      .onCall(2).returns(
        Promise.resolve(
          "test_js_content"
        )
      )
      .onCall(3).returns(
        Promise.resolve(
          "test_css_content"
        )
     );

    service.gather("app-home", "latest", "catalog")
      .then(() => {
        done();
      });
  });


  it("pipe() should return a Function", done => {

    request.callsFake((options, content) => {
      expect(options.method).to.equal("PUT");
      expect(options.path).to.be.a("string");
      expect(options.path).to.contain("catalog");
      expect(options.path).to.contain("name");
      expect(content).to.equal("test_content");

      return  Promise.resolve(
        JSON.stringify(true)
      );
    });

    const pipe = service.pipe
    ("name", "base", "latest", "catalog")
    ("dir/path/test", "test_content")
      .then(result => {
        expect(result).to.be.string;
        done();
      });
  });

  it("save() should return a Promise<boolean>", done => {
    service.save("catalog", "component", "pathway", "test_content")
      .then(result => {
        expect(result).to.be.true;
        done();
      });
  });

  it("assert() should return a Promise<boolean>", done => {
    service.assert("Component")
      .then(result => {
        expect(result).to.be.true;
        done();
      });
  });

});
