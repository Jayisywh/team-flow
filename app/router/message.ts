import z from "zod";
import { standardSecurityMiddleware } from "../middlewares/arcjet/standard";
import { writeSecurityMiddleware } from "../middlewares/arcjet/write";
import { requireAuth } from "../middlewares/auth";
import { base } from "../middlewares/base";
import { requireWorkspaceMiddleware } from "../middlewares/workspace";
import prisma from "@/lib/prisma";
import { messageSchema } from "../schemas/message";
import { getAvatar } from "@/lib/get-avatar";
import { Message } from "@/lib/generated/prisma/client";
import { readSecurityMiddleware } from "../middlewares/arcjet/read";

export const createMessage = base
  .use(requireAuth)
  .use(requireWorkspaceMiddleware)
  .use(standardSecurityMiddleware)
  .use(writeSecurityMiddleware)
  .route({
    method: "POST",
    path: "/message",
    summary: "create a new message",
    tags: ["message"],
  })
  .input(messageSchema)
  .output(z.custom<Message>())
  .handler(async ({ context, input, errors }) => {
    const channel = await prisma.channel.findFirst({
      where: {
        id: input.channelId,
        workspaceId: context.workspace.orgCode,
      },
    });
    if (!channel) {
      throw errors.FORBIDDEN();
    }
    const newMessage = await prisma.message.create({
      data: {
        channelId: input.channelId,
        content: input.content,
        imageUrl: input.imageUrl,
        authorId: context.user.id,
        authorEmail: context.user.email!,
        authorName: context.user.given_name ?? "",
        authorAvatar: getAvatar(context.user.picture, context.user.email!),
      },
    });
    return {
      ...newMessage,
    };
  });

export const listMessages = base
  .use(requireAuth)
  .use(requireWorkspaceMiddleware)
  .use(standardSecurityMiddleware)
  .use(readSecurityMiddleware)
  .route({
    method: "GET",
    path: "/message",
    summary: "list all messages",
    tags: ["message"],
  })
  .input(
    z.object({
      channelId: z.string(),
    }),
  )
  .output(z.array(z.custom<Message>()))
  .handler(async ({ context, errors, input }) => {
    const channel = await prisma.channel.findFirst({
      where: {
        id: input.channelId,
        workspaceId: context.workspace.orgCode,
      },
    });
    if (!channel) {
      throw errors.FORBIDDEN();
    }
    const data = await prisma.message.findMany({
      where: {
        channelId: input.channelId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return data;
  });
