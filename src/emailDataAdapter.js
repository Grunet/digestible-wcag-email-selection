const pathToTemplates =
  "https://raw.githubusercontent.com/Grunet/digestible-wcag-sc-emails/master/dist/";
const metadataFilename = "emailMetadata.json";

class EmailDataAdapter {
  constructor(inputs) {
    const { networkAdapter } = inputs;
    this.__networkAdapter = networkAdapter ?? new FetchAdapter();

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
        return await this.__networkAdapter.getTextFileContents(
          `${pathToTemplates}${filename}`
        );
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
      const metadataObj = await this.__networkAdapter.getJsonFileAsJsObj(
        `${pathToTemplates}${metadataFilename}`
      );

      this.__cache.emailMetadata = metadataObj;
    }

    return this.__cache.emailMetadata;
  }
}

class FetchAdapter {
  constructor() {
    this.__fetch = require("node-fetch");
  }

  async getTextFileContents(url) {
    const res = await this.__fetch(url);
    return await res.text();
  }

  async getJsonFileAsJsObj(url) {
    const res = await this.__fetch(url);
    return await res.json();
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
