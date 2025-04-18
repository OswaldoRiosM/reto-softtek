import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { createRandomId, parseJSON } from "../shared/Utils";
import { validateAschallengeUsersEntry } from "../shared/Validator";
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";

export async function postChallengeUsers(event: APIGatewayProxyEvent, ddbClient: DynamoDBClient, context: any): Promise<APIGatewayProxyResult> {
    
    try {
        const randomId = createRandomId();
        const item = parseJSON(event.body || '{}');
        item.id = randomId;

        console.log("Parsed item:", item);

        validateAschallengeUsersEntry(item);
        console.log("Validated item");
    
        const result = await ddbClient.send(new PutItemCommand({
            TableName: process.env.TABLE_NAME,
            Item: marshall(item)
        }));
        console.log("DynamoDB result:", result);
        return {
            statusCode: 201,
            body: JSON.stringify({id: randomId})
        }
    } catch (error: any) {
        console.error("Error:", error.message);
        return {
          statusCode: 500,
          body: JSON.stringify({ error: error.message }),
        };
    }

}