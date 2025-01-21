export default {
  toggleSidebar({ commit, state }) {
    commit('SET_SIDEBAR_OPEN', !state.sidebarOpen)
  },

  showModal({ commit }, modalName) {
    commit('SET_ACTIVE_MODAL', modalName)
  },

  hideModal({ commit }) {
    commit('SET_ACTIVE_MODAL', null)
  },

  updateSearchQuery({ commit }, query) {
    commit('SET_SEARCH_QUERY', query)
  },

  toggleTheme({ commit, state }) {
    const newTheme = state.theme === 'light' ? 'dark' : 'light'
    commit('SET_THEME', newTheme)
  },

  setLoading({ commit }, { module, value }) {
    commit('SET_MODULE_LOADING', { module, value })
  },

  setError({ commit }, { module, error }) {
    commit('SET_MODULE_ERROR', { module, error })
  },

  clearError({ commit }, module) {
    commit('CLEAR_MODULE_ERROR', module)
  }
} 