import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { hashPassword } from "@/app/lib/password";
import { updateUserSchema } from "@/app/validations/user.validation";
import { requireSuperAdmin, AuthError } from "@/app/lib/auth";
import {
  sendUserBlockedNotification,
  sendUserUnblockedNotification,
} from "@/app/lib/email";

// update the user

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

// get user by id

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    await requireSuperAdmin(request);

    const { id } = await context.params;
    const user = await prisma.user.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        blocked: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          message: "user not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        message: "user fetched successfully",
        data: user,
      },
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        {
          message: error.message,
        },
        { status: error.status },
      );
    }

    console.log("error : ", error);
    return NextResponse.json(
      {
        message: "failed to get the user",
      },
      { status: 500 },
    );
  }
}

// update user

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const currentUser = await requireSuperAdmin(request);

    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        {
          message: "id is required to update the user",
        },
        { status: 400 },
      );
    }

    const data = await request.json();

    // Validate request
    const result = updateUserSchema.safeParse(data);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          errors: result.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: {
        id,
      },
    });

    if (!existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 },
      );
    }

    // Super Admins cannot edit other Super Admins (view only)
    if (existingUser.role === "SUPER_ADMIN" && existingUser.id !== currentUser.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Forbidden: Super Admins cannot edit other Super Admins. View only.",
        },
        { status: 403 },
      );
    }

    const { name, email, password, role, blocked } = result.data;

    // Check duplicate email only if email is changed
    if (email && email !== existingUser.email) {
      const existingEmail = await prisma.user.findUnique({
        where: {
          email,
        },
      });

      if (existingEmail) {
        return NextResponse.json(
          {
            success: false,
            message: "Email already exists",
          },
          { status: 409 },
        );
      }
    }

    const updateData: {
      name?: string;
      email?: string;
      password?: string;
      role?: "SUPER_ADMIN" | "ADMIN";
      blocked?: boolean;
    } = {};

    if (name !== undefined) {
      updateData.name = name;
    }

    // Email and role cannot be changed when editing own profile
    if (id !== currentUser.id) {
      if (email !== undefined) {
        updateData.email = email;
      }

      if (role !== undefined) {
        updateData.role = role;
      }
    }

    // Block status updates
    if (blocked !== undefined && blocked !== existingUser.blocked) {
      if (id === currentUser.id) {
        return NextResponse.json(
          {
            success: false,
            message: "You cannot block or unblock your own account.",
          },
          { status: 400 },
        );
      }

      if (existingUser.role === "SUPER_ADMIN") {
        return NextResponse.json(
          {
            success: false,
            message: "Super Admins cannot block other Super Admins.",
          },
          { status: 403 },
        );
      }

      updateData.blocked = blocked;
    }

    // Hash password if updated
    if (password !== undefined && password.trim().length > 0) {
      updateData.password = await hashPassword(password);
    }

    const updatedUser = await prisma.user.update({
      where: {
        id,
      },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        blocked: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Send email notification on block status change
    if (blocked !== undefined && blocked !== existingUser.blocked) {
      if (blocked) {
        sendUserBlockedNotification({
          name: existingUser.name,
          email: existingUser.email,
        }).catch((err) => console.error("Failed to send user blocked email:", err));
      } else {
        sendUserUnblockedNotification({
          name: existingUser.name,
          email: existingUser.email,
        }).catch((err) => console.error("Failed to send user unblocked email:", err));
      }
    }

    return NextResponse.json(
      {
        message: "User updated successfully",
        data: updatedUser,
      },
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        {
          message: error.message,
        },
        { status: error.status },
      );
    }

    console.log("Update user error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update user",
      },
      { status: 500 },
    );
  }
}

// delete user

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const currentUser = await requireSuperAdmin(request);
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        {
          message: "id is required to delete the user",
        },
        { status: 404 },
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        id,
      },
    });

    if (!existingUser) {
      return NextResponse.json(
        {
          message: "user not found",
        },
        { status: 404 },
      );
    }

    if (existingUser.id === currentUser.id) {
      return NextResponse.json(
        {
          message: "You cannot delete your own account.",
        },
        { status: 400 },
      );
    }

    // Super Admins cannot delete other Super Admins
    if (existingUser.role === "SUPER_ADMIN") {
      return NextResponse.json(
        {
          message: "Forbidden: Super Admins cannot delete other Super Admins. View only.",
        },
        { status: 403 },
      );
    }

    const deletedUser = await prisma.user.delete({
      where: {
        id: id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        blocked: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(
      {
        message: "user deleted successfully",
        data: deletedUser,
      },
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        {
          message: error.message,
        },
        { status: error.status },
      );
    }

    console.log("error : ", error);
    return NextResponse.json(
      {
        message: "failed to delete the user",
      },
      { status: 500 },
    );
  }
}

// Toggle block / recover user
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const currentUser = await requireSuperAdmin(request);
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "User ID is required",
        },
        { status: 400 },
      );
    }

    const body = await request.json();
    const { blocked } = body;

    if (typeof blocked !== "boolean") {
      return NextResponse.json(
        {
          success: false,
          message: "'blocked' boolean field is required",
        },
        { status: 400 },
      );
    }

    const targetUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!targetUser) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 },
      );
    }

    // Super Admin cannot block themselves
    if (targetUser.id === currentUser.id) {
      return NextResponse.json(
        {
          success: false,
          message: "You cannot block or unblock your own account.",
        },
        { status: 400 },
      );
    }

    // Super Admin cannot block other Super Admins
    if (targetUser.role === "SUPER_ADMIN") {
      return NextResponse.json(
        {
          success: false,
          message: "Super Admins cannot block other Super Admins.",
        },
        { status: 403 },
      );
    }

    // If already in that state, return early
    if (targetUser.blocked === blocked) {
      return NextResponse.json(
        {
          success: true,
          message: blocked ? "User is already blocked." : "User is already active.",
          data: targetUser,
        },
        { status: 200 },
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { blocked },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        blocked: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Send email notification asynchronously
    if (blocked) {
      sendUserBlockedNotification({
        name: targetUser.name,
        email: targetUser.email,
      }).catch((err) => console.error("Failed to send user blocked email:", err));
    } else {
      sendUserUnblockedNotification({
        name: targetUser.name,
        email: targetUser.email,
      }).catch((err) => console.error("Failed to send user unblocked email:", err));
    }

    return NextResponse.json(
      {
        success: true,
        message: blocked
          ? `User "${targetUser.name}" has been blocked.`
          : `User "${targetUser.name}" has been unblocked and recovered.`,
        data: updatedUser,
      },
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
        },
        { status: error.status },
      );
    }

    console.error("Block/unblock user error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update user block status",
      },
      { status: 500 },
    );
  }
}
