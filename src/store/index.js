import { createStore } from 'vuex'
import folders from './modules/folders/index'
import notes from './modules/notes/index'
import ui from './modules/ui/index'

const store = createStore({
  state: {
    isLoading: false,
    error: null
  },

  mutations: {
    SET_LOADING(state, value) {
      state.isLoading = value
    },
    SET_ERROR(state, error) {
      state.error = error
    },
    CLEAR_ERROR(state) {
      state.error = null
    }
  },

  getters: {
    isLoading: state => state.isLoading,
    error: state => state.error
  },

  modules: {
    folders,
    notes,
    ui
  }
})

export default store 