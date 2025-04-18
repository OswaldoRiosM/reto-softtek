import { App } from "aws-cdk-lib";
import { ApiStack } from "./stacks/ApiStack";
import { DataStack } from "./stacks/DataStack";
import { LambdaStack } from "./stacks/LambdaStack";

const app = new App();
const dataStack = new DataStack(app, "DataStack", {});
const lambdaStack = new LambdaStack(app, "LambdaStack",
    {
        swapiTable: dataStack.swapiTable,
        swapiCacheTable: dataStack.swapiCacheTable,
        challengeUsersTable: dataStack.challengeUsersTable,
    }
);

new ApiStack(app, "ApiStack", {
    swapiLambdaIntegration: lambdaStack.swapiLambdaIntegration,
    swapiRecordLambdaIntegration: lambdaStack.swapiRecordLambdaIntegration,
    swaggerLambdaIntegration: lambdaStack.swaggerLambdaIntegration,
    challengeUsersLambdaIntegration: lambdaStack.challengeUsersLambdaIntegration,
});

