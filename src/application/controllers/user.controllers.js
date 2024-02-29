import prisma from "../../domain/db/index.js";

export const createUser = async (values) => {
  try {
    const user = await prisma.user.create({
      data: values,
    });
    return user;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};

export const getUserByEmail = async (email) => {
  const user = await prisma.user.findUnique({ where: { email } });
  return user;
};

export const getUserById = async (userId) => {
  const user = await prisma.user.findFirst({
    where: {
      id: userId,
    },
  });
  return user;
};


