import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function seed() {
  // seed data for users items and logs
  const users = [
    { name: "Alice", email: "alice@example.com", department: "Engineering" },
    { name: "Bob", email: "bob@example.com", department: "Human Resources" },
    { name: "Charlie", email: "charlie@example.com", department: "Marketing" },
    { name: "Diana", email: "diana@example.com", department: "Sales" },
    { name: "Eve", email: "eve@example.com", department: "Engineering" },
    {
      name: "Frank",
      email: "frank@example.com",
      department: "Human Resources",
    },
    { name: "Grace", email: "grace@example.com", department: "Marketing" },
    { name: "Henry", email: "henry@example.com", department: "Sales" },
  ];

  const items = [
    { name: "Laptop", description: "MacBook Pro 16-inch", status: "available" },
    {
      name: "Projector",
      description: "Portable HD Projector",
      status: "available",
    },
    { name: "Tablet", description: "iPad Pro", status: "available" },
    { name: "Smartphone", description: "iPhone 12", status: "available" },
    { name: "Desktop", description: "iMac 27-inch", status: "available" },
    { name: "Camera", description: "Canon DSLR", status: "available" },
    { name: "Headphones", description: "Sony WH-1000XM4", status: "available" },
    {
      name: "Smartwatch",
      description: "Apple Watch Series 6",
      status: "available",
    },
  ];

  const usageLogData = [
    { startTime: new Date(), endTime: null, userId: 1, itemId: 1 },
    { startTime: new Date(), endTime: new Date(), userId: 2, itemId: 2 },
    { startTime: new Date(), endTime: null, userId: 3, itemId: 3 },
    { startTime: new Date(), endTime: new Date(), userId: 4, itemId: 4 },
    { startTime: new Date(), endTime: null, userId: 5, itemId: 5 },
    { startTime: new Date(), endTime: new Date(), userId: 6, itemId: 6 },
    { startTime: new Date(), endTime: null, userId: 7, itemId: 7 },
    { startTime: new Date(), endTime: new Date(), userId: 8, itemId: 8 },
  ];

  // Clear existing data
  await prisma.usageLog.deleteMany({});
  await prisma.item.deleteMany({});
  await prisma.user.deleteMany({});

  // Seed db with the data
  for (const user of users) {
    await prisma.user.create({
      data: user,
    });
  }
  for (const item of items) {
    await prisma.item.create({
      data: { ...item, status: "available" },
    });
  }
  for (const log of usageLogData) {
    await prisma.usageLog.create({
      data: log,
    });

    // If the log entry has no end time, set the corresponding item's status to 'in use'
    if (!log.endTime) {
      await prisma.item.update({
        where: { id: log.itemId },
        data: { status: "in use" },
      });
    }
  }
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
