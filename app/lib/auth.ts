import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/app/lib/prisma";

export class AuthError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "AuthError";
    this.status = status;
  }
}

type JwtPayload = {
  userId: string;
  role: "SUPER_ADMIN" | "ADMIN";
};

export async function requireAdmin(request: NextRequest) {
  const authHeader = request.headers.get("authorization");

  if (!authHeader) {
    throw new AuthError("UnAuthorised : No token provided", 401);
  }

  const [type, token] = authHeader.split(" ");

  if (type != "Bearer" || !token) {
    throw new AuthError("UnAuthorised : Invalid token format", 401);
  }

  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new AuthError("Internal Server Error: JWT_SECRET is not configured", 500);
  }

  let decoded: JwtPayload;
  try {
    decoded = jwt.verify(token, secret) as JwtPayload;
  } catch (error) {
    throw new AuthError("Invalid or expired token", 401);
  }

  const user = await prisma.user.findUnique({
    where: {
      id: decoded.userId,
    },
    select: {
      id: true,
      role: true,
      email: true,
      name: true,
      blocked: true,
    }
  });

  if (!user) {
    throw new AuthError("user not found", 404);
  }

  if (user.blocked) {
    throw new AuthError("Your account is blocked. Access denied.", 403);
  }

  if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
    throw new AuthError("Forbidden Access", 403);
  }

  return user;
}

export async function requireSuperAdmin(request: NextRequest) {
  const user = await requireAdmin(request);

  if (user.role !== "SUPER_ADMIN") {
    throw new AuthError("Forbidden Access: Super Admin role required", 403);
  }

  return user;
}
