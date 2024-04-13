import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.conversation.deleteMany();
  await prisma.message.deleteMany();
  await prisma.user.deleteMany();

  console.log('Seeding...');

  const user1 = await prisma.user.create({
    data: {
      email: 'lisa@simpson.com',
      firstname: 'Lisa',
      lastname: 'Simpson',
      password: '$2b$10$EpRnTzVlqHNP0.fUbXUwSOyuiXe/QLSUG6xNekdHgTGmrpHEfIoxm', // secret42
    },
  });
  const user2 = await prisma.user.create({
    data: {
      email: 'bart@simpson.com',
      firstname: 'Bart',
      lastname: 'Simpson',
      password: '$2b$10$EpRnTzVlqHNP0.fUbXUwSOyuiXe/QLSUG6xNekdHgTGmrpHEfIoxm', // secret42
    },
  });

  const conversation = await prisma.conversation.create({
    data: {
      participants: {
        connect: [
          {
            id: user1.id,
          },
          {
            id: user2.id,
          },
        ],
      },
      creatorId: user1.id,
      messages: {
        create: [
          {
            content: 'Hi!',
            contentHistory: ['Hi!'],
            fromId: user1.id,
          },
          {
            content: 'Hello!',
            contentHistory: ['Hello!'],
            fromId: user2.id,
          },
          {
            content: 'Check this out!',
            contentHistory: ['Check this out!'],
            fromId: user2.id,
          },
          {
            content: '\\int_0^\\infty x^2 dx',
            contentHistory: ['\\int_0^\\infty x^2 dx'],
            fromId: user2.id,
            type: 'LATEX',
          },
        ],
      },
    },
    include: {
      messages: true,
      participants: true,
    },
  });

  console.log({ user1, user2 });
  console.log({ conversation });
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
