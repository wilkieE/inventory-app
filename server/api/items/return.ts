import prisma from "../../../utils/prismaClient";

export default defineEventHandler(async (event) => {
  const { method } = event.node.req;

  // Ensure the request method is POST
  if (method !== "POST") {
    return { error: "Method not allowed", statusCode: 405 };
  }

  // Read and validate the request
  const returnData = await readBody(event);
  const { itemId, returnNotes } = returnData;

  if (!itemId) {
    return { error: "Missing itemId", statusCode: 400 };
  }
  const numericItemId = Number(itemId);
  if (isNaN(numericItemId)) {
    return { error: "Invalid itemId", statusCode: 400 };
  }

  try {
    // Find the latest open usage log for the item
    const usageLog = await prisma.usageLog.findFirst({
      where: {
        itemId: numericItemId,
        endTime: null,
      },
      orderBy: {
        startTime: "desc",
      },
    });

    if (!usageLog) {
      return {
        error: "No open usage log found for this item",
        statusCode: 404,
      };
    }

    const userId = usageLog.userId;

    // Check if the user is soft deleted
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.deletedAt) {
      return { error: "User not found or has been deleted", statusCode: 404 };
    }

    // Perform the updates as a transaction
    await prisma.$transaction(async (prisma) => {
      // close the log and add return notes
      await prisma.usageLog.update({
        where: { id: usageLog.id },
        data: {
          endTime: new Date(),
          returnNotes: returnNotes || null,
        },
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
