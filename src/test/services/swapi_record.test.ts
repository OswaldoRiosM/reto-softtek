import { DynamoDBClient, ScanCommand } from '@aws-sdk/client-dynamodb';
import { getSwapiRecord } from '../../services/swapi_record/GetSwapiRecord'; // ajusta según tu ruta
import { APIGatewayProxyEvent } from 'aws-lambda';
import { mockClient } from 'aws-sdk-client-mock';
import { marshall } from '@aws-sdk/util-dynamodb';

const ddbMock = mockClient(DynamoDBClient);

const sampleItems = [
  { id: '1', name: 'Luke Skywalker', height: 172 },
  { id: '2', name: 'Darth Vader', height: 202 },
  { id: '3', name: 'Leia Organa', height: 150 },
  { id: '4', name: 'Han Solo', height: 180 },
];

describe('getSwapiRecord Lambda', () => {
  beforeEach(() => {
    ddbMock.reset();
  });

  it('should return 200 with paginated results', async () => {

    ddbMock.on(ScanCommand).resolves({
      Items: sampleItems.map(item => marshall(item)),
      ScannedCount: sampleItems.length,
      LastEvaluatedKey: undefined, 
    });

    const event: APIGatewayProxyEvent = {
      queryStringParameters: { limit: '2', page: '1' },
    } as any;

    const result = await getSwapiRecord(event, new DynamoDBClient({}), {});

    expect(result.statusCode).toBe(200);
    const body = JSON.parse(result.body);
    expect(body.items.length).toBe(2); 
    expect(body.currentPage).toBe(1);
    expect(body.totalPages).toBe(2);
    expect(body.hasMore).toBe(true);
  });

  it('should return 200 with items from the second page', async () => {
    // Mock para la segunda página
    ddbMock.on(ScanCommand).resolves({
      Items: sampleItems.map(item => marshall(item)),
      ScannedCount: sampleItems.length,
      LastEvaluatedKey: undefined, 
    });

    const event: APIGatewayProxyEvent = {
      queryStringParameters: { limit: '2', page: '2' },
    } as any;

    const result = await getSwapiRecord(event, new DynamoDBClient({}), {});

    expect(result.statusCode).toBe(200);
    const body = JSON.parse(result.body);
    expect(body.items.length).toBe(2); 
    expect(body.currentPage).toBe(2);
    expect(body.totalPages).toBe(2);
    expect(body.hasMore).toBe(false);
  });

  it('should return 500 if there is a DynamoDB error', async () => {
    // Simulamos un error en DynamoDB
    ddbMock.on(ScanCommand).rejects(new Error('DynamoDB Error'));

    const event: APIGatewayProxyEvent = {
      queryStringParameters: { limit: '2', page: '1' },
    } as any;

    const result = await getSwapiRecord(event, new DynamoDBClient({}), {});

    expect(result.statusCode).toBe(500);
    const body = JSON.parse(result.body);
    expect(body.error).toBe('DynamoDB Error');
  });

  it('should return 400 if no limit or page query parameters are provided', async () => {
    // Evento sin parámetros de paginación
    const event: APIGatewayProxyEvent = {
      queryStringParameters: {},
    } as any;

    const result = await getSwapiRecord(event, new DynamoDBClient({}), {});

    expect(result.statusCode).toBe(400);
    const body = JSON.parse(result.body);
    expect(body.error).toBe('Missing query parameters: limit, page');
  });

  it('should return 200 with correct paginated data even with last evaluated key', async () => {

    ddbMock.on(ScanCommand).resolves({
      Items: sampleItems.map(item => marshall(item)),
      ScannedCount: sampleItems.length,
      LastEvaluatedKey: { id: { S: '5' } }, 
    });

    const event: APIGatewayProxyEvent = {
      queryStringParameters: { limit: '2', page: '1' },
    } as any;

    const result = await getSwapiRecord(event, new DynamoDBClient({}), {});

    expect(result.statusCode).toBe(200);
    const body = JSON.parse(result.body);
    expect(body.items.length).toBe(2); 
    expect(body.hasMore).toBe(true);
  });
});
