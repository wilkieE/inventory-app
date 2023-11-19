import prisma from "../../../utils/prismaClient";

export default defineEventHandler(async (event) => {
  const { method } = event.node.req;

  // Ensure the request method is POST
  if (method !== "POST") {
    return { error: "Method not allowed", statusCode: 405 };
  }

  // Read and validate the request
  const returnData = await readBody(event);
  const { userId, itemId } = returnData;

  if (!userId || !itemId) {
    return { error: "Missing userId or itemId", statusCode: 400 };
  }
  const numericUserId = Number(userId);
  const numericItemId = Number(itemId);
  if (isNaN(numericUserId) || isNaN(numericItemId)) {
    return { error: "Invalid userId or itemId", statusCode: 400 };
  }

  try {
    // Check if the user or item is soft deleted
    const user = await prisma.user.findUnique({
      where: { id: numericUserId },
    });
    const item = await prisma.item.findUnique({
      where: { id: numericItemId },
    });

    if (!user || user.deletedAt) {
      return { error: "User not found or has been deleted", statusCode: 404 };
    }

    if (!item || item.deletedAt) {
      return { error: "Item not found or has been deleted", statusCode: 404 };
    }

    // Perform the updates as a transaction
    await prisma.$transaction(async (prisma) => {
      // Find the latest usage log for the item by this user that hasn't been closed yet
      const usageLog = await prisma.usageLog.findFirst({
        where: {
          userId: numericUserId,
          itemId: numericItemId,
          endTime: null, // log is open if endTime is null
        },
        orderBy: {
          startTime: "desc", // Get the most recent log
        },
      });

      if (!usageLog) {
        throw new Error("No open usage log found for this user and item");
      }

      // Update the usage log to set the end time to now essentially closing the log
      await prisma.usageLog.update({
        where: { id: usageLog.id },
        data: { endTime: new Date() },
      });

      // also update the item's status to available
      await prisma.item.update({
        where: { id: numericItemId },
        data: { status: "available" },
      });
    });

    return { message: "Item returned successfully", statusCode: 200 };
  } catch (error) {
    return { error: `Error returning item`, statusCode: 500 };
  }
});
