import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CommunicationState, Conversation, Message, Notification } from '@types/communication.types';

const initialState: CommunicationState = {
  conversations: [],
  selectedConversation: null,
  messages: [],
  notifications: [],
  isLoading: false,
  error: null,
  unreadCount: 0,
};

export const communicationSlice = createSlice({
  name: 'communication',
  initialState,
  reducers: {
    setConversations: (state, action: PayloadAction<Conversation[]>) => {
      state.conversations = action.payload;
      state.unreadCount = action.payload.reduce(
        (sum, conv) => sum + conv.unreadCount,
        0
      );
    },
    setSelectedConversation: (
      state,
      action: PayloadAction<Conversation | null>
    ) => {
      state.selectedConversation = action.payload;
    },
    setMessages: (state, action: PayloadAction<Message[]>) => {
      state.messages = action.payload;
    },
    addMessage: (state, action: PayloadAction<Message>) => {
      state.messages.push(action.payload);
    },
    setNotifications: (state, action: PayloadAction<Notification[]>) => {
      state.notifications = action.payload;
    },
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications.unshift(action.payload);
      if (!action.payload.isRead) {
        state.unreadCount += 1;
      }
    },
    markNotificationAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(
        (n) => n.id === action.payload
      );
      if (notification && !notification.isRead) {
        notification.isRead = true;
        state.unreadCount -= 1;
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setConversations,
  setSelectedConversation,
  setMessages,
  addMessage,
  setNotifications,
  addNotification,
  markNotificationAsRead,
  setLoading,
  setError,
} = communicationSlice.actions;
export default communicationSlice.reducer;
