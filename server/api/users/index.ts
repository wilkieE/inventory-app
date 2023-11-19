import prisma from "../../../utils/prismaClient";

export default defineEventHandler(async (event) => {
  const { method } = event.node.req;

  // Handle GET request - Fetch all users
  if (method === "GET") {
    const users = await prisma.user.findMany({
      where: {
        deletedAt: null,
      },
      include: {
        usageLogs: {
          where: {
            endTime: null,
            deletedAt: null,
          },
          include: {
            item: true,
          },
        },
      },
    });
    const usersWithCheckedOutItems = users.map((user) => {
      const checkedOutItems = user.usageLogs
        .filter((log) => log.deletedAt === null)
        .map((log) => {
          return {
            id: log.item.id,
            name: log.item.name,
            description: log.item.description,
            status: log.item.status,
            deletedAt: log.item.deletedAt,
          };
        });

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        department: user.department,
        deletedAt: user.deletedAt,
        checkedOutItems,
      };
    });

    return usersWithCheckedOutItems;
  }

  // Handle POST request - Create a new user
  if (method === "POST") {
    const newUser = await readBody(event);

    // Validate the input
    if (!newUser.name || !newUser.email || !newUser.department) {
      return { error: "Missing required fields", statusCode: 400 };
    }

    // Check if the user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: newUser.email },
    });

    if (existingUser) {
      return { error: "User already exists with this email", statusCode: 409 };
    }

    // Create the new user
    try {
      const createdUser = await prisma.user.create({
        data: {
          name: newUser.name,
          email: newUser.email,
          department: newUser.department,
        },
      });
      return { data: createdUser, statusCode: 201 };
    } catch (error) {
      return { error: "Error creating user", statusCode: 500 };
    }
  }

  // If method is not GET or POST, return an error
  return { error: "Method not allowed", statusCode: 405 };
});
