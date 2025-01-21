import { ref, set, get, push, remove, update } from 'firebase/database'
import { db } from './firebase'
import axios from 'axios'

// API Keys
export const TINYMCE_API_KEY = 'tur3bvltmbvaypzojxmg9hevhhh96xy40ntwggl0c6839llb'

export const api = {
  // Notları getir
  async getNotes() {
    try {
      const notesRef = ref(db, 'notes')
      const snapshot = await get(notesRef)
      return snapshot.val() || [] // Boş array dön
    } catch (error) {
      console.error('Notlar getirilirken hata:', error)
      throw error
    }
  },

  // Klasörleri getir
  async getFolders() {
    try {
      const foldersRef = ref(db, 'folders')
      const snapshot = await get(foldersRef)
      const folders = snapshot.val()
      return folders || {} // Boş object dön, mutation'da array'e çevrilecek
    } catch (error) {
      console.error('Klasörler getirilirken hata:', error)
      throw error
    }
  },

  // Yeni not oluştur
  async createNote(note) {
    const notesRef = ref(db, 'notes')
    const newNoteRef = push(notesRef)
    await set(newNoteRef, {
      ...note,
      id: newNoteRef.key,
      createdAt: Date.now()
    })
    return newNoteRef.key
  },

  // Not güncelle
  async updateNote(noteId, note) {
    const noteRef = ref(db, `notes/${noteId}`)
    const updatedNote = {
      ...note,
      folderId: note.folderId || null,  // Klasör ID'si yoksa null
      order: note.order || 0,           // Sıra numarası yoksa 0
      updatedAt: Date.now()
    }
    await update(noteRef, updatedNote)
    return updatedNote
  },

  // Not sil
  async deleteNote(noteId) {
    try {
      const noteRef = ref(db, `notes/${noteId}`);
      await remove(noteRef);
      return true;
    } catch (error) {
      console.error('Not silinirken hata:', error);
      throw error;
    }
  },

  // Yeni klasör oluştur
  async createFolder(folder) {
    const foldersRef = ref(db, 'folders')
    const newFolderRef = push(foldersRef)
    const folderId = newFolderRef.key
    
    const newFolder = {
      ...folder,
      id: folderId,
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
    
    await set(newFolderRef, newFolder)
    return folderId
  },

  // Klasör güncelle
  async updateFolder(id, data) {
    try {
      const folderRef = ref(db, `folders/${id}`)
      await update(folderRef, {
        ...data,
        updatedAt: Date.now()
      })
      return true
    } catch (error) {
      console.error('Klasör güncellenirken hata:', error)
      throw error
    }
  },

  // Klasör sil
  async deleteFolder(folderId) {
    const folderRef = ref(db, `folders/${folderId}`)
    await remove(folderRef)
  },

  // Klasör sıralamasını güncelle
  async updateFolderOrder(folders) {
    try {
      const updates = {}
      folders.forEach(folder => {
        updates[`folders/${folder.id}`] = {
          ...folder,
          updatedAt: Date.now()
        }
      })
      await update(ref(db), updates)
      return folders
    } catch (error) {
      console.error('Klasör sıralaması güncellenirken hata:', error)
      throw error
    }
  },

  // JsonPlaceholder'dan notları çek
  async fetchJsonPlaceholderNotes() {
    try {
      const response = await axios.get('https://jsonplaceholder.typicode.com/comments')
      // 20 adet not çek
      const notes = response.data.slice(0, 20).map((comment, index) => ({
        title: comment.name,
        content: comment.body,
        folderId: null,
        order: index,
        createdAt: Date.now(),
        updatedAt: Date.now()
      }))
      return notes
    } catch (error) {
      throw error
    }
  },

  // Notların daha önce yüklenip yüklenmediğini kontrol et
  async checkNotesLoaded() {
    try {
      const notesRef = ref(db, 'notes')
      const snapshot = await get(notesRef)
      const exists = snapshot.exists()
      return exists
    } catch (error) {
      console.error('Not kontrolü yapılırken hata:', error)
      throw error
    }
  },
  // Not sıralamasını güncelle
  async updateNotesOrder(notes) {
    try {
      const updates = {};
      notes.forEach(note => {
        updates[`notes/${note.id}`] = {
          ...note,
          updatedAt: Date.now()
        };
      });
      await update(ref(db), updates);
      return notes;
    } catch (error) {
      console.error('Notların sırası güncellenirken hata:', error);
      throw error;
    }
  }
}