export default {
  SET_FOLDERS(state, folders) {
    if (folders) {
      state.folders = Object.keys(folders).map(key => ({
        ...folders[key],
        id: key,
        order: folders[key].order || 0
      }))
    } else {
      state.folders = []
    }
  },

  SET_ACTIVE_FOLDER(state, folder) {
    state.activeFolder = folder
  },

  ADD_FOLDER(state, folder) {
    state.folders.push(folder)
  },

  UPDATE_FOLDER(state, { id, name }) {
    const folder = state.folders.find(f => f.id === id)
    if (folder) {
      folder.name = name
    }
  },

  DELETE_FOLDER(state, folderId) {
    state.folders = state.folders.filter(folder => folder.id !== folderId)
  },

  UPDATE_FOLDER_ORDER(state, folders) {
    folders.forEach(updatedFolder => {
      const index = state.folders.findIndex(f => f.id === updatedFolder.id)
      if (index !== -1) {
        state.folders[index] = {
          ...state.folders[index],
          order: updatedFolder.order,
          updatedAt: updatedFolder.updatedAt
        }
      }
    })
  }
} 