import prisma, { softDeleteItem } from "../../../utils/prismaClient";

export default defineEventHandler(async (event) => {
  const { method } = event.node.req;
  const { id } = event.context.params as { id: string };
  const itemId = Number(id);
  if (isNaN(itemId)) {
    return { error: "Invalid item ID", statusCode: 400 };
  }

  // Handle GET request - Fetch a single item by ID
  if (method === "GET") {
    const item = await prisma.item.findFirst({
      where: {
        id: itemId,
        deletedAt: null,
      },
    });
    if (!item) {
      return { error: "Item not found or has been deleted", statusCode: 404 };
    }
    return item;
  }

  // Handle PUT request - Update an item's information
  if (method === "PUT") {
    const itemData = await readBody(event);
    try {
      const updatedItem = await prisma.item.update({
        where: { id: itemId },
        data: itemData,
      });
      return { data: updatedItem, statusCode: 200 };
    } catch (error) {
      return { error: "Error updating item", statusCode: 500 };
    }
  }

  // Handle DELETE request - Soft delete an item
  if (method === "DELETE") {
    try {
      // Check if the item exists and is not soft deleted
      const item = await prisma.item.findUnique({
        where: { id: itemId },
      });
      if (!item) {
        return { error: "Item not found", statusCode: 404 };
      }
      if (item.deletedAt) {
        return {
          error: "Item has already been deleted",
          statusCode: 400,
        };
      }

      // Check if the item isnt checked out
      if (item.status !== "available") {
        return {
          error: "Item cannot be deleted while it is checked out",
          statusCode: 400,
        };
      }

      await softDeleteItem({ id: itemId });

      return { message: "Item soft deleted successfully", statusCode: 200 };
    } catch (error) {
      return { error: `Error soft deleting item`, statusCode: 500 };
    }
  }

  // If method is not GET, PUT, or DELETE, return an error
  return { error: "Method not allowed", statusCode: 405 };
});
