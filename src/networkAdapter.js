class NetworkAdapter {
  constructor() {
    this.__adapters = {
      fetch: new FetchAdapter(),
    };
  }

  async getTextFileContents(inputs) {
    if ("url" in inputs) {
      const { url } = inputs;
      return await this.__adapters.fetch.getTextFileContents(url);
    }

    throw new Error("Unrecognized inputs: ", inputs);
  }

  async getJsonFileAsJsObj(inputs) {
    if ("url" in inputs) {
      const { url } = inputs;
      return await this.__adapters.fetch.getJsonFileAsJsObj(url);
    }

    throw new Error("Unrecognized inputs: ", inputs);
  }
}

class FetchAdapter {
  constructor() {
    this.__fetch = require("node-fetch");
  }

  async getTextFileContents(url) {
    const res = await this.__fetch(url);
    return await res.text();
  }

  async getJsonFileAsJsObj(url) {
    const res = await this.__fetch(url);
    return await res.json();
  }
}

function createNetworkAdapter() {
  return new NetworkAdapter();
}

module.exports = {
  createNetworkAdapter: createNetworkAdapter,
};
