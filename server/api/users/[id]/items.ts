import prisma from "../../../../utils/prismaClient";

export default defineEventHandler(async (event) => {
  const { id } = event.context.params as { id: string };
  const userId = Number(id);
  if (isNaN(userId)) {
    return { error: "Invalid user ID", statusCode: 400 };
  }

  const method = event.node.req.method;

  // Handle GET request - Fetch items checked out by the user
  if (method === "GET") {
    try {
      const usageLogs = await prisma.usageLog.findMany({
        where: {
          userId: userId,
          endTime: null,
        },
        include: {
          item: true,
        },
      });

      // Extracting the items from the usage logs
      const items = usageLogs.map((log) => log.item);

      return { data: items, statusCode: 200 };
    } catch (error) {
      return { error: "Error fetching items", statusCode: 500 };
    }
  }

  // If method is not GET, return an error
  return { error: "Method not allowed", statusCode: 405 };
});
