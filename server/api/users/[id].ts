import prisma from '../../../utils/prismaClient';

export default defineEventHandler(async (event) => {
  const { method } = event.node.req;
  const { id } = event.context.params as { id: string };
  const userId = Number(id);
  if (isNaN(userId)) {
    return { error: 'Invalid user ID', statusCode: 400 };
  }

  // Handle GET request - Fetch a single user by ID
  if (method === 'GET') {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      return { error: 'User not found', statusCode: 404 };
    }
    return user;
  }

  // Handle PUT request - Update a user's information
  if (method === 'PUT') {
    const userData = await readBody(event);
    try {
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: userData,
      });
      return { data: updatedUser, statusCode: 200 };
    } catch (error) {
      return { error: 'Error updating user', statusCode: 500 };
    }
  }

  // Handle DELETE request - Delete a user
  if (method === 'DELETE') {
    try {
      await prisma.user.delete({
        where: { id: userId },
      });
      return { message: 'User deleted successfully', statusCode: 200 };
    } catch (error) {
      return { error: 'Error deleting user', statusCode: 500 };
    }
  }

  // If method is not GET, PUT, or DELETE, return an error
  return { error: 'Method not allowed', statusCode: 405 };
});
