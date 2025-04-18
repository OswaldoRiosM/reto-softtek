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
  try {
    const pageSize = parseInt(event.queryStringParameters?.limit || "2");
    const page = parseInt(event.queryStringParameters?.page || "1");
    const fullScanResponse = await ddbClient2.send(new import_client_dynamodb.ScanCommand({
      TableName: process.env.TABLE_NAME
    }));
    const totalItems = fullScanResponse.Items?.length || 0;
    const totalPages = Math.ceil(totalItems / pageSize);
    const offset = (page - 1) * pageSize;
    let itemsFetched = [];
    let ExclusiveStartKey = void 0;
    let scannedCount = 0;
    while (itemsFetched.length < pageSize && scannedCount < totalItems) {
      const paginatedScan = await ddbClient2.send(new import_client_dynamodb.ScanCommand({
        TableName: process.env.TABLE_NAME,
        Limit: pageSize,
        ExclusiveStartKey
      }));
      scannedCount += paginatedScan.ScannedCount || 0;
      ExclusiveStartKey = paginatedScan.LastEvaluatedKey;
      if (scannedCount > offset) {
        const from = offset - (scannedCount - (paginatedScan.ScannedCount || 0));
        const slice = paginatedScan.Items?.slice(from >= 0 ? from : 0) || [];
        itemsFetched.push(...slice);
      }
      if (!paginatedScan.LastEvaluatedKey) break;
    }
    const unmarshalledItems = itemsFetched.map((item) => (0, import_util_dynamodb.unmarshall)(item));
    return {
      statusCode: 200,
      body: JSON.stringify({
        items: unmarshalledItems,
        currentPage: page,
        totalPages,
        pageSize,
        hasMore: page < totalPages
      })
    };
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
