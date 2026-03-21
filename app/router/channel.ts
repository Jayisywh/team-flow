import z from "zod";
import { heavyWriteSecurityMiddleware } from "../middlewares/arcjet/heavy-write";
import { standardSecurityMiddleware } from "../middlewares/arcjet/standard";
import { requireAuth } from "../middlewares/auth";
import { base } from "../middlewares/base";
import { requireWorkspaceMiddleware } from "../middlewares/workspace";
import { channelSchema } from "../schemas/channel";
import prisma from "@/lib/prisma";
import { Channel } from "@/lib/generated/prisma/client";
import {
  init,
  organization_user,
  Organizations,
} from "@kinde/management-api-js";
import { KindeOrganization } from "@kinde-oss/kinde-auth-nextjs";
export const runtime = "nodejs";

export const createChannel = base
  .use(requireAuth)
  .use(requireWorkspaceMiddleware)
  .use(standardSecurityMiddleware)
  .use(heavyWriteSecurityMiddleware)
  .route({
    method: "POST",
    path: "/channel",
    summary: "create a new channel",
    tags: ["channel"],
  })
  .input(channelSchema)
  .output(z.custom<Channel>())
  .handler(async ({ input, context }) => {
    const channel = await prisma.channel.create({
      data: {
        name: input.name,
        workspaceId: context.workspace.orgCode,
        createdById: context.user.id,
      },
    });
    return channel;
  });

export const listChannels = base
  .use(requireAuth)
  .use(requireWorkspaceMiddleware)
  .input(z.void())
  .output(
    z.object({
      channels: z.array(z.custom<Channel>()),
      members: z.array(z.custom<organization_user>()),
      currentWorkspace: z.custom<KindeOrganization<unknown>>(),
    }),
  )
  .handler(async ({ context }) => {
    init();
    const channelsPromise = prisma.channel.findMany({
      where: {
        workspaceId: context.workspace.orgCode,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const membersPromise = Organizations.getOrganizationUsers({
      orgCode: context.workspace.orgCode,
      sort: "name_asc",
    }).catch(() => null);

    const [channels, membersRes] = await Promise.all([
      channelsPromise,
      membersPromise,
    ]);
    const fetchedMembers = membersRes?.organization_users ?? [];
    const hasCurrentUser = fetchedMembers.some(
      (member) => member.id === context.user.id,
    );

    const fallbackCurrentUser = {
      id: context.user.id,
      email: context.user.email ?? "",
      full_name:
        [context.user.given_name, context.user.family_name]
          .filter(Boolean)
          .join(" ")
          .trim() || context.user.email || "You",
      picture: context.user.picture ?? null,
    } as organization_user;

    const members = hasCurrentUser
      ? fetchedMembers
      : [fallbackCurrentUser, ...fetchedMembers];
    return {
      channels,
      members,
      currentWorkspace: context.workspace,
    };
  });
