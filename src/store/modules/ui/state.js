export default {
  sidebarOpen: false,
  activeModal: null,
  searchQuery: '',
  theme: localStorage.getItem('theme') || 'light',
  loading: {
    notes: false,
    folders: false
  },
  errors: {
    notes: null,
    folders: null
  }
} 