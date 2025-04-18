import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { postChallengeUsers } from '../../services/challenge_users/PostChallengeUsers';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { mockClient } from 'aws-sdk-client-mock';
import { marshall } from '@aws-sdk/util-dynamodb';
import { createRandomId, parseJSON } from '../../../src/services/shared/Utils';
import { validateAschallengeUsersEntry } from '../../services/shared/Validator';

const ddbMock = mockClient(DynamoDBClient);

describe('postChallengeUsers Lambda', () => {
  beforeEach(() => {
    ddbMock.reset();
  });

  it('should return 201 with the random ID when the user is created successfully', async () => {
    const randomId = 'random-id-123';
    const sampleItem = { name: 'Luke Skywalker', age: 25 };

    ddbMock.on(PutItemCommand).resolves({
      Attributes: marshall(sampleItem),
    });

    const event: APIGatewayProxyEvent = {
      body: JSON.stringify(sampleItem),
    } as any;

    const result = await postChallengeUsers(event, new DynamoDBClient({}), {});

    expect(result.statusCode).toBe(201);
    const body = JSON.parse(result.body);
    expect(body.id).toBe(randomId);
  });

  it('should return 500 if there is an error during the validation', async () => {
    const invalidItem = { name: '', age: -5 };

    const event: APIGatewayProxyEvent = {
      body: JSON.stringify(invalidItem),
    } as any;

    const result = await postChallengeUsers(event, new DynamoDBClient({}), {});

    expect(result.statusCode).toBe(500);
    const body = JSON.parse(result.body);
    expect(body.error).toBe('Validation error');
  });

  it('should return 500 if there is an error with DynamoDB', async () => {
    const sampleItem = { name: 'Leia Organa', age: 23 };

    ddbMock.on(PutItemCommand).rejects(new Error('DynamoDB error'));

    const event: APIGatewayProxyEvent = {
      body: JSON.stringify(sampleItem),
    } as any;

    const result = await postChallengeUsers(event, new DynamoDBClient({}), {});

    expect(result.statusCode).toBe(500);
    const body = JSON.parse(result.body);
    expect(body.error).toBe('DynamoDB error');
  });

  it('should return 400 if no body is provided', async () => {
    const event: APIGatewayProxyEvent = {
      body: '',
    } as any;

    const result = await postChallengeUsers(event, new DynamoDBClient({}), {});

    expect(result.statusCode).toBe(400);
    const body = JSON.parse(result.body);
    expect(body.error).toBe('Invalid input, missing body or fields');
  });

  it('should call createRandomId and marshall correctly', async () => {
    const sampleItem = { name: 'Han Solo', age: 35 };
    const randomId = 'mock-random-id';


    const event: APIGatewayProxyEvent = {
      body: JSON.stringify(sampleItem),
    } as any;

    const result = await postChallengeUsers(event, new DynamoDBClient({}), {});

    expect(createRandomId).toHaveBeenCalled();
  });
});
