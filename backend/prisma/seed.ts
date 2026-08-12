import { PrismaClient, WorkspaceRole, BoardRole, CardPriority, ActivityAction, NotificationType } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // 1. Clean existing records (in dependency order)
  await prisma.notification.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.attachment.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.checklistItem.deleteMany();
  await prisma.checklist.deleteMany();
  await prisma.cardLabel.deleteMany();
  await prisma.label.deleteMany();
  await prisma.cardMember.deleteMany();
  await prisma.card.deleteMany();
  await prisma.list.deleteMany();
  await prisma.boardStar.deleteMany();
  await prisma.boardMember.deleteMany();
  await prisma.board.deleteMany();
  await prisma.workspaceMember.deleteMany();
  await prisma.workspace.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();

  console.log('🧹 Cleaned up old data.');

  // 2. Create Users
  const passwordHash = await bcrypt.hash('Password123!', 10);

  const demoUser = await prisma.user.create({
    data: {
      email: 'demo@trello.dev',
      name: 'Alex Vance',
      passwordHash,
      bio: 'Lead Full-Stack Engineer & Product Builder.',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      isEmailVerified: true,
    },
  });

  const sarahUser = await prisma.user.create({
    data: {
      email: 'sarah@trello.dev',
      name: 'Sarah Connor',
      passwordHash,
      bio: 'UI/UX Designer & Design Systems Architect.',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      isEmailVerified: true,
    },
  });

  const jordanUser = await prisma.user.create({
    data: {
      email: 'jordan@trello.dev',
      name: 'Jordan Lee',
      passwordHash,
      bio: 'DevOps & Distributed Systems Specialist.',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      isEmailVerified: true,
    },
  });

  console.log('👤 Created Users:', demoUser.email, sarahUser.email, jordanUser.email);

  // 3. Create Workspace
  const workspace = await prisma.workspace.create({
    data: {
      name: 'Acme Product & Tech',
      slug: 'acme-product-tech',
      description: 'Main product engineering and design workspace for next-gen platform.',
      ownerId: demoUser.id,
      members: {
        create: [
          { userId: demoUser.id, role: WorkspaceRole.OWNER },
          { userId: sarahUser.id, role: WorkspaceRole.ADMIN },
          { userId: jordanUser.id, role: WorkspaceRole.MEMBER },
        ],
      },
    },
  });

  console.log('🏢 Created Workspace:', workspace.name);

  // 4. Create Boards
  const sprintBoard = await prisma.board.create({
    data: {
      workspaceId: workspace.id,
      ownerId: demoUser.id,
      title: '🚀 Sprint 42 - Core Kanban & Realtime',
      description: 'Active sprint covering drag-and-drop, WebSocket synchronization, and design system components.',
      backgroundType: 'gradient',
      backgroundValue: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #311042 100%)',
      isPublic: false,
      members: {
        create: [
          { userId: demoUser.id, role: BoardRole.ADMIN },
          { userId: sarahUser.id, role: BoardRole.NORMAL },
          { userId: jordanUser.id, role: BoardRole.NORMAL },
        ],
      },
      stars: {
        create: [
          { userId: demoUser.id },
        ],
      },
    },
  });

  const designBoard = await prisma.board.create({
    data: {
      workspaceId: workspace.id,
      ownerId: sarahUser.id,
      title: '🎨 Design System 2.0 & Brand Guidelines',
      description: 'Component library, token definitions, typography, and dark mode palette exploration.',
      backgroundType: 'gradient',
      backgroundValue: 'linear-gradient(135deg, #1e293b 0%, #0f766e 100%)',
      isPublic: true,
      members: {
        create: [
          { userId: sarahUser.id, role: BoardRole.ADMIN },
          { userId: demoUser.id, role: BoardRole.NORMAL },
        ],
      },
    },
  });

  console.log('📋 Created Boards:', sprintBoard.title, designBoard.title);

  // 5. Create Labels for Sprint Board
  const labelFrontend = await prisma.label.create({
    data: { boardId: sprintBoard.id, name: 'Frontend', color: '#3b82f6' },
  });
  const labelBackend = await prisma.label.create({
    data: { boardId: sprintBoard.id, name: 'Backend', color: '#10b981' },
  });
  const labelUrgent = await prisma.label.create({
    data: { boardId: sprintBoard.id, name: 'Urgent', color: '#ef4444' },
  });
  const labelDesign = await prisma.label.create({
    data: { boardId: sprintBoard.id, name: 'UI / UX', color: '#ec4899' },
  });
  const labelDevOps = await prisma.label.create({
    data: { boardId: sprintBoard.id, name: 'DevOps', color: '#f59e0b' },
  });

  // 6. Create Lists for Sprint Board
  const listBacklog = await prisma.list.create({
    data: { boardId: sprintBoard.id, title: 'Ideas & Backlog', position: 1000 },
  });
  const listTodo = await prisma.list.create({
    data: { boardId: sprintBoard.id, title: 'To Do', position: 2000 },
  });
  const listInProgress = await prisma.list.create({
    data: { boardId: sprintBoard.id, title: 'In Progress', position: 3000 },
  });
  const listReview = await prisma.list.create({
    data: { boardId: sprintBoard.id, title: 'Code Review & QA', position: 4000 },
  });
  const listDone = await prisma.list.create({
    data: { boardId: sprintBoard.id, title: 'Done ✨', position: 5000 },
  });

  console.log('📑 Created Lists for Sprint Board');

  // 7. Create Cards
  // Card 1: DnD Kanban
  const card1 = await prisma.card.create({
    data: {
      listId: listInProgress.id,
      title: 'Implement smooth multi-column drag and drop',
      description: 'Integrate `@hello-pangea/dnd` with optimistic client state updates, cross-list movement, and fractional position calculation.\n\n### Acceptance Criteria\n- Cards animate smoothly into placeholder\n- List reordering works horizontally\n- Works seamlessly on mobile touch viewports',
      position: 1000,
      priority: CardPriority.HIGH,
      dueDate: new Date(Date.now() + 86400000 * 2),
      coverColor: '#3b82f6',
      members: { create: [{ userId: demoUser.id }] },
      labels: { create: [{ labelId: labelFrontend.id }, { labelId: labelUrgent.id }] },
      checklists: {
        create: [
          {
            title: 'Implementation Steps',
            position: 1000,
            items: {
              create: [
                { title: 'Setup DragDropContext and Droppable containers', isCompleted: true, position: 1000 },
                { title: 'Write optimistic Zustand store reordering handler', isCompleted: true, position: 2000 },
                { title: 'Implement fractional positioning endpoint in NestJS', isCompleted: false, position: 3000 },
                { title: 'Test edge case of dropping at list boundaries', isCompleted: false, position: 4000 },
              ],
            },
          },
        ],
      },
      comments: {
        create: [
          {
            userId: sarahUser.id,
            content: 'Make sure the drop shadow on active dragging cards has a sleek glow effect!',
          },
        ],
      },
    },
  });

  // Card 2: WebSockets
  const card2 = await prisma.card.create({
    data: {
      listId: listInProgress.id,
      title: 'Real-time WebSocket synchronization & presence',
      description: 'Broadcast board mutations (card moves, label updates, comments) to all connected clients in board room via Socket.io.',
      position: 2000,
      priority: CardPriority.URGENT,
      dueDate: new Date(Date.now() + 86400000 * 3),
      coverColor: '#10b981',
      members: { create: [{ userId: demoUser.id }, { userId: jordanUser.id }] },
      labels: { create: [{ labelId: labelBackend.id }] },
      checklists: {
        create: [
          {
            title: 'Socket.io Gateway',
            position: 1000,
            items: {
              create: [
                { title: 'Create NestJS EventsGateway with room joins', isCompleted: true, position: 1000 },
                { title: 'Implement client reconnect and state sync', isCompleted: false, position: 2000 },
                { title: 'Show active user presence avatars on board header', isCompleted: false, position: 3000 },
              ],
            },
          },
        ],
      },
    },
  });

  // Card 3: Command Palette
  const card3 = await prisma.card.create({
    data: {
      listId: listTodo.id,
      title: 'Global Command Palette (Cmd + K)',
      description: 'Quick switcher for boards, cards, instant task creation, theme toggling, and keyboard navigation.',
      position: 1000,
      priority: CardPriority.MEDIUM,
      dueDate: new Date(Date.now() + 86400000 * 5),
      coverColor: '#8b5cf6',
      members: { create: [{ userId: sarahUser.id }] },
      labels: { create: [{ labelId: labelFrontend.id }, { labelId: labelDesign.id }] },
    },
  });

  // Card 4: Docker & CI
  const card4 = await prisma.card.create({
    data: {
      listId: listTodo.id,
      title: 'Multi-stage Docker Compose orchestration',
      description: 'Configure production-ready Docker containers for PostgreSQL, NestJS API, and Next.js frontend with health checks.',
      position: 2000,
      priority: CardPriority.MEDIUM,
      dueDate: new Date(Date.now() + 86400000 * 7),
      members: { create: [{ userId: jordanUser.id }] },
      labels: { create: [{ labelId: labelDevOps.id }] },
    },
  });

  // Card 5: Auth & Security
  const card5 = await prisma.card.create({
    data: {
      listId: listDone.id,
      title: 'Secure JWT Auth with Refresh Token Rotation',
      description: 'Complete authentication system with bcrypt password hashing, HttpOnly refresh cookies, and RBAC guards.',
      position: 1000,
      priority: CardPriority.HIGH,
      isCompleted: true,
      coverColor: '#059669',
      members: { create: [{ userId: demoUser.id }] },
      labels: { create: [{ labelId: labelBackend.id }] },
    },
  });

  console.log('🃏 Created Demo Cards with Checklists, Labels & Comments');

  // 8. Create Activity Logs
  await prisma.activity.createMany({
    data: [
      {
        boardId: sprintBoard.id,
        cardId: card1.id,
        userId: demoUser.id,
        action: ActivityAction.CARD_CREATED,
        metadata: JSON.stringify({ title: card1.title, list: 'In Progress' }),
      },
      {
        boardId: sprintBoard.id,
        cardId: card5.id,
        userId: demoUser.id,
        action: ActivityAction.CARD_MOVED,
        metadata: JSON.stringify({ title: card5.title, fromList: 'Code Review', toList: 'Done ✨' }),
      },
      {
        boardId: sprintBoard.id,
        userId: sarahUser.id,
        action: ActivityAction.MEMBER_INVITED,
        metadata: JSON.stringify({ memberEmail: 'jordan@trello.dev' }),
      },
    ],
  });

  // 9. Create Notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: demoUser.id,
        actorId: sarahUser.id,
        type: NotificationType.COMMENT_MENTION,
        title: 'New comment from Sarah',
        message: 'Sarah commented on "Implement smooth multi-column drag and drop"',
        link: `/boards/${sprintBoard.id}?cardId=${card1.id}`,
      },
      {
        userId: demoUser.id,
        actorId: jordanUser.id,
        type: NotificationType.CARD_ASSIGNED,
        title: 'Assigned to Card',
        message: 'Jordan assigned you to "Real-time WebSocket synchronization & presence"',
        link: `/boards/${sprintBoard.id}?cardId=${card2.id}`,
      },
    ],
  });

  console.log('✅ Database seeded successfully!');
  console.log('👉 Demo login: demo@trello.dev / Password123!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
