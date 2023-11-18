import prisma from "../../../../utils/prismaClient";

export default defineEventHandler(async (event) => {
  const { method } = event.node.req;
  const { id } = event.context.params as { id: string };
  const itemId = Number(id);
  if (isNaN(itemId)) {
    return { error: "Invalid item ID", statusCode: 400 };
  }

  // Handle only GET request for fetching item's history, including the user who checked out the item and the item itself
  if (method === "GET") {
    try {
      const itemHistory = await prisma.usageLog.findMany({
        where: { itemId: itemId },
        include: {
          user: true,
          item: true,
        },
        orderBy: {
          startTime: "desc",
        },
      });
      return { data: itemHistory, statusCode: 200 };
    } catch (error) {
      return { error: "Error retrieving item history", statusCode: 500 };
    }
  } else {
    // If method is not GET, return an error
    return { error: "Method not allowed", statusCode: 405 };
  }
});
