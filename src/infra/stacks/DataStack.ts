import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { getSuffixfromStack } from "./Utils";
import { AttributeType, ITable, ProjectionType, Table } from "aws-cdk-lib/aws-dynamodb";

export class DataStack extends Stack {
  public readonly swapiTable: Table
  public readonly swapiCacheTable: Table
  public readonly challengeUsersTable: ITable

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
    const suffix = getSuffixfromStack(this);

    this.swapiTable = new Table(this, "swapiTable", {
      partitionKey: {
        name: "id",
        type: AttributeType.STRING,
      },
      tableName: `swapitable_${suffix}`,
    });

    this.swapiTable.addGlobalSecondaryIndex({
        indexName: "CreatedAtIndex",
        partitionKey: {
          name: "id", 
          type: AttributeType.STRING,
        },
        sortKey: {
          name: "createdAt",
          type: AttributeType.STRING,
        },
        projectionType: ProjectionType.ALL,
      });

      this.swapiCacheTable = new Table(this, "swapiCacheTable", {
        partitionKey: {
          name: "id", 
          type: AttributeType.STRING,
        },
        timeToLiveAttribute: "ttl",
        tableName: `swapiCacheTable_${suffix}`,
      });


    this.challengeUsersTable = new Table(this, "challengeUsersTable", {
      partitionKey: {
        name: "id",
        type: AttributeType.STRING,
      },
      tableName: `challengeUserstable_${suffix}`,
    });

  }
}
