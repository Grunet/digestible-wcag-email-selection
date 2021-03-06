const { createNetworkAdapter } = require("./networkAdapter.js");

class CurrentSelectionProxy {
  constructor(inputs) {
    const { networkAdapter, storageIds } = inputs;

    this.__networkAdapter = networkAdapter ?? createNetworkAdapter();
    this.__storageIds = { ...storageIds };
  }

  async get() {
    const { currentSelection } = await this.__networkAdapter.getJsonFileAsJsObj(
      {
        ...this.__storageIds,
      }
    );

    return currentSelection;
  }

  async set(selectionData) {
    await this.__networkAdapter.setJsObjIntoJsonFile({
      ...this.__storageIds,
      obj: { currentSelection: selectionData }, //TODO - avoid potential downstream mutations of the input by deep-copying it
    });
  }
}

function setupService(inputs) {
  return new CurrentSelectionProxy({
    networkAdapter: inputs?.dependencies?.networkAdapter,
    storageIds: inputs.storageIds,
  });
}

module.exports = {
  setupService: setupService,
};
