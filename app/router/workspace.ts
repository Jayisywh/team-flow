import { KindeOrganization, KindeUser } from "@kinde-oss/kinde-auth-nextjs";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
// import { os } from "@orpc/server";
import { z } from "zod";
import { base } from "../middlewares/base";
import { requireAuth } from "../middlewares/auth";
import { requireWorkspaceMiddleware } from "../middlewares/workspace";
import { workSpaceSchema } from "../schemas/workspace";
import { init, Organizations } from "@kinde/management-api-js";
export const listWorkspaces = base
  .use(requireAuth)
  .use(requireWorkspaceMiddleware)
  .route({
    method: "GET",
    path: "/workspace",
    summary: "list all workspaces",
    tags: ["workspace"],
  })
  .input(z.void())
  .output(
    z.object({
      workspaces: z.array(
        z.object({
          id: z.string(),
          name: z.string(),
          avatar: z.string(),
        }),
      ),
      user: z.custom<KindeUser<Record<string, unknown>>>(),
      currentWorkspace: z.custom<KindeOrganization<unknown>>(),
    }),
  )
  .handler(async ({ context, errors }) => {
    const { getUserOrganizations } = getKindeServerSession();
    const organization = await getUserOrganizations();
    if (!organization) {
      throw errors.FORBIDDEN();
    }
    return {
      workspaces: organization?.orgs.map((org) => ({
        id: org.code,
        name: org.name ?? "My Organization",
        avatar: org.name?.charAt(0) ?? "M",
      })),
      user: context.user,
      currentWorkspace: context.workspace,
    };
  });

export const createWorkspace = base
  .use(requireAuth)
  .use(requireWorkspaceMiddleware)
  .route({
    method: "POST",
    path: "/workspace",
    summary: "create a new workspace",
    tags: ["workspace"],
  })
  .input(workSpaceSchema)
  .output(
    z.object({
      orgCode: z.string(),
      workspaceName: z.string(),
    }),
  )
  .handler(async ({ context, errors, input }) => {
    init();
    let data;
    try {
      data = await Organizations.createOrganization({
        requestBody: {
          name: input.name,
        },
      });
    } catch {
      throw errors.FORBIDDEN();
    }
    if (!data.organization?.code) {
      throw errors.FORBIDDEN({
        message: "Org code is not defined",
      });
    }
    try {
      await Organizations.addOrganizationUsers({
        orgCode: data.organization.code,
        requestBody: {
          users: [
            {
              id: context.user.id,
              roles: ["admin"],
            },
          ],
        },
      });
    } catch {
      throw errors.FORBIDDEN();
    }
    const { refreshTokens } = getKindeServerSession();
    await refreshTokens();
    return {
      orgCode: data.organization.code,
      workspaceName: input.name,
    };
  });
