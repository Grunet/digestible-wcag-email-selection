const { createNetworkAdapter } = require("./networkAdapter.js");

const pathToTemplates =
  "https://raw.githubusercontent.com/Grunet/digestible-wcag-sc-emails/master/dist/";
const metadataFilename = "emailMetadata.json";

class EmailDataAdapter {
  constructor(inputs) {
    const { networkAdapter } = inputs;
    this.__networkAdapter = networkAdapter ?? createNetworkAdapter();

    this.__cache = {};
  }

  async getAllIds() {
    const emailMetadata = await this.__get__emailMetadata();

    const emailIds = emailMetadata["emails"].map((emailObj) => emailObj["id"]);

    return new Set(emailIds);
  }

  async getData(id) {
    const emailMetadata = await this.__get__emailMetadata();

    const metadataOfMatchingEmail = emailMetadata["emails"].find(
      (emailObj) => emailObj["id"] === id
    );
    if (!metadataOfMatchingEmail) {
      throw new Error(`No email found with an id of ${id}`);
    }

    const {
      filenames: { html: htmlFilename, plainText: plainTextFilename },
      subject,
    } = metadataOfMatchingEmail;

    const [emailHtml, emailPlainText] = await Promise.all(
      [htmlFilename, plainTextFilename].map(async (filename) => {
        return await this.__networkAdapter.getTextFileContents({
          url: `${pathToTemplates}${filename}`,
        });
      })
    );

    return {
      id: id,
      html: emailHtml,
      plainText: emailPlainText,
      subject: subject,
    };
  }

  async __get__emailMetadata() {
    if (!this.__cache.emailMetadata) {
      const metadataObj = await this.__networkAdapter.getJsonFileAsJsObj({
        url: `${pathToTemplates}${metadataFilename}`,
      });

      this.__cache.emailMetadata = metadataObj;
    }

    return this.__cache.emailMetadata;
  }
}

function createEmailDataAdapter(inputs) {
  return new EmailDataAdapter({
    networkAdapter: inputs?.dependencies?.networkAdapter,
  });
}

module.exports = {
  createEmailDataAdapter: createEmailDataAdapter,
};
