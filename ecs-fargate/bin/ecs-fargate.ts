#!/usr/bin/env node
import 'source-map-support/register';
import {ExtendedApp} from 'truemark-cdk-lib/aws-cdk';
import {EcsFargateStack} from '../lib/ecs-fargate-stack';

const app = new ExtendedApp({
  standardTags: {
    automationTags: {
      id: 'ecs-fargate-sample',
      url: 'https://github.com/truemark/cdk-samples/ecs-fargate',
    }
  }
});
new EcsFargateStack(app, 'EcsFargateSample', {
  // vpcId: 'POPULATE ME',
  // subnetIds: ['POPULATE ME', 'POPULATE ME']
  vpcId: 'vpc-0408c19f2043f5764',
  publicSubnetIds: ['subnet-06a7eb40d7ef4b3c5', 'subnet-0b83e28f709965f6c', 'subnet-02f92534ddadc5c54'],
  privateSubnetIds: ['subnet-00e2e37fa77aa8771', 'subnet-0882ad3fa86c14910', 'subnet-0a6a12c1cce4e6e0b'],
  env: {region: app.region, account: app.account},
});
