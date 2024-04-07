import * as logging from '@nr1e/logging';
import { APIGatewayProxyEventV2 } from 'aws-lambda';

export async function handler(event: APIGatewayProxyEventV2) {
  const log = await logging.initialize({svc: 'CloudWatchLogsEmitter', level: 'trace'})
  log.trace().obj('event', event).msg('Received event');
  let count = 0;
  while (count++ < 15) {
    log.info().num('count', count).msg('Message count');
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  return {
    statusCode: 200,
    body: JSON.stringify('Logs emitted successfully!'),
  }
}
