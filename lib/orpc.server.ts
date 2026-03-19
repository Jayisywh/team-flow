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

const serverClient: RouterClient<typeof router> =
  globalThis.$client ??
  createRouterClient(router, {
    /**
     * Provide initial context if needed.
     *
     * Because this client instance is shared across all requests,
     * only include context that's safe to reuse globally.
     * For per-request context, use middleware context or pass a function as the initial context.
     */
    context: async () => ({
      headers: await headers(), // provide headers if initial context required
    }),
  });

globalThis.$client = serverClient;

export const query = createTanstackQueryUtils(serverClient);
