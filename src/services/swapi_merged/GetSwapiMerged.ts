import axios from "axios";
import * as https from "https";
import { StarWarsCharacter } from "../model/Model";
import { getLastMission } from "./GetLastMission";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import {
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand,
} from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { createRandomId } from "../shared/Utils";

const axiosInstance = axios.create({
  httpsAgent: new https.Agent({ rejectUnauthorized: false }),
  timeout: 5000,
});

export async function getSwapiMerged(
  event: APIGatewayProxyEvent,
  ddbClient: DynamoDBClient,
  context: any
): Promise<APIGatewayProxyResult> {
  const baseUrl = process.env.SWAPI_PEOPLE_URL;
  let isCache = false;
  let cachedData: any = null;

  if (!baseUrl) {
    console.error("Missing environment variables SWAPI_PEOPLE_URL");
  }

  const id = event.queryStringParameters?.id;

  if (!id) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing id query parameter" }),
    };
  }

  const cachedItem = await ddbClient.send(
    new GetItemCommand({
      TableName: process.env.TABLE_CACHE_NAME,
      Key: marshall({ id }),
    })
  );
  console.log("Cached item:", cachedItem.Item);

  if (cachedItem.Item) {
    console.log("cachedItem.Item:");
    const unmarshalled = unmarshall(cachedItem.Item);
    const currentTime = Math.floor(Date.now() / 1000);
    console.log("Current time:", currentTime);
    console.log("unmarshalled:", unmarshalled);
    if (unmarshalled.ttl > currentTime) {
      isCache = true;
      cachedData = unmarshalled;
    }
  }

  try {
    // const fullUrl = `${baseUrl}${id}/`;
    // console.log(`Fetching data from ${fullUrl}`);

    const response = isCache
    ? { data: cachedData }
    : await axiosInstance.get<StarWarsCharacter>(`${baseUrl}${id}/`)


    // const response = await axiosInstance.get<StarWarsCharacter>(fullUrl);
    const mission =isCache ? { data: cachedData }
    :  await getLastMission();
    const randomId = createRandomId();
    const characterData  = {
      id: randomId,
      name: response.data.name,
      height: Number(response.data.height),
      mass: Number(response.data.mass),
      hair_color: response.data.hair_color,
      skin_color: response.data.skin_color,
      eye_color: response.data.eye_color,
      birth_year: response.data.birth_year,
      gender: response.data.gender,
      homeworld: response.data.homeworld,
      lastmission: mission,
      //lastmission: "Climb a glacier",
      createdAt: new Date().toISOString(),
    };

    const result = await ddbClient.send(
      new PutItemCommand({
        TableName: process.env.TABLE_NAME,
        Item: marshall(characterData ),
      })
    );

    if (!isCache) {
      const CharacterCache = {
        id: id,
        name: response.data.name,
        height: Number(response.data.height),
        mass: Number(response.data.mass),
        hair_color: response.data.hair_color,
        skin_color: response.data.skin_color,
        eye_color: response.data.eye_color,
        birth_year: response.data.birth_year,
        gender: response.data.gender,
        homeworld: response.data.homeworld,
        //lastmission: mission,
        lastmission: response.data.lastmission,
        ttl: Math.floor(Date.now() / 1000) + 1800,
        createdAt: new Date().toISOString(),
      };

      await ddbClient.send(
        new PutItemCommand({
          TableName: process.env.TABLE_CACHE_NAME,
          Item: marshall(CharacterCache),
        })
      );
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: isCache
          ? "Returned from cache (but wrote to DB)"
          : "Fetched and stored",
        item: characterData,
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
