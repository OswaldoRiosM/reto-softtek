import { mockClient } from 'aws-sdk-client-mock';
import { DynamoDBClient, GetItemCommand, PutItemCommand } from '@aws-sdk/client-dynamodb';
import axios from 'axios';
import { getSwapiMerged } from '../../services/swapi_merged/GetSwapiMerged';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { marshall } from '@aws-sdk/util-dynamodb';


jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;


const ddbMock = mockClient(DynamoDBClient);

const someCacheItem = {
  ttl: Math.floor(Date.now() / 1000) + 1800,
  id: '1',
  name: 'Luke Skywalker',
  height: 172,
  mass: 77,
  hair_color: 'blond',
  skin_color: 'fair',
  eye_color: 'blue',
  birth_year: '19BBY',
  gender: 'male',
  homeworld: 'https://swapi.dev/api/planets/1/',
};

const someItem = {
  Item: marshall({
    id: '1',
    name: 'Luke Skywalker',
    height: 172,
    mass: 77,
    hair_color: 'blond',
    skin_color: 'fair',
    eye_color: 'blue',
    birth_year: '19BBY',
    gender: 'male',
    homeworld: 'https://swapi.dev/api/planets/1/',
  }),
};

describe('getSwapiMerged Lambda', () => {
  beforeEach(() => {
    ddbMock.reset();
    jest.clearAllMocks();
  });

  it('should return 400 if no id is provided', async () => {
    const event: APIGatewayProxyEvent = {
      queryStringParameters: {}, 
    } as any;

    const result = await getSwapiMerged(event, new DynamoDBClient({}), {});
    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body).error).toBe('Missing id query parameter');
  });

  it('should return 200 if found in cache', async () => {
    const event: APIGatewayProxyEvent = {
      queryStringParameters: { id: '1' },
    } as any;

    ddbMock.on(GetItemCommand).resolves({
      Item: marshall(someCacheItem),
    });

    const result = await getSwapiMerged(event, new DynamoDBClient({}), {});
    expect(result.statusCode).toBe(200);
    const body = JSON.parse(result.body);
    expect(body.message).toBe('Returned from cache (but wrote to DB)');
    expect(body.item.name).toBe(someCacheItem.name);
  });

  it('should return 404 if not found in cache', async () => {
    const event: APIGatewayProxyEvent = {
      queryStringParameters: { id: '2' },
    } as any;


    ddbMock.on(GetItemCommand).resolves({});
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        name: 'Darth Vader',
        height: '202',
        mass: '136',
        hair_color: 'none',
        skin_color: 'white',
        eye_color: 'yellow',
        birth_year: '41.9BBY',
        gender: 'male',
        homeworld: 'https://swapi.dev/api/planets/9/',
      },
    });

    const result = await getSwapiMerged(event, new DynamoDBClient({}), {});
    expect(result.statusCode).toBe(200);
    const body = JSON.parse(result.body);
    expect(body.message).toBe('Fetched and stored');
    expect(body.item.name).toBe('Darth Vader');
  });

  it('should return 500 if there is an error', async () => {
    const event: APIGatewayProxyEvent = {
      queryStringParameters: { id: '1' },
    } as any;


    mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));

    const result = await getSwapiMerged(event, new DynamoDBClient({}), {});
    expect(result.statusCode).toBe(500);
    expect(JSON.parse(result.body).error).toBe('Network error');
  });
});