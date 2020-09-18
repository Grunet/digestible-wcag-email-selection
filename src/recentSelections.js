const { createNetworkAdapter } = require("./networkAdapter.js");

class RecentSelectionsProxy {
  constructor(inputs) {
    const { networkAdapter, storageIds } = inputs;

    this.__networkAdapter = networkAdapter ?? createNetworkAdapter();
    this.__storageIds = { ...storageIds };
  }

  async getAll() {
    const { recentSelections } = await this.__networkAdapter.getJsonFileAsJsObj(
      {
        ...this.__storageIds,
      }
    );

    return recentSelections;
  }

  async clearAll() {
    await this.__networkAdapter.setJsObjIntoJsonFile({
      ...this.__storageIds,
      obj: { recentSelections: [] },
    });
  }

  async add(selectionData) {
    const { id } = selectionData;

    const recentSelections = await this.getAll();

    const updatedRecentSelections = recentSelections.concat([
      {
        id: id,
        timestamp: new Date().toJSON(),
      },
    ]);

    await this.__networkAdapter.setJsObjIntoJsonFile({
      ...this.__storageIds,
      obj: { recentSelections: updatedRecentSelections },
    });
  }
}

function setupService(inputs) {
  return new RecentSelectionsProxy({
    networkAdapter: inputs?.dependencies?.networkAdapter,
    storageIds: inputs.storageIds,
  });
}

module.exports = {
  setupService: setupService,
};
