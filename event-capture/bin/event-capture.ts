#!/usr/bin/env node
import 'source-map-support/register';
import {ExtendedApp} from 'truemark-cdk-lib/aws-cdk';
import {EventCaptureStack} from '../lib/event-capture-stack';

const app = new ExtendedApp({
  standardTags: {
    automationTags: {
      id: 'event-capture-sample',
      url: 'https://github.com/truemark/cdk-samples/ecs-fargate',
    }
  }
});
new EventCaptureStack(app, 'EventCaptureSample', {
});
