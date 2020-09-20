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
  test("Every email is guaranteed to be selected 2 times before any email is selected 3 times", async () => {
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
    while (__getCountOfMostCommonElement(selectedSubjects) <= 2) {
      await changeSelectedEmail(inputs);

      const { subject } = await getDataFromCurrentSelection(inputs);

      selectedSubjects.push(subject);
    }

    //Assert
    const previouslySelectedSubjects = selectedSubjects.slice(0, -1);
    const countsOfPreviouslySelectedSubjects = __getCountsOfElements(
      previouslySelectedSubjects
    );

    expect(countsOfPreviouslySelectedSubjects).toEqual(Array(4).fill(2));
  });
});

// Helper functions
function __getCountOfMostCommonElement(arr) {
  return Math.max(...__getCountsOfElements(arr));
}

function __getCountsOfElements(arr) {
  return Array.from(new Set(arr)).map(
    (val) => arr.filter((v) => v === val).length
  );
}
