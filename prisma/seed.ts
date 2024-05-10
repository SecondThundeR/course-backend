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
            content: 'Хей!',
            contentHistory: ['Хей!'],
            fromId: user1.id,
          },
          {
            content: 'Привет!',
            contentHistory: ['Привет!'],
            fromId: user2.id,
          },
          {
            content: 'Как тебе такое?',
            contentHistory: ['Как тебе такое?'],
            fromId: user2.id,
          },
          {
            content: '\\int_0^\\infty x^2 dx',
            contentHistory: ['\\int_0^\\infty x^2 dx'],
            fromId: user2.id,
            type: 'LATEX',
          },
          {
            content: 'Ого, класс',
            contentHistory: ['Ого, класс'],
            fromId: user1.id,
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
