import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";

export async function hello(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log(`Http function processed request for url "${request.url}"`);
  return { body: "Hello from BankQL!" };
}

app.http("hello", {
  methods: ["GET"],
  authLevel: "anonymous",
  handler: hello,
});
