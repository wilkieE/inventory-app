import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

async function softDeleteUser(args: Prisma.UserWhereUniqueInput) {
  await prisma.user.update({
    where: { ...args },
    data: { deletedAt: new Date() },
  });
}

async function softDeleteItem(args: Prisma.ItemWhereUniqueInput) {
  await prisma.item.update({
    where: { ...args },
    data: { deletedAt: new Date() },
  });
}

async function softDeleteUsageLog(args: Prisma.UsageLogWhereUniqueInput) {
  await prisma.usageLog.update({
    where: { ...args },
    data: { deletedAt: new Date() },
  });
}

export default prisma;
export { softDeleteUser, softDeleteItem, softDeleteUsageLog };
