import { createORPCClient } from "@orpc/client";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";
import { RPCLink } from "@orpc/client/fetch";
import type { RouterClient } from "@orpc/server";
import { router } from "@/app/router";

const link = new RPCLink({
  url: () => {
    if (typeof window === "undefined")
      throw new Error("RPCLink not allowed on server");
    return `${window.location.origin}/rpc`;
  },
});

export const client: RouterClient<typeof router> =
  createORPCClient<RouterClient<typeof router>>(link);

export const query = createTanstackQueryUtils(client);
