const { setupService } = require("../src/currentSelection.js");

async function getDataFromCurrentSelection(inputs) {
  return await setupService({
    storageIds: {
      bucket: inputs.s3.bucket.name,
      filename: inputs.s3.bucket.filenames.currentSelection,
    },
  }).get();
}

module.exports = {
  getDataFromCurrentSelection: getDataFromCurrentSelection,
};
