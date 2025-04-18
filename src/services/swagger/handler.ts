import { APIGatewayProxyHandler } from "aws-lambda";
import * as swaggerDoc from './swagger.json';

export const handler: APIGatewayProxyHandler = async () => {
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(swaggerDoc),
  };
};