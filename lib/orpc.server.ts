import "server-only";

import { headers } from "next/headers";
import { createRouterClient, type RouterClient } from "@orpc/server";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";
import { router } from "@/app/router";

declare global {
  // This is safe because we only ever run this on the server.
  // We use a global to avoid recreating a new client per request.
  var $client: RouterClient<typeof router> | undefined;
}

export const serverClient: RouterClient<typeof router> =
  globalThis.$client ??
  createRouterClient(router, {
    context: async () => {
      const h = await headers();

      return {
        // Construct a dummy request object using the current headers
        // This satisfies the "Property 'request' is missing" error
        request: new Request("http://localhost", { headers: h }),
        headers: h,
      };
    },
  });

globalThis.$client = serverClient;

export const query = createTanstackQueryUtils(serverClient);
