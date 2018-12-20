import { expect } from "chai";
import { stub } from "sinon";
import { HttpRepository } from "../../src/repositories/http.repository";

describe("DomProxy", () => {

  it("module should return Proxy", () => {

    stub(HttpRepository.prototype, "wait")
      .callsFake((type, dir, key) => {
        expect(dir).to.be.empty;
        expect(type).to.be.string;
        expect(key).to.equal("test_comp");

        return new Function("return 42")();
      });

    const dom = require("../../src/proxies/dom.proxy");
    expect(dom.test_comp).to.be.string;
  });

});
