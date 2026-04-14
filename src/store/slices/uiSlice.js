import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    sidebarCollapsed: false,
    activeModal: null,
    modalData: null,
    notifications: [],
    unreadCount: 0,
  },
  reducers: {
    toggleSidebar:    (state) => { state.sidebarCollapsed = !state.sidebarCollapsed; },
    setSidebar:       (state, action) => { state.sidebarCollapsed = action.payload; },
    openModal:        (state, action) => { state.activeModal = action.payload.modal; state.modalData = action.payload.data || null; },
    closeModal:       (state) => { state.activeModal = null; state.modalData = null; },
    addNotification:  (state, action) => { state.notifications.unshift(action.payload); state.unreadCount++; },
    markAllRead:      (state) => { state.unreadCount = 0; state.notifications.forEach((n) => { n.read = true; }); },
  },
});

export const { toggleSidebar, setSidebar, openModal, closeModal, addNotification, markAllRead } = uiSlice.actions;
export default uiSlice.reducer;
