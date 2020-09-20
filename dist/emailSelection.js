const { setupService } = require("../src/currentSelection.js");

async function getDataFromCurrentSelection(inputs) {
  const {
    s3: {
      bucket: {
        name: bucketName,
        filenames: { currentSelection: currentSelectionFilename },
      },
    },
  } = inputs;

  return await setupService({
    storageIds: {
      bucket: bucketName,
      filename: currentSelectionFilename,
    },
  }).get();
}

module.exports = {
  getDataFromCurrentSelection: getDataFromCurrentSelection,
};
