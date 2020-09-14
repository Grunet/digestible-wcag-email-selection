class NetworkAdapter {
  constructor() {
    this.__adapters = {
      fetch: new FetchAdapter(),
    };
  }

  async getTextFileContents(inputs) {
    const { adapter, key: adapterKey } = this.__getAdapterToUse(inputs);

    let adapterInputs = [];
    switch (adapterKey) {
      case "fetch":
        adapterInputs = [inputs.url];
        break;
      default:
        throw new Error(
          `${adapterKey}'s adapter hasn't been implemented yet for this method`
        );
    }

    return await adapter.getTextFileContents(...adapterInputs);
  }

  async getJsonFileAsJsObj(inputs) {
    const { adapter, key: adapterKey } = this.__getAdapterToUse(inputs);

    let adapterInputs = [];
    switch (adapterKey) {
      case "fetch":
        adapterInputs = [inputs.url];
        break;
      default:
        throw new Error(
          `${adapterKey}'s adapter hasn't been implemented yet for this method`
        );
    }

    return await adapter.getJsonFileAsJsObj(...adapterInputs);
  }

  __getAdapterToUse(inputs) {
    if ("url" in inputs) {
      return { key: "fetch", adapter: this.__adapters.fetch };
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
