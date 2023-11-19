// User API Handler
import prisma, { softDeleteUser } from "../../../utils/prismaClient";

export default defineEventHandler(async (event) => {
  const { method } = event.node.req;
  const { id } = event.context.params as { id: string };
  const userId = Number(id);
  if (isNaN(userId)) {
    return { error: "Invalid user ID", statusCode: 400 };
  }

  // Handle GET request - Fetch a single user by ID along with their items
  if (method === "GET") {
    const userWithItems = await prisma.user.findUnique({
      where: {
        id: userId,
        deletedAt: null,
      },
      include: {
        usageLogs: {
          include: {
            item: true,
          },
        },
      },
    });
    if (!userWithItems) {
      return { error: "User not found or has been deleted", statusCode: 404 };
    }
    return { data: userWithItems, statusCode: 200 };
  }

  // Handle PUT request - Update a user's information
  if (method === "PUT") {
    const userData = await readBody(event);
    const { name, email, department } = userData;

    try {
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { name, email, department },
      });
      return { data: updatedUser, statusCode: 200 };
    } catch (error) {
      return { error: `Error updating user`, statusCode: 500 };
    }
  }

  // Handle DELETE request - Soft delete a user
  if (method === "DELETE") {
    try {
      // Check if the user exists and is not soft deleted
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });
      if (!user) {
        return { error: "User not found", statusCode: 404 };
      }

      if (user.deletedAt) {
        return { error: "User has already been deleted", statusCode: 400 };
      }

      // Check for checked-out items by the user
      const checkedOutItems = await prisma.usageLog.findMany({
        where: {
          userId: userId,
          endTime: null,
        },
      });

      if (checkedOutItems.length > 0) {
        return {
          error: "User cannot be deleted while having checked-out items",
          statusCode: 400,
        };
      }

      // Proceed with soft deletion
      await softDeleteUser({ id: userId });

      return { message: "User soft deleted successfully", statusCode: 200 };
    } catch (error) {
      return { error: "Error soft deleting user", statusCode: 500 };
    }
  }

  // If method is not GET, PUT, or DELETE, return an error
  return { error: "Method not allowed", statusCode: 405 };
});
