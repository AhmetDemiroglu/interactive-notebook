import { api } from '../../../services/api'

export default {
  async fetchFolders({ commit }) {
    try {
      commit('SET_LOADING', true, { root: true })
      const folders = await api.getFolders()
      commit('SET_FOLDERS', folders)
    } catch (error) {
      commit('SET_ERROR', error.message, { root: true })
    } finally {
      commit('SET_LOADING', false, { root: true })
    }
  },

  async createFolder({ commit }, folderData) {
    try {
      commit('SET_LOADING', true, { root: true })
      const folderId = await api.createFolder(folderData)
      const folder = { ...folderData, id: folderId }
      commit('ADD_FOLDER', folder)
      return folderId
    } catch (error) {
      commit('SET_ERROR', error.message, { root: true })
      throw error
    } finally {
      commit('SET_LOADING', false, { root: true })
    }
  },

  async updateFolder({ commit }, { id, name }) {
    try {
      commit('SET_LOADING', true, { root: true })
      await api.updateFolder(id, { name })
      commit('UPDATE_FOLDER', { id, name })
    } catch (error) {
      commit('SET_ERROR', error.message, { root: true })
      throw error
    } finally {
      commit('SET_LOADING', false, { root: true })
    }
  },

  async deleteFolder({ commit }, folderId) {
    try {
      commit('SET_LOADING', true, { root: true })
      await api.deleteFolder(folderId)
      commit('DELETE_FOLDER', folderId)
    } catch (error) {
      commit('SET_ERROR', error.message, { root: true })
      throw error
    } finally {
      commit('SET_LOADING', false, { root: true })
    }
  },

  async updateFolderOrder({ commit }, folders) {
    try {
      commit('SET_LOADING', true, { root: true })
      const updatedFolders = folders.map((folder, index) => ({
        ...folder,
        order: index,
        updatedAt: Date.now()
      }))
      await api.updateFolderOrder(updatedFolders)
      commit('UPDATE_FOLDER_ORDER', updatedFolders)
    } catch (error) {
      commit('SET_ERROR', error.message, { root: true })
    } finally {
      commit('SET_LOADING', false, { root: true })
    }
  }
} 