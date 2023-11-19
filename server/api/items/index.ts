import prisma from "../../../utils/prismaClient";

export default defineEventHandler(async (event) => {
  const { method } = event.node.req;

  // Handle GET request - Fetch all items
  if (method === "GET") {
    const items = await prisma.item.findMany({
      where: {
        deletedAt: null,
      },
    });
    return items;
  }

  // Handle POST request - Add a new item
  if (method === "POST") {
    const newItem = await readBody(event);
    if (!newItem.name || !newItem.description || !newItem.status) {
      return { error: "Missing required fields", statusCode: 400 };
    }

    // Check if the item exists and is soft deleted
    const existingItem = await prisma.item.findFirst({
      where: {
        name: newItem.name,
        deletedAt: { not: null },
      },
    });

    // Reactivate and update the soft-deleted item
    if (existingItem) {
      try {
        const reactivatedItem = await prisma.item.update({
          where: { id: existingItem.id },
          data: {
            ...newItem,
            deletedAt: null,
          },
        });
        return { data: reactivatedItem, statusCode: 200 };
      } catch (error) {
        return { error: "Error reactivating item", statusCode: 500 };
      }
    }

    // or create the new item if it does not exist
    try {
      const createdItem = await prisma.item.create({
        data: {
          name: newItem.name,
          description: newItem.description,
          status: newItem.status,
        },
      });
      return { data: createdItem, statusCode: 201 };
    } catch (error) {
      return { error: `Error creating item ${error}`, statusCode: 500 };
    }
  }

  // If method is not GET or POST, return an error
  return { error: "Method not allowed", statusCode: 405 };
});
