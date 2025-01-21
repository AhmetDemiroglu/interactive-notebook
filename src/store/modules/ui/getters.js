export default {
  isSidebarOpen: state => state.sidebarOpen,
  
  activeModal: state => state.activeModal,
  
  searchQuery: state => state.searchQuery,
  
  currentTheme: state => state.theme,
  
  isModuleLoading: state => module => state.loading[module],
  
  moduleError: state => module => state.errors[module],
  
  hasAnyError: state => Object.values(state.errors).some(error => error !== null)
} 