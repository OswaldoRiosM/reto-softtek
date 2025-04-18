var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/services/challenge_users/handler.ts
var handler_exports = {};
__export(handler_exports, {
  handler: () => handler
});
module.exports = __toCommonJS(handler_exports);

// src/services/shared/Utils.ts
var import_crypto = require("crypto");

// src/services/shared/Validator.ts
var MissingFieldError = class extends Error {
  constructor(missingField) {
    super(`Value for ${missingField} expected!`);
  }
};
var JsonError = class extends Error {
};
function validateAschallengeUsersEntry(arg) {
  if (arg.id == void 0) {
    throw new MissingFieldError("id");
  }
  if (arg.name == void 0) {
    throw new MissingFieldError("name");
  }
  if (arg.last_name == void 0) {
    throw new MissingFieldError("last_name");
  }
  if (arg.email == void 0) {
    throw new MissingFieldError("email");
  }
  if (arg.biography == void 0) {
    throw new MissingFieldError("biography");
  }
  if (arg.isActive == void 0) {
    throw new MissingFieldError("isActive");
  }
}

// src/services/shared/Utils.ts
function createRandomId() {
  return (0, import_crypto.randomUUID)();
}
function parseJSON(arg) {
  try {
    return JSON.parse(arg);
  } catch (error) {
    throw new JsonError(error.message);
  }
}

// src/services/challenge_users/PostChallengeUsers.ts
var import_client_dynamodb = require("@aws-sdk/client-dynamodb");
var import_util_dynamodb = require("@aws-sdk/util-dynamodb");
async function postChallengeUsers(event, ddbClient2, context) {
  try {
    const randomId = createRandomId();
    const item = parseJSON(event.body || "{}");
    item.id = randomId;
    validateAschallengeUsersEntry(item);
    const result = await ddbClient2.send(new import_client_dynamodb.PutItemCommand({
      TableName: process.env.TABLE_NAME,
      Item: (0, import_util_dynamodb.marshall)(item)
    }));
    return {
      statusCode: 201,
      body: JSON.stringify({ id: randomId })
    };
  } catch (error) {
    console.error("Error:", error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
}

// src/services/challenge_users/handler.ts
var import_client_dynamodb2 = require("@aws-sdk/client-dynamodb");
var ddbClient = new import_client_dynamodb2.DynamoDBClient({});
async function handler(event, context) {
  let response;
  try {
    switch (event.httpMethod) {
      case "POST":
        const postResponse = await postChallengeUsers(event, ddbClient, context);
        response = postResponse;
        break;
      default:
        response = {
          statusCode: 405,
          body: JSON.stringify({ message: "Method Not Allowed" })
        };
    }
  } catch (error) {
    console.error("Error:", error);
    response = {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal Server Error" })
    };
  }
  console.log("event", event);
  return response;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  handler
});
