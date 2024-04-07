# CloudWatch Logs Emitter

Creates a lambda function that can be triggered with a curl call to the emitted API Gateway endpoint
which triggers the lambda to emit a log entry every second for 15 seconds.

This sample project came from the need to test log ingestion and processing from CloudWatch to OpenSearch
using the [AutoLog](https://github.com/truemark/autolog) and [Overwatch](https://github.com/truemark/overwatch)
projects.
