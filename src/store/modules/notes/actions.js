import { api } from '../../../services/api'

export default {
  async fetchNotes({ commit }) {
    try {
      commit('SET_LOADING', true, { root: true })
      const notes = await api.getNotes()
      commit('SET_NOTES', notes)
    } catch (error) {
      commit('SET_ERROR', error.message, { root: true })
    } finally {
      commit('SET_LOADING', false, { root: true })
    }
  },

  async createNote({ commit }, noteData) {
    try {
      commit('SET_LOADING', true, { root: true })
      const noteId = await api.createNote(noteData)
      const note = { ...noteData, id: noteId }
      commit('ADD_NOTE', note)
      return noteId
    } catch (error) {
      commit('SET_ERROR', error.message, { root: true })
      throw error
    } finally {
      commit('SET_LOADING', false, { root: true })
    }
  },

  async updateNote({ commit }, { id, note }) {
    try {
      commit('SET_LOADING', true, { root: true })
      const updatedNote = await api.updateNote(id, note)
      commit('UPDATE_NOTE', updatedNote)
    } catch (error) {
      commit('SET_ERROR', error.message, { root: true })
      throw error
    } finally {
      commit('SET_LOADING', false, { root: true })
    }
  },

  async deleteNote({ commit }, noteId) {
    try {
      commit('SET_LOADING', true, { root: true })
      await api.deleteNote(noteId)
      commit('DELETE_NOTE', noteId)
    } catch (error) {
      commit('SET_ERROR', error.message, { root: true })
      throw error
    } finally {
      commit('SET_LOADING', false, { root: true })
    }
  },

  async updateNoteOrder({ commit }, notes) {
    try {
      commit('SET_LOADING', true, { root: true })
      await api.updateNoteOrder(notes)
      commit('UPDATE_NOTE_ORDER', notes)
    } catch (error) {
      commit('SET_ERROR', error.message, { root: true })
    } finally {
      commit('SET_LOADING', false, { root: true })
    }
  },

  async initializeNotes({ commit, dispatch }) {
    try {
      commit('SET_LOADING', true, { root: true })
      
      const notesExist = await api.checkNotesLoaded()
      
      if (!notesExist) {
        const sampleNotes = await api.fetchJsonPlaceholderNotes()
        
        for (const note of sampleNotes) {
          await api.createNote(note)
        }
      }
      
      const notes = await api.getNotes()
      commit('SET_NOTES', notes)
      
    } catch (error) {
      commit('SET_ERROR', error.message, { root: true })
    } finally {
      commit('SET_LOADING', false, { root: true })
    }
  },

  async updateNotesOrder({ commit }, notes) {
    try {
      if (!Array.isArray(notes) || notes.length === 0) return;
      
      const validNotes = notes.filter(note => 
        note && note.id && (note.title || note.content)
      );
      
      if (validNotes.length === 0) return;

      await api.updateNotesOrder(validNotes);
      commit('UPDATE_NOTES_ORDER', validNotes);
    } catch (error) {
      console.error('Notların sırası güncellenirken hata:', error);
      throw error;
    }
  },

  async updateNoteFolder({ commit, dispatch }, { noteId, folderId }) {
    try {
      commit('SET_LOADING', true, { root: true })
      const note = await api.updateNote(noteId, { folderId })
      commit('UPDATE_NOTE', note)
      await dispatch('fetchNotes')
    } catch (error) {
      commit('SET_ERROR', error.message, { root: true })
      throw error
    } finally {
      commit('SET_LOADING', false, { root: true })
    }
  }
} 