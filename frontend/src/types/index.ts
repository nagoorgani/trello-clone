export type WorkspaceRole = 'OWNER' | 'ADMIN' | 'MEMBER' | 'GUEST';
export type BoardRole = 'ADMIN' | 'NORMAL' | 'OBSERVER';
export type CardPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string | null;
  bio?: string | null;
  isEmailVerified?: boolean;
}

export interface WorkspaceMember {
  id: string;
  workspaceId: string;
  userId: string;
  role: WorkspaceRole;
  user: User;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  logoUrl?: string | null;
  ownerId: string;
  createdAt: string;
  members?: WorkspaceMember[];
  boards?: Board[];
}

export interface BoardMember {
  id: string;
  boardId: string;
  userId: string;
  role: BoardRole;
  user: User;
}

export interface BoardStar {
  id: string;
  boardId: string;
  userId: string;
}

export interface Label {
  id: string;
  boardId: string;
  name: string;
  color: string;
}

export interface CardLabel {
  id: string;
  cardId: string;
  labelId: string;
  label: Label;
}

export interface ChecklistItem {
  id: string;
  checklistId: string;
  title: string;
  isCompleted: boolean;
  position: number;
  dueDate?: string | null;
}

export interface Checklist {
  id: string;
  cardId: string;
  title: string;
  position: number;
  items: ChecklistItem[];
}

export interface Comment {
  id: string;
  cardId: string;
  userId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  user: User;
}

export interface Attachment {
  id: string;
  cardId: string;
  userId: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  createdAt: string;
}

export interface Activity {
  id: string;
  workspaceId?: string | null;
  boardId?: string | null;
  cardId?: string | null;
  userId: string;
  action: string;
  metadata?: any;
  createdAt: string;
  user?: User;
}

export interface CardMember {
  id: string;
  cardId: string;
  userId: string;
  user: User;
}

export interface Card {
  id: string;
  listId: string;
  list?: {
    id: string;
    title: string;
    board?: any;
  };
  title: string;
  description?: string | null;
  position: number;
  dueDate?: string | null;
  isCompleted?: boolean;
  isArchived?: boolean;
  coverColor?: string | null;
  coverImage?: string | null;
  priority: CardPriority;
  createdAt: string;
  updatedAt: string;
  members?: CardMember[];
  labels?: CardLabel[];
  checklists?: Checklist[];
  comments?: Comment[];
  attachments?: Attachment[];
  activities?: Activity[];
  _count?: {
    comments: number;
    attachments: number;
  };
}

export interface List {
  id: string;
  boardId: string;
  title: string;
  position: number;
  isArchived?: boolean;
  cards: Card[];
}

export interface Board {
  id: string;
  workspaceId: string;
  title: string;
  description?: string | null;
  backgroundType: string;
  backgroundValue: string;
  isPublic: boolean;
  isArchived: boolean;
  position: number;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  isStarred?: boolean;
  workspace?: {
    id: string;
    name: string;
    slug: string;
  };
  members?: BoardMember[];
  stars?: BoardStar[];
  labels?: Label[];
  lists?: List[];
}

export interface Notification {
  id: string;
  userId: string;
  actorId?: string | null;
  type: string;
  title: string;
  message: string;
  link?: string | null;
  isRead: boolean;
  createdAt: string;
  actor?: User | null;
}
