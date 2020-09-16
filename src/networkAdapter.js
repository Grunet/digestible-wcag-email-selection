class NetworkAdapter {
  constructor() {
    this.__adapters = {
      fetch: new FetchAdapter(),
      s3: new S3Adapter(),
    };
  }

  async getTextFileContents(inputs) {
    const { adapter, key: adapterKey } = this.__getAdapterToUse(inputs);

    let adapterInputs = [];
    switch (adapterKey) {
      case "fetch":
        const { url } = inputs;
        adapterInputs = [url];
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
        const { url } = inputs;
        adapterInputs = [url];
        break;
      case "s3":
        const { bucket, filename } = inputs;
        adapterInputs = [{ bucket: bucket, key: filename }];
        break;
      default:
        throw new Error(
          `${adapterKey}'s adapter hasn't been implemented yet for this method`
        );
    }

    return await adapter.getJsonFileAsJsObj(...adapterInputs);
  }

  async setJsObjIntoJsonFile(inputs) {
    const { adapter, key: adapterKey } = this.__getAdapterToUse(inputs);

    let adapterInputs = [];
    switch (adapterKey) {
      case "s3":
        const { bucket, filename, obj } = inputs;
        adapterInputs = [{ bucket: bucket, key: filename }, obj];
        break;
      default:
        throw new Error(
          `${adapterKey}'s adapter hasn't been implemented yet for this method`
        );
    }

    return await adapter.setJsObjIntoJsonFile(...adapterInputs);
  }

  __getAdapterToUse(inputs) {
    if ("url" in inputs) {
      return { key: "fetch", adapter: this.__adapters.fetch };
    }

    if ("bucket" in inputs) {
      return { key: "s3", adapter: this.__adapters.s3 };
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

class S3Adapter {
  constructor() {
    const S3 = require("aws-sdk/clients/s3");
    this.__s3 = new S3();
  }

  async getJsonFileAsJsObj(storageIdentifiers) {
    const { bucket, key } = storageIdentifiers;

    const res = await this.__s3
      .getObject({
        Bucket: bucket,
        Key: key,
      })
      .promise();

    const json = res?.Body?.toString();
    if (!json) {
      throw new Error("Response from AWS get request to S3 bucket was empty");
    }

    const jsObj = JSON.parse(json);

    return jsObj;
  }

  async setJsObjIntoJsonFile(storageIdentifiers, jsObj) {
    const { bucket, key } = storageIdentifiers;

    const json = JSON.stringify(jsObj, null, 4);

    await this.__s3
      .putObject({
        Bucket: bucket,
        Key: key,
        Body: json,
      })
      .promise(); //This does return a currently unused response object
  }
}

function createNetworkAdapter() {
  return new NetworkAdapter();
}

module.exports = {
  createNetworkAdapter: createNetworkAdapter,
};
