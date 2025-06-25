import { prisma } from "./prisma";

export default async function LoggedIn(sessionToken: string | null) {
  if (!sessionToken) {
    return false;
  }

  const session = await prisma.session.findUnique({
    where: {
      token: sessionToken,
    },
    include: {
      user: true,
    },
  });

  if (!session) {
    return false;
  }

  if (!session.user) {
    return false;
  }

  return session.user.id;
}
