export default {
  getAllFolders: (state) => {
    return [...state.folders].sort((a, b) => {
      if (a.order !== undefined && b.order !== undefined) {
        return a.order - b.order
      }
      return a.createdAt - b.createdAt
    })
  },

  getActiveFolder: (state) => state.activeFolder,

  getFolderById: (state) => (id) => {
    return state.folders.find(folder => folder.id === id)
  }
} 