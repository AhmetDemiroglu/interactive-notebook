export default {
  getAllNotes: state => {
    return [...state.notes].sort((a, b) => {
      if (a.order !== undefined && b.order !== undefined) {
        return a.order - b.order
      }
      return a.createdAt - b.createdAt
    })
  },

  getActiveNote: state => state.activeNote,

  getNotesByFolder: state => folderId => {
    return state.notes.filter(note => note.folderId === folderId)
  },

  getFilteredNotes: state => {
    return state.filteredNotes
  },

  // ... diğer getters
} 