const {
  resetInputsToDefaults,
  changeSelectedEmail,
  getDataFromCurrentSelection,
} = require("../../../dist/index.js");

function __createMockNetworkAdapter(mockData) {
  return {
    getTextFileContents: () => {
      //This should be updated to return mock html/text content if needed
      return undefined;
    },
    getJsonFileAsJsObj: (inputs) => {
      if (inputs?.url?.includes("emailMetadata")) {
        return mockData.emailMetadata;
      }

      if (inputs?.filename?.includes("currentSelection")) {
        return mockData.currentSelection;
      }

      if (inputs?.filename?.includes("recentSelections")) {
        return mockData.recentSelections;
      }
    },
    setJsObjIntoJsonFile: (inputs) => {
      if (inputs?.filename?.includes("currentSelection")) {
        mockData.currentSelection = inputs.obj;
      }

      if (inputs?.filename?.includes("recentSelections")) {
        return (mockData.recentSelections = inputs.obj);
      }
    },
  };
}

function __combineMockInputs(mockNetworkAdapter) {
  return {
    dependencies: {
      networkAdapter: mockNetworkAdapter,
    },
    s3: {
      bucket: {
        name: "unused",
        filenames: {
          currentSelection: "currentSelection.json",
          recentSelections: "recentSelections.json",
        },
      },
    },
  };
}

describe("changeSelectedEmail", () => {
  test("After the 2nd time an email is selected, all other emails will be selected once before that email is selected again", async () => {
    //Arrange
    const mockNetworkAdapter = __createMockNetworkAdapter({
      emailMetadata: {
        emails: [
          {
            id: "1",
            subject: "1st Subject",
            filenames: { html: "unused", plainText: "unused" },
          },
          {
            id: "2",
            subject: "2nd Subject",
            filenames: { html: "unused", plainText: "unused" },
          },
          {
            id: "3",
            subject: "3rd Subject",
            filenames: { html: "unused", plainText: "unused" },
          },
          {
            id: "4",
            subject: "4th Subject",
            filenames: { html: "unused", plainText: "unused" },
          },
        ],
      },
      currentSelection: {},
      recentSelections: {},
    });
    const inputs = __combineMockInputs(mockNetworkAdapter);

    //Act
    await resetInputsToDefaults(inputs);

    const selectedSubjects = [];
    while (__getCountOfMostCommonElement(selectedSubjects) < 3) {
      await changeSelectedEmail(inputs);

      const { subject } = await getDataFromCurrentSelection(inputs);

      selectedSubjects.push(subject);
    }

    //Assert
    const subjectSelectedThreeTimes =
      selectedSubjects[selectedSubjects.length - 1];
    const indexOfItsSecondAppearance = selectedSubjects.lastIndexOf(
      subjectSelectedThreeTimes,
      -2
    );
    const subjectsSelectedInBetweenItsAppearances = selectedSubjects.slice(
      indexOfItsSecondAppearance + 1,
      -1
    );

    expect(new Set(subjectsSelectedInBetweenItsAppearances).size).toBe(4 - 1);
  });
});

// Helper functions
function __getCountOfMostCommonElement(arr) {
  return Math.max(
    ...Array.from(new Set(arr)).map(
      (val) => arr.filter((v) => v === val).length
    )
  );
}
