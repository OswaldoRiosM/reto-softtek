import { Stack,StackProps } from "aws-cdk-lib";
import { LambdaIntegration, RestApi } from "aws-cdk-lib/aws-apigateway";
import { Construct } from "constructs";

interface ApiStackProps extends StackProps {
    swapiLambdaIntegration: LambdaIntegration;
    swapiRecordLambdaIntegration: LambdaIntegration;
    challengeUsersLambdaIntegration: LambdaIntegration;
    swaggerLambdaIntegration: LambdaIntegration;
}

export class ApiStack extends Stack {  
    constructor(scope: Construct, id: string, props: ApiStackProps) {
        super(scope, id, props);

        const api = new RestApi(this, "swapi", {
            deployOptions: {
              throttlingRateLimit: 10,
              throttlingBurstLimit: 20,  
            },
          });


        const swapiResource = api.root.addResource("swapi");
        swapiResource.addMethod("GET", props.swapiLambdaIntegration);

        const swapiRecordResource = api.root.addResource("swapi_record");
        swapiRecordResource.addMethod("GET", props.swapiRecordLambdaIntegration);

        const challengeUsersResource = api.root.addResource("challenge_users");
        challengeUsersResource.addMethod("POST", props.challengeUsersLambdaIntegration);

        const swaggerResource = api.root.addResource('docs');
        swaggerResource.addMethod('GET', props.swaggerLambdaIntegration);
    }
    
}
