import prisma from "../../../utils/prismaClient";

export default defineEventHandler(async (event) => {
  const { method } = event.node.req;

  // Only allow GET requests for this endpoint
  if (method !== "GET") {
    return { error: "Method not allowed", statusCode: 405 };
  }

  try {
    // Fetch all items with their current status
    const items = await prisma.item.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        status: true,
      },
    });

    // Return the list of items
    return { data: items, statusCode: 200 };
  } catch (error) {
    return { error: "Error fetching items status", statusCode: 500 };
  }
});
