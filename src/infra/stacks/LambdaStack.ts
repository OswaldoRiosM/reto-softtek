import { Duration, Stack, StackProps } from "aws-cdk-lib";
import { LambdaIntegration } from "aws-cdk-lib/aws-apigateway";
import { ITable, Table } from "aws-cdk-lib/aws-dynamodb";
import { Effect, PolicyStatement } from "aws-cdk-lib/aws-iam";
import { Runtime, Tracing } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import { join } from "path";

interface LambdaStackProps extends StackProps {
  swapiTable: Table;
  swapiCacheTable: Table;
  challengeUsersTable: ITable;
}

export class LambdaStack extends Stack {
  public readonly swapiLambdaIntegration: LambdaIntegration;
  public readonly swapiRecordLambdaIntegration: LambdaIntegration;
  public readonly challengeUsersLambdaIntegration: LambdaIntegration;
    public readonly swaggerLambdaIntegration: LambdaIntegration;

  constructor(scope: Construct, id: string, props: LambdaStackProps) {
    super(scope, id, props);

    const swapiLambda = new NodejsFunction(this, "swapi_merged", {
      runtime: Runtime.NODEJS_18_X,
      handler: "handler",
      entry: join(
        __dirname,
        "..",
        "..",
        "services",
        "swapi_merged",
        "handler.ts"
      ),
      memorySize: 512,
      environment: {
        TABLE_NAME: props.swapiTable.tableName,
        TABLE_CACHE_NAME: props.swapiCacheTable.tableName,
        SWAPI_PEOPLE_URL: "https://swapi.dev/api/people/",
        API_NINJAS_URL: "https://api.api-ninjas.com/v1/bucketlist",
        API_NINJAS_KEY: "hBnena70Lj6yfGcsccO6Ow==j26CnIprbqSUpf7z",
        SWAPI_TIMEOUT: "5000",
        SWAPI_MAX_RETRIES: "3",
        SWAPI_RETRY_DELAY: "1000",
        SWAPI_RETRY_JITTER: "1000",
        SWAPI_RETRY_BACKOFF: "2",
        SWAPI_RETRY_STATUS_CODES: "500,502,503,504",
      },
      tracing: Tracing.ACTIVE,
      timeout: Duration.seconds(30),

    });

    const swapiRecordLambda = new NodejsFunction(this, "swapi_record", {
      runtime: Runtime.NODEJS_18_X,
      handler: "handler",
      entry: join(
        __dirname,
        "..",
        "..",
        "services",
        "swapi_record",
        "handler.ts"
      ),
      memorySize: 512,
      environment: {
        TABLE_NAME: props.swapiTable.tableName,
      },
      tracing: Tracing.ACTIVE,      
      timeout: Duration.seconds(30),

    });

    const challengeUsersLambda = new NodejsFunction(this, "challenge_users", {
      runtime: Runtime.NODEJS_18_X,
      handler: "handler",
      entry: join(
        __dirname,
        "..",
        "..",
        "services",
        "challenge_users",
        "handler.ts"
      ),
      memorySize: 512,
      environment: {
        TABLE_NAME: props.challengeUsersTable.tableName,
      },
      tracing: Tracing.ACTIVE,
      timeout: Duration.seconds(30),
    });

    const swaggerLambda = new NodejsFunction(this, "swagger_lambda", {
        runtime: Runtime.NODEJS_18_X,
        handler: "handler",
        entry: join(__dirname, "..", "..", "services", "swagger", "handler.ts"),
        memorySize: 256,
        timeout: Duration.seconds(10),
      });

    swapiRecordLambda.addToRolePolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ["dynamodb:Scan"],
        resources: [props.swapiTable.tableArn],
      })
    );

    challengeUsersLambda.addToRolePolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ["dynamodb:PutItem"],
        resources: [props.challengeUsersTable.tableArn],
      })
    );

    swapiLambda.addToRolePolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ["dynamodb:GetItem", "dynamodb:PutItem"],
        resources: [props.swapiTable.tableArn, props.swapiCacheTable.tableArn],
      })
    );

    this.swapiLambdaIntegration = new LambdaIntegration(swapiLambda);
    this.swaggerLambdaIntegration = new LambdaIntegration(swaggerLambda);
    this.swapiRecordLambdaIntegration = new LambdaIntegration(swapiRecordLambda);
    this.challengeUsersLambdaIntegration = new LambdaIntegration(challengeUsersLambda);
  }
}
