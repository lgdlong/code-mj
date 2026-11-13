import crypto from "node:crypto";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { APIError } from "better-auth/api";
import { MAX_USERS } from "@/lib/constants";
import { prisma } from "@/server/prisma";

function makeRandomUsername(email: string | undefined, name: string | undefined): string {
  const base = (email?.split("@")[0] ?? name ?? "cortis")
    .toLowerCase()
    .replace(/[^a-z0-9._]/g, "")
    .slice(0, 14);
  const suffix = crypto.randomBytes(3).toString("hex");
  return `${base || "cortis"}_${suffix}`;
}

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    },
  },
  user: {
    additionalFields: {
      username: { type: "string", required: false, input: false },
      bio: { type: "string", required: false, defaultValue: "", input: false },
      role: { type: "string", required: false, defaultValue: "user", input: false },
      banned: { type: "boolean", required: false, defaultValue: false, input: false },
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (userData) => {
          const totalUsers = await prisma.user.count();
          if (totalUsers >= MAX_USERS) {
            throw new APIError("FORBIDDEN", {
              message: `Fandom đã đạt giới hạn ${MAX_USERS.toLocaleString("vi-VN")} thành viên.`,
            });
          }

          const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
          const isBootstrapAdmin =
            Boolean(adminEmail) && userData.email?.trim().toLowerCase() === adminEmail;

          return {
            data: {
              ...userData,
              username: makeRandomUsername(userData.email, userData.name),
              bio: "",
              role: isBootstrapAdmin ? "admin" : "user",
              banned: false,
            },
          };
        },
      },
    },
  },
});
