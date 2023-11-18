import prisma from "../../../utils/prismaClient";

export default defineEventHandler(async (event) => {
  const { method } = event.node.req;

  // Handle GET request - Fetch all items
  if (method === "GET") {
    const items = await prisma.item.findMany();
    return items;
  }

  // Handle POST request - Add a new item
  if (method === "POST") {
    // Read and validate request body
    const newItem = await readBody(event);
    if (!newItem.name || !newItem.description || !newItem.status) {
      return { error: "Missing required fields", statusCode: 400 };
    }

    // Check if the item already exists
    const existingItem = await prisma.item.findUnique({
      where: { name: newItem.name },
    });

    if (existingItem) {
      return { error: "Item already exists with this name", statusCode: 409 };
    }

    // Create the new item
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
      return { error: "Error creating item", statusCode: 500 };
    }
  }

  // If method is not GET or POST, return an error
  return { error: "Method not allowed", statusCode: 405 };
});
