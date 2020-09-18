const { createEmailDataAdapter } = require("./emailDataAdapter.js");
const {
  setupService: setupCurrentSelectionService,
} = require("./currentSelection.js");
const {
  setupService: setupRecentSelectionsService,
} = require("./recentSelections.js");
const { changeAtRandom } = require("./selectionModifier.js");

async function changeSelectedEmail(inputs) {
  const emailDataAdapter = createEmailDataAdapter({
    dependencies: inputs.dependencies,
  });
  const currentSelectionService = setupCurrentSelectionService({
    dependencies: inputs.dependencies,
    storageIds: {
      bucket: inputs.s3.bucket.name,
      filename: inputs.s3.bucket.filenames.currentSelection,
    },
  });
  const recentSelectionsService = setupRecentSelectionsService({
    dependencies: inputs.dependencies,
    storageIds: {
      bucket: inputs.s3.bucket.name,
      filename: inputs.s3.bucket.filenames.recentSelections,
    },
  });

  await changeAtRandom({
    withReplacement: false,
    dependencies: {
      emailData: {
        getIds: emailDataAdapter.getAllIds.bind(emailDataAdapter),
        getEmailData: emailDataAdapter.getData.bind(emailDataAdapter),
      },
      currentSelection: {
        set: currentSelectionService.set.bind(currentSelectionService),
      },
      recentSelections: {
        getAll: recentSelectionsService.getAll.bind(recentSelectionsService),
        clearAll: recentSelectionsService.clearAll.bind(
          recentSelectionsService
        ),
        add: recentSelectionsService.add.bind(recentSelectionsService),
      },
    },
  });
}

module.exports = {
  changeSelectedEmail: changeSelectedEmail,
};
