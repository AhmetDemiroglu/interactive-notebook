export default {
  SET_SIDEBAR_OPEN(state, value) {
    state.sidebarOpen = value
  },

  SET_ACTIVE_MODAL(state, modalName) {
    state.activeModal = modalName
  },

  SET_SEARCH_QUERY(state, query) {
    state.searchQuery = query
  },

  SET_THEME(state, theme) {
    state.theme = theme
    localStorage.setItem('theme', theme)
  },

  SET_MODULE_LOADING(state, { module, value }) {
    state.loading[module] = value
  },

  SET_MODULE_ERROR(state, { module, error }) {
    state.errors[module] = error
  },

  CLEAR_MODULE_ERROR(state, module) {
    state.errors[module] = null
  }
} 