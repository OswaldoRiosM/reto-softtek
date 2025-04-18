import { StarWarsCharacter } from "../model/Model";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import {
  DynamoDBClient,
  ScanCommand,
} from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";

export async function getSwapiRecord(
  event: APIGatewayProxyEvent,
  ddbClient: DynamoDBClient,
  context: any
): Promise<APIGatewayProxyResult> {
  try {
    const pageSize = parseInt(event.queryStringParameters?.limit || "2");
    const page = parseInt(event.queryStringParameters?.page || "1");

    const fullScanResponse = await ddbClient.send(new ScanCommand({
      TableName: process.env.TABLE_NAME,
    }));

    const totalItems = fullScanResponse.Items?.length || 0;
    const totalPages = Math.ceil(totalItems / pageSize);

    const offset = (page - 1) * pageSize;
    let itemsFetched: any[] = [];
    let ExclusiveStartKey = undefined;
    let scannedCount = 0;

    while (itemsFetched.length < pageSize && scannedCount < totalItems) {
      const paginatedScan = await ddbClient.send(new ScanCommand({
        TableName: process.env.TABLE_NAME,
        Limit: pageSize,
        ExclusiveStartKey,
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

    const unmarshalledItems = itemsFetched.map(item => unmarshall(item) as StarWarsCharacter);

    return {
      statusCode: 200,
      body: JSON.stringify({
        items: unmarshalledItems,
        currentPage: page,
        totalPages,
        pageSize,
        hasMore: page < totalPages
      }),
    };

  } catch (err: any) {
    console.error("Error:", err.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
}
