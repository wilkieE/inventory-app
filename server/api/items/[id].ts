import prisma from "../../../utils/prismaClient";
import { readBody } from "h3";

export default defineEventHandler(async (event) => {
  const { method } = event.node.req;
  const { id } = event.context.params as { id: string };
  const itemId = Number(id);
  if (isNaN(itemId)) {
    return { error: "Invalid item ID", statusCode: 400 };
  }

  // Handle GET request - Fetch a single item by ID
  if (method === "GET") {
    const item = await prisma.item.findUnique({
      where: { id: itemId },
    });
    if (!item) {
      return { error: "Item not found", statusCode: 404 };
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

  // Handle DELETE request - Delete an item
  if (method === "DELETE") {
    try {
      await prisma.item.delete({
        where: { id: itemId },
      });
      return { message: "Item deleted successfully", statusCode: 200 };
    } catch (error) {
      return { error: "Error deleting item", statusCode: 500 };
    }
  }

  // If method is not GET, PUT, or DELETE, return an error
  return { error: "Method not allowed", statusCode: 405 };
});
