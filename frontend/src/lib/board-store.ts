import { create } from 'zustand';
import { Board, Card, List } from '@/types';
import { api } from './api';

interface BoardState {
  board: Board | null;
  isLoading: boolean;
  searchQuery: string;
  filterLabels: string[];
  filterMembers: string[];
  filterPriority: string | null;

  setBoard: (board: Board | null) => void;
  setLoading: (isLoading: boolean) => void;
  setSearchQuery: (query: string) => void;
  setFilterLabels: (labels: string[]) => void;
  setFilterMembers: (members: string[]) => void;
  setFilterPriority: (priority: string | null) => void;
  clearFilters: () => void;

  fetchBoard: (boardId: string) => Promise<Board>;
  optimisticMoveCard: (
    cardId: string,
    sourceListId: string,
    targetListId: string,
    sourceIndex: number,
    targetIndex: number,
    newPosition: number
  ) => void;
  optimisticReorderList: (
    sourceIndex: number,
    targetIndex: number,
    newPosition: number
  ) => void;
  addList: (title: string) => Promise<void>;
  updateListTitle: (listId: string, title: string) => Promise<void>;
  deleteList: (listId: string) => Promise<void>;
  addCard: (listId: string, title: string) => Promise<Card>;
  updateCardLocally: (updatedCard: Partial<Card> & { id: string }) => void;
  deleteCardLocally: (cardId: string) => void;
}

export const useBoardStore = create<BoardState>((set, get) => ({
  board: null,
  isLoading: false,
  searchQuery: '',
  filterLabels: [],
  filterMembers: [],
  filterPriority: null,

  setBoard: (board) => set({ board }),
  setLoading: (isLoading) => set({ isLoading }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setFilterLabels: (filterLabels) => set({ filterLabels }),
  setFilterMembers: (filterMembers) => set({ filterMembers }),
  setFilterPriority: (filterPriority) => set({ filterPriority }),
  clearFilters: () => set({ searchQuery: '', filterLabels: [], filterMembers: [], filterPriority: null }),

  fetchBoard: async (boardId: string) => {
    set({ isLoading: true });
    try {
      const data = (await api.get(`/boards/${boardId}`)) as Board;
      set({ board: data, isLoading: false });
      return data;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  optimisticMoveCard: (
    cardId,
    sourceListId,
    targetListId,
    sourceIndex,
    targetIndex,
    newPosition
  ) => {
    const currentBoard = get().board;
    if (!currentBoard || !currentBoard.lists) return;

    const lists = [...currentBoard.lists];
    const sourceList = lists.find((l) => l.id === sourceListId);
    const targetList = lists.find((l) => l.id === targetListId);

    if (!sourceList || !targetList) return;

    const sourceCards = [...sourceList.cards];
    const [movedCard] = sourceCards.splice(sourceIndex, 1);

    if (!movedCard) return;

    movedCard.listId = targetListId;
    movedCard.position = newPosition;

    if (sourceListId === targetListId) {
      sourceCards.splice(targetIndex, 0, movedCard);
      sourceList.cards = sourceCards;
    } else {
      const targetCards = [...targetList.cards];
      targetCards.splice(targetIndex, 0, movedCard);
      sourceList.cards = sourceCards;
      targetList.cards = targetCards;
    }

    set({ board: { ...currentBoard, lists } });

    // Sync to backend asynchronously
    api.patch(`/cards/${cardId}/move`, {
      targetListId,
      position: newPosition,
    }).catch((err) => {
      console.error('Failed to persist card move on server:', err);
    });
  },

  optimisticReorderList: (sourceIndex, targetIndex, newPosition) => {
    const currentBoard = get().board;
    if (!currentBoard || !currentBoard.lists) return;

    const lists = [...currentBoard.lists];
    const [movedList] = lists.splice(sourceIndex, 1);
    if (!movedList) return;

    movedList.position = newPosition;
    lists.splice(targetIndex, 0, movedList);

    set({ board: { ...currentBoard, lists } });

    api.patch(`/lists/${movedList.id}/reorder`, {
      position: newPosition,
    }).catch((err) => {
      console.error('Failed to persist list reorder on server:', err);
    });
  },

  addList: async (title: string) => {
    const currentBoard = get().board;
    if (!currentBoard) return;

    const newList = (await api.post('/lists', {
      boardId: currentBoard.id,
      title,
    })) as List;

    newList.cards = [];

    set({
      board: {
        ...currentBoard,
        lists: [...(currentBoard.lists || []), newList],
      },
    });
  },

  updateListTitle: async (listId: string, title: string) => {
    const currentBoard = get().board;
    if (!currentBoard || !currentBoard.lists) return;

    set({
      board: {
        ...currentBoard,
        lists: currentBoard.lists.map((l) =>
          l.id === listId ? { ...l, title } : l
        ),
      },
    });

    await api.patch(`/lists/${listId}`, { title });
  },

  deleteList: async (listId: string) => {
    const currentBoard = get().board;
    if (!currentBoard || !currentBoard.lists) return;

    set({
      board: {
        ...currentBoard,
        lists: currentBoard.lists.filter((l) => l.id !== listId),
      },
    });

    await api.delete(`/lists/${listId}`);
  },

  addCard: async (listId: string, title: string) => {
    const currentBoard = get().board;
    if (!currentBoard) throw new Error('No active board');

    const newCard = (await api.post('/cards', {
      listId,
      title,
    })) as Card;

    const lists = (currentBoard.lists || []).map((list) => {
      if (list.id === listId) {
        return {
          ...list,
          cards: [...list.cards, newCard],
        };
      }
      return list;
    });

    set({ board: { ...currentBoard, lists } });
    return newCard;
  },

  updateCardLocally: (updatedCard) => {
    const currentBoard = get().board;
    if (!currentBoard || !currentBoard.lists) return;

    const lists = currentBoard.lists.map((list) => ({
      ...list,
      cards: list.cards.map((card) =>
        card.id === updatedCard.id ? ({ ...card, ...updatedCard } as Card) : card
      ),
    }));

    set({ board: { ...currentBoard, lists } });
  },

  deleteCardLocally: (cardId: string) => {
    const currentBoard = get().board;
    if (!currentBoard || !currentBoard.lists) return;

    const lists = currentBoard.lists.map((list) => ({
      ...list,
      cards: list.cards.filter((card) => card.id !== cardId),
    }));

    set({ board: { ...currentBoard, lists } });
  },
}));
