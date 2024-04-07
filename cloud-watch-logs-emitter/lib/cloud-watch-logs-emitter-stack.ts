import {ExtendedStack, ExtendedStackProps} from 'truemark-cdk-lib/aws-cdk';
import {Construct} from 'constructs';
import {ExtendedNodejsFunction} from 'truemark-cdk-lib/aws-lambda';
import * as path from 'node:path';
import {Architecture} from 'aws-cdk-lib/aws-lambda';
import {CfnOutput, Duration} from 'aws-cdk-lib';
import {HttpApi} from 'aws-cdk-lib/aws-apigatewayv2';
import {HttpLambdaIntegration} from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import {RetentionDays} from 'aws-cdk-lib/aws-logs';

export class CloudWatchLogsEmitterStack extends ExtendedStack {
  constructor(scope: Construct, id: string, props: ExtendedStackProps) {
    super(scope, id, props);

    const mainFunction = new ExtendedNodejsFunction(this, 'MainFunction', {
      entry: path.join(
        __dirname,
        '..',
        'handlers',
        'main-handler.ts'
      ),
      architecture: Architecture.ARM_64,
      handler: 'handler',
      timeout: Duration.seconds(330),
      deploymentOptions: {
        createDeployment: false,
      },
      memorySize: 128,
      logRetention: RetentionDays.ONE_DAY,
    });

    const httpApi = new HttpApi(this, 'HttpApi', {
      defaultIntegration: new HttpLambdaIntegration('MainFunctionIntegration', mainFunction),
    });
    new CfnOutput(this, 'ApiEndpoint', {
      value: httpApi.url ?? 'No URL',
    });
  }
}
