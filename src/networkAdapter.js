class NetworkAdapter {
  constructor() {
    this.__adapters = {
      fetch: new FetchAdapter(),
    };
  }

  async getTextFileContents(inputs) {
    const adapter = this.__getAdapterToUse(inputs);

    let adapterInputs = [];
    switch (adapter) {
      case this.__adapters.fetch:
        adapterInputs = [inputs.url];
        break;
    }

    return await adapter.getTextFileContents(...adapterInputs);
  }

  async getJsonFileAsJsObj(inputs) {
    const adapter = this.__getAdapterToUse(inputs);

    let adapterInputs = [];
    switch (adapter) {
      case this.__adapters.fetch:
        adapterInputs = [inputs.url];
        break;
    }

    return await adapter.getJsonFileAsJsObj(...adapterInputs);
  }

  __getAdapterToUse(inputs) {
    if ("url" in inputs) {
      return this.__adapters.fetch;
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
