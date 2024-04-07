#!/usr/bin/env node
import 'source-map-support/register';
import { ExtendedApp } from "truemark-cdk-lib/aws-cdk";
import {CloudWatchLogsEmitterStack} from '../lib/cloud-watch-logs-emitter-stack';

const app = new ExtendedApp({
  standardTags: {
    automationTags: {
      id: 'cloud-watch-logs-emitter',
      url: 'https://github.com/truemark/cdk-samples/cloud-watch-logs-emitter',
    }
  }
});

new CloudWatchLogsEmitterStack(app, 'CloudWatchLogsEmitter', {});
