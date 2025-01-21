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
    // Klasöre göre filtreleme
    const filteredNotes = folderId === 'all' 
      ? state.notes.filter(note => !note.folderId)  // Klasörsüz notlar
      : state.notes.filter(note => note.folderId === folderId);  // Klasörlü notlar

    // Sıralama
    return [...filteredNotes].sort((a, b) => {
      if (a.order !== undefined && b.order !== undefined) {
        return a.order - b.order
      }
      return a.createdAt - b.createdAt
    });
  },

  getFilteredNotes: state => {
    return state.filteredNotes
  },

  // ... diğer getters
} 