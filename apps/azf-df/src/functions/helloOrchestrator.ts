import * as df from "durable-functions";
import { ActivityHandler, OrchestrationContext, OrchestrationHandler } from "durable-functions";
import { app, HttpHandler, HttpRequest, HttpResponse, InvocationContext } from "@azure/functions";

const activityName = "helloActivity";

const helloOrchestrator: OrchestrationHandler = function* (context: OrchestrationContext) {
  const cities = ["Tokyo", "Seattle", "London"];
  const results: string[] = [];

  for (const city of cities) {
    results.push(yield context.df.callActivity(activityName, city));
  }

  return results;
};

df.app.orchestration("helloOrchestrator", helloOrchestrator);

const helloActivity: ActivityHandler = (input: string): string => {
  return `Hello, ${input}!`;
};

df.app.activity(activityName, { handler: helloActivity });

const httpStart: HttpHandler = async (request: HttpRequest, context: InvocationContext): Promise<HttpResponse> => {
  const client = df.getClient(context);
  const instanceId = await client.startNew("helloOrchestrator");

  context.log(`Orchestration started with ID: ${instanceId}`);

  return client.createCheckStatusResponse(request, instanceId);
};

app.http("helloHttpStart", {
  route: "orchestrators/helloOrchestrator",
  extraInputs: [df.input.durableClient()],
  handler: httpStart,
});
