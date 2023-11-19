import prisma from "../../../utils/prismaClient";

export default defineEventHandler(async (event) => {
  const { method } = event.node.req;

  // Only allow GET requests for this endpoint
  if (method !== "GET") {
    return { error: "Method not allowed", statusCode: 405 };
  }

  try {
    const items = await prisma.item.findMany({
      where: {
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        description: true,
        status: true,
      },
    });

    return { data: items, statusCode: 200 };
  } catch (error) {
    return { error: "Error fetching items", statusCode: 500 };
  }
});
