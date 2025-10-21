import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getUserByEmail = async (email) => {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        accounts: true,
        kyc: true,
        deposits: true,
        withdrawals: true,
      },
    });
    return user;
  } catch (error) {
    console.error('Error fetching user by email:', error);
    throw error;
  }
};

export default prisma;