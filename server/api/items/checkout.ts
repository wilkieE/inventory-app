import prisma from "../../../utils/prismaClient";

export default defineEventHandler(async (event) => {
  const { method } = event.node.req;

  // Ensure the request method is POST
  if (method !== "POST") {
    return { error: "Method not allowed", statusCode: 405 };
  }

  // Read and validate request body
  const checkoutData = await readBody(event);
  const { userId, itemId } = checkoutData;

  if (!userId || !itemId) {
    return { error: "Missing userId or itemId", statusCode: 400 };
  }
  const numericUserId = Number(userId);
  const numericItemId = Number(itemId);
  if (isNaN(numericUserId) || isNaN(numericItemId)) {
    return { error: "Invalid userId or itemId", statusCode: 400 };
  }

  try {
    // Check if the item is already checked out
    const existingLog = await prisma.usageLog.findFirst({
      where: {
        itemId: numericItemId,
        endTime: null,
      },
    });

    if (existingLog) {
      return { error: "Item is already checked out", statusCode: 400 };
    }

    // Create a new usage log
    const usageLog = await prisma.usageLog.create({
      data: {
        userId: numericUserId,
        itemId: numericItemId,
        startTime: new Date(),
      },
    });

    // Update item status to 'in use'
    await prisma.item.update({
      where: { id: numericItemId },
      data: { status: "in use" },
    });

    return { data: usageLog, statusCode: 200 };
  } catch (error) {
    return { error: "Error checking out item", statusCode: 500 };
  }
});
