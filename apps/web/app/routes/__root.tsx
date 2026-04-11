import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
} from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { DuckDBProvider } from "~/lib/duckdb";

const queryClient = new QueryClient();

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "BankQL" },
    ],
  }),
  component: RootComponent,
});

function RootComponent() {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <ChakraProvider value={defaultSystem}>
          <QueryClientProvider client={queryClient}>
            <DuckDBProvider>
              <Outlet />
            </DuckDBProvider>
          </QueryClientProvider>
        </ChakraProvider>
        <Scripts />
      </body>
    </html>
  );
}
