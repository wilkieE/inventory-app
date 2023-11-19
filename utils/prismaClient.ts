import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

prisma.$use(async (params, next) => {
  if (params.model && params.action === "delete") {
    params.action = "update";
    params.args["data"] = { deletedAt: new Date() };
  } else if (params.model && params.action === "deleteMany") {
    params.action = "updateMany";
    if (!params.args.data) {
      params.args.data = {};
    }
    params.args.data.deletedAt = new Date();
  }

  return next(params);
});

export default prisma;
