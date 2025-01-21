export default {
  SET_NOTES(state, notes) {
    if (notes) {
      state.notes = Object.keys(notes).map(key => ({
        ...notes[key],
        id: key,
        order: notes[key].order || 0
      }))
    } else {
      state.notes = []
    }
  },
  SET_ACTIVE_NOTE(state, note) {
    state.activeNote = note
  },
  ADD_NOTE(state, note) {
    state.notes.push(note)
  },
  UPDATE_NOTE(state, updatedNote) {
    const index = state.notes.findIndex(note => note.id === updatedNote.id)
    if (index !== -1) {
      state.notes = [
        ...state.notes.slice(0, index),
        updatedNote,
        ...state.notes.slice(index + 1)
      ]
    }
  },
  DELETE_NOTE(state, noteId) {
    state.notes = state.notes.filter(note => note.id !== noteId)
  },
  UPDATE_NOTE_ORDER(state, notes) {
    notes.forEach(updatedNote => {
      const index = state.notes.findIndex(n => n.id === updatedNote.id)
      if (index !== -1) {
        state.notes[index] = {
          ...state.notes[index],
          order: updatedNote.order,
          updatedAt: updatedNote.updatedAt
        }
      }
    })
  },
  UPDATE_NOTES_ORDER(state, notes) {
    state.notes = notes
  }
} 