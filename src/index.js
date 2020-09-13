const { createEmailDataAdapter } = require("./emailDataAdapter.js");
const {
  setupService: setupCurrentSelectionService,
} = require("./currentSelection.js");
const {
  setupService: setupRecentSelectionsService,
} = require("./recentSelections.js");
const { changeAtRandom } = require("./selectionModifier.js");

async function changeSelectedEmail(inputs) {
  const emailDataAdapter =
    inputs?.dependencies?.emailDataAdapter ?? createEmailDataAdapter();
  const currentSelectionService =
    inputs?.dependencies?.currentSelectionService ??
    setupCurrentSelectionService();
  const recentSelectionsService =
    inputs?.dependencies?.recentSelectionService ??
    setupRecentSelectionsService();

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
