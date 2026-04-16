import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
} from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { useState } from "react";
import { DuckDBProvider } from "~/lib/duckdb";
import Toaster from "~/domains/notifications/ui/toaster";

// Cached per page load — root loader runs on every navigation so we memoize
let visitorIdPromise: Promise<string | null> | null = null;

async function getVisitorId(): Promise<string | null> {
  if (typeof window === "undefined") return null;
  if (!visitorIdPromise) {
    visitorIdPromise = import("@fingerprintjs/fingerprintjs").then(
      async (FingerprintJS) => {
        const fp = await FingerprintJS.load();
        const result = await fp.get();
        return result.visitorId;
      }
    );
  }
  return visitorIdPromise;
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "BankQL" },
    ],
  }),
  loader: () => getVisitorId(),
  component: RootComponent,
});

function RootComponent() {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var d=document.documentElement;if(window.matchMedia("(prefers-color-scheme:dark)").matches){d.classList.add("dark")}}catch(e){}})()`,
          }}
        />
      </head>
      <body>
        <ChakraProvider value={defaultSystem}>
          <QueryClientProvider client={queryClient}>
            <DuckDBProvider>
              <Outlet />
            </DuckDBProvider>
          </QueryClientProvider>
          <Toaster />
        </ChakraProvider>
        <Scripts />
      </body>
    </html>
  );
}
