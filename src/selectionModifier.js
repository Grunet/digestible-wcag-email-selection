async function changeAtRandom(inputs) {
  const {
    withReplacement,
    dependencies: {
      emailData: { getIds: getEmailIds, getEmailData: getEmailDataForId },
      currentSelection: { set: setCurrentSelection },
      recentSelections: {
        getAll: getAllRecentSelections,
        clearAll: clearAllRecentSelections,
        add: addToRecentSelections,
      },
    },
  } = inputs;

  const [setOfAllEmailIds, recentEmailSelections] = await Promise.all([
    getEmailIds(),
    getAllRecentSelections(),
  ]);

  const allEmailIds = Array.from(setOfAllEmailIds);
  const recentEmailIds = recentEmailSelections.map((obj) => obj.id);

  let idsNotRecentlyUsed = allEmailIds.filter(
    (id) => !recentEmailIds.includes(id)
  );

  if (idsNotRecentlyUsed.length === 0) {
    await clearAllRecentSelections();
    idsNotRecentlyUsed = allEmailIds;
  }

  const newlySelectedId =
    idsNotRecentlyUsed[Math.floor(idsNotRecentlyUsed.length * Math.random())];

  const newEmailData = await getEmailDataForId(newlySelectedId);
  await setCurrentSelection(newEmailData);

  if (withReplacement === false) {
    await addToRecentSelections(newEmailData);
  }
}

module.exports = {
  changeAtRandom: changeAtRandom,
};
