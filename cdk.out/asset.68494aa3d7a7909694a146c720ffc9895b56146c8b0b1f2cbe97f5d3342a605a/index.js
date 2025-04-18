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

// src/services/swapi_record/handler.ts
var handler_exports = {};
__export(handler_exports, {
  handler: () => handler
});
module.exports = __toCommonJS(handler_exports);

// src/services/swapi_record/GetSwapiRecord.ts
var import_client_dynamodb = require("@aws-sdk/client-dynamodb");
var import_util_dynamodb = require("@aws-sdk/util-dynamodb");
async function getSwapiRecord(event, ddbClient2, context) {
  const limit = parseInt(event.queryStringParameters?.limit || "2");
  const startKey = event.queryStringParameters?.startKey || void 0;
  console.log("Limit:", limit);
  console.log("StartKey:", startKey);
  const scanParams = {
    TableName: process.env.TABLE_NAME,
    IndexName: "CreatedAtIndex",
    Limit: limit,
    ExclusiveStartKey: startKey ? JSON.parse(startKey) : void 0,
    ScanIndexForward: true
  };
  try {
    const scanResponse = await ddbClient2.send(new import_client_dynamodb.ScanCommand(scanParams));
    console.log("Scan response:", scanResponse);
    if (scanResponse.Items && scanResponse.Items.length > 0) {
      const unmarshalledItems = scanResponse.Items.map(
        (item) => (0, import_util_dynamodb.unmarshall)(item)
      );
      const response = {
        statusCode: 200,
        body: JSON.stringify({
          items: unmarshalledItems,
          lastEvaluatedKey: scanResponse.LastEvaluatedKey ? JSON.stringify(scanResponse.LastEvaluatedKey) : null
        })
      };
      return response;
    }
  } catch (err) {
    console.error("Error:", err.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
}

// src/services/swapi_record/handler.ts
var import_client_dynamodb2 = require("@aws-sdk/client-dynamodb");
var ddbClient = new import_client_dynamodb2.DynamoDBClient({});
async function handler(event, context) {
  let response;
  try {
    switch (event.httpMethod) {
      case "GET":
        console.log("GET method called");
        const getResponse = await getSwapiRecord(event, ddbClient, context);
        response = getResponse;
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
