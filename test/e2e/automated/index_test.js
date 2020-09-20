const {
  resetInputsToDefaults,
  changeSelectedEmail,
  getDataFromCurrentSelection,
} = require("../../../dist/index.js");

const S3 = require("aws-sdk/clients/s3");
const s3Client = new S3();

const awsPointers = {
  bucketName: "test--digestible-wcag-email-selection",
  currentSelectionFilename: "test--currentSelection.json",
  recentSelectionsFilename: "test--recentSelections.json",
};

beforeAll(async () => {
  await s3Client
    .createBucket({
      Bucket: awsPointers.bucketName,
    })
    .promise();
  await s3Client
    .putObject({
      Bucket: awsPointers.bucketName,
      Key: awsPointers.currentSelectionFilename,
      Body: "",
    })
    .promise();
  await s3Client
    .putObject({
      Bucket: awsPointers.bucketName,
      Key: awsPointers.recentSelectionsFilename,
      Body: "",
    })
    .promise();
});

afterAll(async () => {
  await s3Client
    .deleteObjects({
      Bucket: awsPointers.bucketName,
      Delete: {
        Objects: [
          { Key: awsPointers.currentSelectionFilename },
          { Key: awsPointers.recentSelectionsFilename },
        ],
      },
    })
    .promise();
  await s3Client
    .deleteBucket({
      Bucket: awsPointers.bucketName,
    })
    .promise();
});

const inputs = {
  s3: {
    bucket: {
      name: awsPointers.bucketName,
      filenames: {
        currentSelection: awsPointers.currentSelectionFilename,
        recentSelections: awsPointers.recentSelectionsFilename,
      },
    },
  },
};

beforeEach(async () => {
  await resetInputsToDefaults(inputs);
});

describe("changeSelectedEmail", () => {
  test("Runs without crashing", async () => {
    //Arrange
    // Done by the beforeAll/beforeEach

    //Act
    await changeSelectedEmail(inputs);

    const { html, plainText, subject } = await getDataFromCurrentSelection(
      inputs
    );

    //Assert
    expect(html).toBeTruthy();
    expect(plainText).toBeTruthy();
    expect(subject).toBeTruthy();
  });
});
