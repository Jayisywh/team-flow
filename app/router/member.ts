/* eslint-disable @typescript-eslint/no-explicit-any */
import z from "zod";
import { standardSecurityMiddleware } from "../middlewares/arcjet/standard";
import { writeSecurityMiddleware } from "../middlewares/arcjet/write";
import { requireAuth } from "../middlewares/auth";
import { base } from "../middlewares/base";
import { requireWorkspaceMiddleware } from "../middlewares/workspace";
import { inviteMemberSchema } from "../schemas/member";
import {
  init,
  organization_user,
  Organizations,
  Users,
} from "@kinde/management-api-js";
import { getAvatar } from "@/lib/get-avatar";
import { readSecurityMiddleware } from "../middlewares/arcjet/read";

export const runtime = "nodejs";

/**
 * ✅ Initialize Kinde ONCE (not every request)
 */
let isKindeInitialized = false;

const ensureKindeInit = () => {
  if (isKindeInitialized) return;

  const kindeDomain = process.env.KINDE_DOMAIN;
  const clientId = process.env.KINDE_MANAGEMENT_CLIENT_ID;
  const clientSecret = process.env.KINDE_MANAGEMENT_CLIENT_SECRET;

  // ❌ DO NOT allow silent fallback
  if (!kindeDomain || !clientId || !clientSecret) {
    throw new Error("Missing Kinde management environment variables");
  }

  // ✅ Ensure https
  if (!kindeDomain.startsWith("https://")) {
    throw new Error("KINDE_DOMAIN must start with https://");
  }

  init({
    kindeDomain,
    clientId,
    clientSecret,
  });

  console.log("✅ Kinde management initialized");

  isKindeInitialized = true;
};

export const inviteMember = base
  .use(requireAuth)
  .use(requireWorkspaceMiddleware)
  .use(standardSecurityMiddleware)
  .use(writeSecurityMiddleware)
  .route({
    method: "POST",
    path: "/workspace/members/invite",
    summary: "invite a member",
    tags: ["Members"],
  })
  .input(inviteMemberSchema)
  .output(z.void())
  .handler(async ({ context, input, errors }) => {
    try {
      ensureKindeInit();

      await Users.createUser({
        requestBody: {
          organization_code: context.workspace.orgCode,
          profile: {
            given_name: input.name,
            picture: getAvatar(null, input.email),
          },
          identities: [
            {
              type: "email",
              details: {
                email: input.email,
              },
            },
          ],
        },
      });
    } catch (err) {
      console.error("❌ Invite member error:", err);
      throw errors.INTERNAL_SERVER_ERROR();
    }
  });

export const listMembers = base
  .use(requireAuth)
  .use(requireWorkspaceMiddleware)
  .use(standardSecurityMiddleware)
  .use(readSecurityMiddleware)
  .route({
    method: "GET",
    path: "/workspace/members",
    summary: "list all members",
    tags: ["Members"],
  })
  .input(z.void())
  .output(z.array(z.custom<organization_user>()))
  .handler(async ({ context }) => {
    ensureKindeInit();

    const orgCode = context.workspace.orgCode;

    const fallbackCurrentUser = {
      id: context.user.id,
      email: context.user.email ?? "",
      full_name:
        [context.user.given_name, context.user.family_name]
          .filter(Boolean)
          .join(" ")
          .trim() ||
        context.user.email ||
        "You",
      picture: context.user.picture ?? null,
    } as organization_user;

    // ✅ Try org users
    try {
      const data = await Organizations.getOrganizationUsers({
        orgCode,
        sort: "name_asc",
        pageSize: 100,
      });

      const orgUsers =
        (data as any).organization_users ??
        (data as any).organizations_users ??
        [];

      if (Array.isArray(orgUsers) && orgUsers.length > 0) {
        return orgUsers;
      }
    } catch (err) {
      console.warn("⚠️ Org users fetch failed:", err);
    }

    // ✅ Fallback
    try {
      const usersRes = await Users.getUsers({
        hasOrganization: true,
        expand: "organizations",
        pageSize: 200,
      });

      const filtered =
        usersRes.users?.filter((user) =>
          user.organizations?.some((org: any) => org.code === orgCode),
        ) ?? [];

      if (filtered.length > 0) {
        return filtered;
      }
    } catch (err) {
      console.warn("⚠️ Users fallback failed:", err);
    }

    // ✅ Final fallback
    return [fallbackCurrentUser];
  });
