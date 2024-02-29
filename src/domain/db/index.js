import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const connectToDB = async () => {
  try {
    await prisma.$connect();
    console.log("DB connected Successfully");
  } catch (error) {
    console.log("Error while connecting to DB : ", error.message);
    throw error;
    // process.exit(1);
  }
};

export default prisma;
