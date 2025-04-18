import { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";
import { get } from "http";
import { Context } from "vm";
import { postChallengeUsers } from "./PostChallengeUsers";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

const ddbClient = new DynamoDBClient({});

async function handler(
  event: APIGatewayEvent,
  context: Context
): Promise<APIGatewayProxyResult> {
  let response: APIGatewayProxyResult;
  try {
    switch (event.httpMethod) {
      case "POST":
        const postResponse = await postChallengeUsers(event,ddbClient, context);
        response = postResponse;
        break;
      default:
        response = {
          statusCode: 405,
          body: JSON.stringify({ message: "Method Not Allowed" }),
        };
    }
  } catch (error) {
    console.error("Error:", error);
    response = {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal Server Error" }),
    };
  }
  console.log("event", event);
  return response;
}

export { handler };
