import { headers } from "next/headers";
import { cache } from "react";
import { auth } from "@/server/auth";
import { prisma } from "@/server/prisma";

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  image: string | null;
  username: string;
  bio: string;
  role: "user" | "admin";
  banned: boolean;
}

export const getServerUser = cache(async (): Promise<AuthenticatedUser | null> => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) return null;

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      username: true,
      bio: true,
      role: true,
      banned: true,
    },
  });

  if (!dbUser || dbUser.banned) return null;

  return {
    ...dbUser,
    role: dbUser.role === "admin" ? "admin" : "user",
  };
});

export class UnauthorizedError extends Error {
  constructor(message = "Unauthorized") {
    super(message);
  }
}

export class ForbiddenError extends Error {
  constructor(message = "Forbidden") {
    super(message);
  }
}

export async function requireSessionUser(): Promise<AuthenticatedUser> {
  const user = await getServerUser();
  if (!user) {
    throw new UnauthorizedError("Authentication required");
  }
  return user;
}

export async function requireAdminUser(): Promise<AuthenticatedUser> {
  const user = await requireSessionUser();
  if (user.role !== "admin") {
    throw new ForbiddenError("Admin access required");
  }
  return user;
}
