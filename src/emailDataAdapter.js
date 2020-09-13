const fetch = require("node-fetch");

const pathToTemplates =
  "https://raw.githubusercontent.com/Grunet/digestible-wcag-sc-emails/master/dist/";
const metadataFilename = "emailMetadata.json";

class EmailDataAdapter {
  constructor() {
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
      id,
      filenames: { html: htmlFilename, plainText: plainTextFilename },
      subject,
    } = metadataOfMatchingEmail;

    const [emailHtml, emailPlainText] = await Promise.all(
      [htmlFilename, plainTextFilename].map(async function (filename) {
        const res = await fetch(`${pathToTemplates}${filename}`);
        return await res.text();
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
      const metadataRes = await fetch(`${pathToTemplates}${metadataFilename}`);
      const metadataObj = await metadataRes.json();

      this.__cache.emailMetadata = metadataObj;
    }

    return this.__cache.emailMetadata;
  }
}

function createEmailDataAdapter() {
  return new EmailDataAdapter();
}

module.exports = {
  createEmailDataAdapter: createEmailDataAdapter,
};
