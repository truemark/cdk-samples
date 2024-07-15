import {ExtendedStack, ExtendedStackProps} from 'truemark-cdk-lib/aws-cdk';
import {Construct} from 'constructs';
import {Queue} from "aws-cdk-lib/aws-sqs";
import {CfnRule, Rule} from "aws-cdk-lib/aws-events";
import {CloudWatchLogGroup, SqsQueue} from "aws-cdk-lib/aws-events-targets";
import {Aws} from "aws-cdk-lib";
import { LogGroup } from "aws-cdk-lib/aws-logs";
import { Role, ServicePrincipal, PolicyStatement } from "aws-cdk-lib/aws-iam";



export interface EventCaptureStackProps extends ExtendedStackProps {

}

export class EventCaptureStack extends ExtendedStack {
  constructor(scope: Construct, id: string, props: EventCaptureStackProps) {
    super(scope, id, props);

    const logGroup = new LogGroup(this, 'EventsLogGroup', {
    });

    const eventBridgeRole = new Role(this, 'EventBridgeRole', {
      assumedBy: new ServicePrincipal('events.amazonaws.com'),
    });

    eventBridgeRole.addToPolicy(new PolicyStatement({
      resources: [logGroup.logGroupArn],
      actions: ['logs:CreateLogStream', 'logs:PutLogEvents'],
    }));


     const allEventsRule = new Rule(this, 'AllEventsRule', {
      eventPattern: {
        source: []
      }
    });
     // (allEventsRule.node.defaultChild as CfnRule).addPropertyOverride(
     //   "EventPattern.resources",
     //   ["source" = [
     //    {"anything-but": "aws.config"}]
     // );
     (allEventsRule.node.defaultChild as CfnRule).addPropertyOverride(
      "EventPattern.source",
      [{"anything-but": ["aws.config", "aws.sts", "aws.logs", "aws.securityhub"]}]
    );

    allEventsRule.addTarget(new CloudWatchLogGroup(logGroup));

  }
}
