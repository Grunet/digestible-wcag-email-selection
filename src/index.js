const { createEmailDataAdapter } = require("./emailDataAdapter.js");
const {
  setupService: setupCurrentSelectionService,
} = require("./currentSelection.js");
const {
  setupService: setupRecentSelectionsService,
} = require("./recentSelections.js");
const { changeAtRandom } = require("./selectionModifier.js");

async function resetInputsToDefaults(inputs) {
  const { currentSelectionService, recentSelectionsService } = __setupServices(
    inputs
  );

  await Promise.all([
    currentSelectionService.set({}),
    recentSelectionsService.clearAll(),
  ]);
}

async function changeSelectedEmail(inputs) {
  const { emailDataAdapter } = __setupAdapters(inputs);
  const { currentSelectionService, recentSelectionsService } = __setupServices(
    inputs
  );

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

async function getDataFromCurrentSelection(inputs) {
  const { currentSelectionService } = __setupServices(inputs);

  return await currentSelectionService.get();
}

function __setupAdapters(inputs) {
  const emailDataAdapter = createEmailDataAdapter({
    dependencies: inputs.dependencies,
  });

  return {
    emailDataAdapter: emailDataAdapter,
  };
}

function __setupServices(inputs) {
  const {
    s3: {
      bucket: {
        name: bucketName,
        filenames: {
          currentSelection: currentSelectionFilename,
          recentSelections: recentSelectionsFilename,
        },
      },
    },
  } = inputs;

  const currentSelectionService = setupCurrentSelectionService({
    dependencies: inputs.dependencies,
    storageIds: {
      bucket: bucketName,
      filename: currentSelectionFilename,
    },
  });
  const recentSelectionsService = setupRecentSelectionsService({
    dependencies: inputs.dependencies,
    storageIds: {
      bucket: bucketName,
      filename: recentSelectionsFilename,
    },
  });

  return {
    currentSelectionService: currentSelectionService,
    recentSelectionsService: recentSelectionsService,
  };
}

module.exports = {
  resetInputsToDefaults: resetInputsToDefaults,
  changeSelectedEmail: changeSelectedEmail,
  getDataFromCurrentSelection: getDataFromCurrentSelection,
};
