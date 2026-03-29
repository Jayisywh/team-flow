import z from "zod";
import { standardSecurityMiddleware } from "../middlewares/arcjet/standard";
import { writeSecurityMiddleware } from "../middlewares/arcjet/write";
import { requireAuth } from "../middlewares/auth";
import { base } from "../middlewares/base";
import { requireWorkspaceMiddleware } from "../middlewares/workspace";
import prisma from "@/lib/prisma";
import {
  GroupedReactionSchema,
  GroupedReactionSchemaType,
  messageSchema,
  toggleReactionSchema,
  updateMessageSchema,
} from "../schemas/message";
import { getAvatar } from "@/lib/get-avatar";
import { Message } from "@/lib/generated/prisma/client";
import { readSecurityMiddleware } from "../middlewares/arcjet/read";
import { MessageListItem } from "@/lib/types";

const groupReaction = (
  reactions: { emoji: string; userId: string }[],
  userId: string,
): GroupedReactionSchemaType[] => {
  const reactionMap = new Map<string, { count: number; reactByMe: boolean }>();
  for (const reaction of reactions) {
    const existing = reactionMap.get(reaction.emoji);
    if (existing) {
      existing.count++;
      if (reaction.userId === userId) {
        existing.reactByMe = true;
      }
    } else {
      reactionMap.set(reaction.emoji, {
        count: 1,
        reactByMe: reaction.userId === userId,
      });
    }
  }
  return Array.from(reactionMap.entries()).map(([emoji, data]) => ({
    emoji,
    count: data.count,
    reactedByMe: data.reactByMe,
  }));
};

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
    //If this is a thread reply, validate the parent message
    if (input.threadId) {
      const parentMessage = await prisma.message.findFirst({
        where: {
          id: input.threadId,
          Channel: {
            workspaceId: context.workspace.orgCode,
          },
        },
      });
      if (
        !parentMessage ||
        parentMessage.channelId !== input.channelId ||
        parentMessage.threadId !== null
      ) {
        throw errors.BAD_REQUEST();
      }
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
        threadId: input.threadId,
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
      limit: z.number().min(1).max(100).optional(),
      cursor: z.string().optional(),
    }),
  )
  .output(
    z.object({
      items: z.array(z.custom<MessageListItem>()),
      nextCursor: z.string().optional(),
    }),
  )
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
    const limit = input.limit ?? 30;
    const messages = await prisma.message.findMany({
      where: {
        channelId: input.channelId,
        threadId: null,
      },
      ...(input.cursor
        ? {
            cursor: { id: input.cursor },
            skip: 1,
          }
        : {}),
      take: limit,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      include: {
        _count: {
          select: {
            replies: true,
          },
        },
        MessageReaction: {
          select: {
            emoji: true,
            userId: true,
          },
        },
      },
    });
    const items: MessageListItem[] = messages.map((m) => ({
      id: m.id,
      content: m.content,
      imageUrl: m.imageUrl,
      createdAt: m.createdAt,
      updatedAt: m.updatedAt,
      authorId: m.authorId,
      authorAvatar: m.authorAvatar,
      authorEmail: m.authorEmail,
      authorName: m.authorName,
      channelId: m.channelId,
      threadId: m.threadId,
      replyCount: m._count.replies,
      reactions: groupReaction(
        m.MessageReaction.map((r) => ({
          emoji: r.emoji,
          userId: r.userId,
        })),
        context.user.id,
      ),
    }));
    const nextCursor =
      messages.length === limit ? messages[messages.length - 1].id : undefined;
    return {
      items: items,
      nextCursor,
    };
  });

export const updateMessage = base
  .use(requireAuth)
  .use(requireWorkspaceMiddleware)
  .use(standardSecurityMiddleware)
  .use(writeSecurityMiddleware)
  .route({
    method: "PUT",
    path: "/message/:messageId",
    summary: "update a message",
    tags: ["Messages"],
  })
  .input(updateMessageSchema)
  .output(
    z.object({
      message: z.custom<Message>(),
      canEdit: z.boolean(),
    }),
  )
  .handler(async ({ context, input, errors }) => {
    const message = await prisma.message.findFirst({
      where: {
        id: input.messageId,
        Channel: {
          workspaceId: context.workspace.orgCode,
        },
      },
      select: {
        id: true,
        authorId: true,
      },
    });
    if (!message) {
      throw errors.NOT_FOUND();
    }
    if (message.authorId !== context.user.id) {
      throw errors.FORBIDDEN();
    }
    const updated = await prisma.message.update({
      where: {
        id: input.messageId,
      },
      data: {
        content: input.content,
      },
    });
    return {
      message: updated,
      canEdit: updated.authorId === context.user.id,
    };
  });

export const listThreadReplies = base
  .use(requireAuth)
  .use(requireWorkspaceMiddleware)
  .use(standardSecurityMiddleware)
  .use(readSecurityMiddleware)
  .route({
    method: "GET",
    path: "/message/:messageId/thread",
    summary: "List replies in a thread",
    tags: ["Messages"],
  })
  .input(
    z.object({
      messageId: z.string(),
    }),
  )
  .output(
    z.object({
      parent: z.custom<MessageListItem>(),
      replyMessages: z.array(z.custom<MessageListItem>()),
    }),
  )
  .handler(async ({ input, context, errors }) => {
    const parentMessage = await prisma.message.findFirst({
      where: {
        id: input.messageId,
        Channel: {
          workspaceId: context.workspace.orgCode,
        },
      },
      include: {
        _count: {
          select: {
            replies: true,
          },
        },
        MessageReaction: {
          select: {
            emoji: true,
            userId: true,
          },
        },
      },
    });
    if (!parentMessage) {
      throw errors.NOT_FOUND();
    }
    const replies = await prisma.message.findMany({
      where: {
        threadId: input.messageId,
      },
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
      include: {
        _count: {
          select: {
            replies: true,
          },
        },
        MessageReaction: {
          select: {
            emoji: true,
            userId: true,
          },
        },
      },
    });
    const parent: MessageListItem = {
      id: parentMessage.id,
      authorAvatar: parentMessage.authorAvatar,
      authorEmail: parentMessage.authorEmail,
      authorId: parentMessage.authorId,
      authorName: parentMessage.authorName,
      imageUrl: parentMessage.imageUrl,
      channelId: parentMessage.channelId,
      createdAt: parentMessage.createdAt,
      updatedAt: parentMessage.updatedAt,
      threadId: parentMessage.threadId,
      replyCount: parentMessage._count.replies,
      content: parentMessage.content,
      reactions: groupReaction(
        parentMessage.MessageReaction.map((r) => ({
          emoji: r.emoji,
          userId: r.userId,
        })),
        context.user.id,
      ),
    };
    const replyMessages: MessageListItem[] = replies.map((reply) => ({
      id: reply.id,
      authorAvatar: reply.authorAvatar,
      authorEmail: reply.authorEmail,
      authorId: reply.authorId,
      authorName: reply.authorName,
      imageUrl: reply.imageUrl,
      channelId: reply.channelId,
      createdAt: reply.createdAt,
      updatedAt: reply.updatedAt,
      threadId: reply.threadId,
      content: reply.content,
      replyCount: reply._count.replies,
      reactions: groupReaction(
        reply.MessageReaction.map((r) => ({
          emoji: r.emoji,
          userId: r.userId,
        })),
        context.user.id,
      ),
    }));
    return {
      parent,
      replyMessages,
    };
  });

export const toggleReaction = base
  .use(requireAuth)
  .use(requireWorkspaceMiddleware)
  .use(standardSecurityMiddleware)
  .use(writeSecurityMiddleware)
  .route({
    method: "POST",
    path: "/messages/:messageId/reaction",
    summary: "toggle a reaction",
    tags: ["messages"],
  })
  .input(toggleReactionSchema)
  .output(
    z.object({
      messageId: z.string(),
      reactions: z.array(GroupedReactionSchema),
    }),
  )
  .handler(async ({ context, errors, input }) => {
    const message = await prisma.message.findFirst({
      where: {
        id: input.messageId,
        Channel: {
          workspaceId: context.workspace.orgCode,
        },
      },
      select: {
        id: true,
      },
    });
    if (!message) {
      throw errors.NOT_FOUND();
    }
    const inserted = await prisma.messageReaction.createMany({
      data: [
        {
          messageId: input.messageId,
          emoji: input.emoji,
          userAvatar: getAvatar(context.user.picture, context.user.email!),
          userEmail: context.user.email!,
          userId: context.user.id,
          userName: context.user.given_name ?? "John Doe",
        },
      ],
      skipDuplicates: true,
    });
    if (inserted.count === 0) {
      await prisma.messageReaction.deleteMany({
        where: {
          messageId: input.messageId,
          emoji: input.emoji,
          userId: context.user.id,
        },
      });
    }
    const updated = await prisma.message.findUnique({
      where: {
        id: input.messageId,
      },
      include: {
        MessageReaction: {
          select: {
            emoji: true,
            userId: true,
          },
        },
        _count: {
          select: {
            replies: true,
          },
        },
      },
    });
    if (!updated) {
      throw errors.NOT_FOUND();
    }
    return {
      messageId: updated.id,
      reactions: groupReaction(
        (updated.MessageReaction ?? []).map((r) => ({
          emoji: r.emoji,
          userId: r.userId,
        })),
        context.user.id,
      ),
    };
  });
