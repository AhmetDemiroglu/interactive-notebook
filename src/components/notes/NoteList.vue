<template>
  <div class="note-list">
    <!-- Loading Overlay -->
    <div class="loading" v-if="isLoading">
      <div class="lds-ripple">
        <div></div>
        <div></div>
      </div>
    </div>

    <!-- Üst bar ve notlar grid'i -->
    <div class="container-fluid px-0">
      <!-- Üst bar -->
      <div class="row g-2 mb-3 mx-0 justify-content-end">
        <div class="col-12 col-md-6 col-lg-5 col-xl-4">
          <div class="search-box w-100">
            <div class="input-group">
              <span class="input-group-text border-end-0">
                <i class="bi bi-search"></i>
              </span>
              <input 
                type="text" 
                class="form-control border-start-0"
                placeholder="Notlarda ara..."
                v-model="searchQuery"
              >
              <button 
                v-if="searchQuery" 
                class="btn btn-outline-secondary" 
                @click="searchQuery = ''"
              >
                <i class="bi bi-x"></i>
              </button>
            </div>
          </div>
        </div>
        <div class="col-12 col-md-2">
          <button class="btn btn-primary w-100" @click="showNewNoteModal = true">
            <i class="bi bi-plus-lg me-2"></i>
            Yeni Not
          </button>
        </div>
      </div>

      <!-- Notlar grid'i -->
      <draggable
        v-model="filteredNotes"
        :group="'notes'"
        item-key="id"
        :class="{'row g-2 mx-0': !isMobile, 'mobile-note-list': isMobile}"
        @end="onDragEnd"
        :data-folder-id="activeFolder"
        ghost-class="ghost-card"
        drag-class="dragging-card"
        :handle="isMobile ? '.drag-handle-mobile' : undefined"
      >
        <template #item="{ element: note }">
          <div class="col-12" :key="note.id">
            <div 
              class="card note-card"
              :class="{ 
                active: activeNote?.id === note.id,
                highlighted: route.query.highlight === note.id,
                'is-dragging': isDragging === note.id
              }"
              :data-note-id="note.id"
              draggable="true"
              @dragstart="handleNoteDragStart($event, note)"
              @dragend="handleNoteDragEnd"
            >
              <!-- Mobil için drag handle -->
              <div 
                v-if="isMobile"
                class="drag-handle-mobile"
                @mousedown="startDrag"
                @touchstart="startDrag"
              >
                <i class="bi bi-grip-vertical"></i>
              </div>

              <div class="card-body p-2">
                <div class="d-flex justify-content-between align-items-center">
                  <h6 class="card-title mb-1 text-truncate" @click="selectNote(note)">
                    {{ note.title }}
                  </h6>
                  <div class="d-flex align-items-center">
                    <span v-if="note.folderId" class="badge bg-secondary me-2">
                      {{ getFolderName(note.folderId) }}
                    </span>
                    <div class="btn-group btn-group-sm">
                      <!-- Mobil için taşıma butonu -->
                      <button 
                        v-if="isMobile"
                        class="btn btn-outline-secondary btn-sm"
                        @click.stop="showMoveNoteModal(note)"
                        title="Taşı"
                      >
                        <i class="bi bi-folder-symlink"></i>
                      </button>
                      <button 
                        class="btn btn-outline-primary btn-sm"
                        @click.stop="editNote(note)"
                        title="Düzenle"
                      >
                        <i class="bi bi-pencil"></i>
                      </button>
                      <button 
                        class="btn btn-outline-danger btn-sm"
                        @click.stop="confirmDeleteNote(note)"
                        title="Sil"
                      >
                        <i class="bi bi-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>
                <p class="card-text text-muted small mb-1">
                  {{ formatDate(note.createdAt) }}
                </p>
                <p class="card-text note-content small mb-0" @click="selectNote(note)">
                  {{ getSafeContent(note.content) }}
                </p>
              </div>
            </div>
          </div>
        </template>
      </draggable>
    </div>

    <div class="modal" v-if="showNewNoteModal">
      <div class="modal-dialog modal-fullscreen-sm-down modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Yeni Not</h5>
            <button type="button" class="btn-close" @click="showNewNoteModal = false"></button>
          </div>
          <div class="modal-body" style="max-height: 70vh; overflow-y: auto;">
            <div class="mb-3">
              <label class="form-label">Başlık</label>
              <input 
                type="text" 
                class="form-control" 
                v-model="newNote.title" 
                placeholder="Not başlığı"
              >
            </div>
            <div class="mb-3">
              <label class="form-label">İçerik</label>
              <editor
                v-model="newNote.content"
                :api-key="apiKey"
                :init="{
                  height: 200,
                  menubar: 'file edit view insert format tools table help',
                  plugins: [
                    'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                    'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                    'insertdatetime', 'media', 'table', 'help', 'wordcount'
                  ],
                  toolbar: [
                    'undo redo | formatselect | bold italic backcolor | ',
                    'alignleft aligncenter alignright alignjustify | ',
                    'bullist numlist outdent indent | removeformat | help'
                  ].join(''),
                  content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
                  statusbar: true,
                  resize: true,
                  branding: false,
                  promotion: false,
                  language: 'tr',
                  paste_data_images: true,
                  convert_urls: false,
                  relative_urls: false,
                  remove_script_host: false,
                  setup: function (editor) {
                    editor.on('init', function () {
                      editor.getContainer().style.transition = 'border-color 0.15s ease-in-out'
                    })
                  }
                }"
              />
            </div>
            <div class="mb-3">
              <label class="form-label">Klasör</label>
              <select 
                class="form-select"
                v-model="newNote.folderId"
              >
                <option value="">Klasör Seçin</option>
                <option value="all">Tüm Notlar</option>
                <option 
                  v-for="folder in folders" 
                  :key="folder.id" 
                  :value="folder.id"
                >
                  {{ folder.name }}
                </option>
              </select>
            </div>
          </div>
          <div class="modal-footer">
            <button 
              type="button" 
              class="btn btn-secondary" 
              @click="showNewNoteModal = false"
            >
              İptal
            </button>
            <button 
              type="button" 
              class="btn btn-primary" 
              @click="createNote"
            >
              Oluştur
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Not Silme Modal -->
    <div class="modal mt-5" v-if="showDeleteNoteModal">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Not Sil</h5>
            <button 
              type="button" 
              class="btn-close" 
              @click="showDeleteNoteModal = false"
            ></button>
          </div>
          <div class="modal-body">
            <p>
              <strong>"{{ noteToDelete?.title }}"</strong> notunu silmek istediğinizden emin misiniz?
            </p>
            <div class="alert alert-warning">
              <i class="bi bi-exclamation-triangle me-2"></i>
              Bu işlem geri alınamaz.
            </div>
          </div>
          <div class="modal-footer">
            <button 
              type="button" 
              class="btn btn-secondary" 
              @click="showDeleteNoteModal = false"
            >
              İptal
            </button>
            <button 
              type="button" 
              class="btn btn-danger" 
              @click="deleteNote"
            >
              Sil
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Not Taşıma Modal -->
    <div class="modal mt-5" v-if="showMoveModal">
      <div class="modal-dialog modal-move">
        <div class="modal-content">
          <div class="modal-header py-2">
            <h6 class="modal-title mb-0">Notu Taşı</h6>
            <button 
              type="button" 
              class="btn-close"
              @click="showMoveModal = false"
            ></button>
          </div>
          <div class="modal-body py-3">
            <select 
              class="form-select"
              v-model="selectedFolderId"
            >
              <option value="">Klasör Seçiniz</option>
              <option value="all">Tüm Notlar</option>
              <option 
                v-for="folder in folders" 
                :key="folder.id" 
                :value="folder.id"
              >
                {{ folder.name }}
              </option>
            </select>
          </div>
          <div class="modal-footer py-2">
            <button 
              type="button" 
              class="btn btn-sm btn-secondary" 
              @click="showMoveModal = false"
            >
              İptal
            </button>
            <button 
              type="button" 
              class="btn btn-sm btn-primary" 
              @click="moveNote"
            >
              Taşı
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Yeni Klasör Modal -->
    <div class="modal" v-if="showNewFolderModal">
      <div class="modal-dialog modal-sm">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Yeni Klasör</h5>
            <button 
              type="button" 
              class="btn-close" 
              @click="showNewFolderModal = false"
            ></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label">Klasör Adı</label>
              <input 
                type="text" 
                class="form-control"
                v-model="newFolderName"
                placeholder="Klasör adı girin"
              >
            </div>
          </div>
          <div class="modal-footer">
            <button 
              type="button" 
              class="btn btn-secondary" 
              @click="showNewFolderModal = false"
            >
              İptal
            </button>
            <button 
              type="button" 
              class="btn btn-primary" 
              @click="createNewFolder"
            >
              Oluştur
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, watch, onUnmounted } from 'vue';
import { useStore } from 'vuex';
import { useRouter, useRoute } from 'vue-router';
import draggable from 'vuedraggable';
import Editor from '@tinymce/tinymce-vue';

const store = useStore();
const router = useRouter();
const route = useRoute();

// Modal state'i (tek bir yerde tanımla)
const showNewNoteModal = ref(false);
const showNewFolderModal = ref(false);

const newNote = ref({
  title: '',
  content: '',
  folderId: ''
});
const newFolderName = ref('');

// Store'dan verileri al
const notes = computed(() => store.getters['notes/getAllNotes']);
const activeNote = computed(() => store.getters['notes/getActiveNote']);
const activeFolder = computed(() => store.getters['folders/getActiveFolder']);
const folders = computed(() => store.getters['folders/getAllFolders']);

const searchQuery = ref('');

const isDragging = ref(null);

// Filtrelenmiş notlar
const filteredNotes = computed({
  get: () => {
    let notes = activeFolder.value
      ? store.getters['notes/getNotesByFolder'](activeFolder.value)
      : store.getters['notes/getAllNotes'];
    
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase();
      notes = notes.filter(note => 
        note.title.toLowerCase().includes(query) || 
        note.content.toLowerCase().includes(query)
      );
    }
    
    return [...notes].sort((a, b) => (a.order || 0) - (b.order || 0));
  },
  set: async (value) => {
    if (!Array.isArray(value) || value.length === 0) return;
    
    try {
      isLoading.value = true;
      const updatedNotes = value.map((note, index) => ({
        ...note,
        order: index,
        updatedAt: Date.now()
      }));

      await store.dispatch('notes/updateNotesOrder', updatedNotes);
    } catch (error) {
      console.error('Notların sırası güncellenirken hata:', error);
    } finally {
      isLoading.value = false;
    }
  }
});

// Klasör adını bul
const getFolderName = (folderId) => {
  const folder = folders.value.find((f) => f.id === folderId);
  return folder ? folder.name : '';
};

// Not seçme ve yönlendirme
const selectNote = (note) => {
  store.commit('notes/SET_ACTIVE_NOTE', note);
  router.push(`/note/${note.id}`);
};

// Sürükleme başlatma kontrolü güncellendi
const startDrag = (event) => {
  if (!isMobile.value) return;
  
  const noteCard = event.target.closest('.note-card');
  if (event.target.closest('.drag-handle-mobile')) {
    noteCard.setAttribute('draggable', 'true');
    
    // Sürükleme sırasında pointer-events'i geçici olarak aktif et
    noteCard.style.pointerEvents = 'auto';
    
    // Sürükleme başlangıcında veriyi set et
    const noteId = noteCard.dataset.noteId;
    const note = notes.value.find(n => n.id === noteId);
    if (note) {
      event.dataTransfer.setData('noteId', note.id);
      event.dataTransfer.setData('type', 'note');
      event.dataTransfer.effectAllowed = 'move';
    }
    
    const cleanup = () => {
      noteCard.setAttribute('draggable', 'false');
      noteCard.style.pointerEvents = '';
      noteCard.removeEventListener('dragend', cleanup);
    };
    
    noteCard.addEventListener('dragend', cleanup);
  }
};

// onDragEnd fonksiyonu güncellendi
const onDragEnd = async (evt) => {
  if (!evt.item || !evt.to) return;
  
  const targetFolderId = evt.to.dataset.folderId;
  const sourceFolder = evt.from.dataset.folderId;
  const noteId = evt.item.dataset.noteId;
  
  if (!noteId || targetFolderId === sourceFolder) return;

  try {
    isLoading.value = true;
    
    // Önce klasör değişikliğini yap
    await store.dispatch('notes/updateNoteFolder', {
      noteId,
      folderId: targetFolderId === 'all' ? null : targetFolderId
    });
    
    // Sonra sıralamayı güncelle
    const updatedNotes = filteredNotes.value.map((note, index) => ({
      ...note,
      order: index
    }));
    
    await store.dispatch('notes/updateNotesOrder', updatedNotes);
  } catch (error) {
    console.error('Not güncellenirken hata:', error);
  } finally {
    isLoading.value = false;
  }
};

// Yeni not oluşturma
const createNote = async () => {
  if (newNote.value.title.trim() && newNote.value.content.trim()) {
    try {
      isLoading.value = true
      await store.dispatch('notes/createNote', {
        ...newNote.value,
        folderId: newNote.value.folderId || null,
        createdAt: Date.now(),
        order: notes.value.length
      })
      
      newNote.value = { title: '', content: '', folderId: '' }
      showNewNoteModal.value = false
    } catch (error) {
      console.error('Not oluşturulurken hata:', error)
    } finally {
      isLoading.value = false
    }
  }
}

// Tarih formatlama
const formatDate = (timestamp) => {
  return new Date(timestamp).toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// Modal açıldığında aktif klasörü otomatik seç
watch(showNewNoteModal, (isOpen) => {
  if (isOpen) {
    // Modal açıldığında aktif klasörü seç
    newNote.value.folderId = activeFolder.value || '';
  }
});

// Klasör adını getir
const getSelectedFolderName = computed(() => {
  if (!newNote.value.folderId) return 'Klasör seçin';
  const folder = folders.value.find(f => f.id === newNote.value.folderId);
  return folder ? folder.name : 'Klasör seçin';
});

// Not sürükleme başladığında
const handleNoteDragStart = (event, note) => {
  isDragging.value = note.id;
  event.dataTransfer.setData('noteId', note.id);
  event.dataTransfer.setData('type', 'note');
  event.dataTransfer.effectAllowed = 'move';
};

const handleNoteDragEnd = () => {
  isDragging.value = null;
};

// Not kartında HTML içeriği güvenli bir şekilde göster
const getSafeContent = (content) => {
  if (!content) return '';
  // İçeriği kısalt ve HTML etiketlerini kaldır
  return content.replace(/<[^>]*>/g, '').substring(0, 200) + '...';
};

// TinyMCE API key
const apiKey = 'tur3bvltmbvaypzojxmg9hevhhh96xy40ntwggl0c6839llb'

// Silme modalı için state
const showDeleteNoteModal = ref(false);
const noteToDelete = ref(null);

// Not silme onayı modalını göster
const confirmDeleteNote = (note) => {
  noteToDelete.value = note;
  showDeleteNoteModal.value = true;
};

// Not silme işlemi
const deleteNote = async () => {
  if (noteToDelete.value) {
    try {
      isLoading.value = true
      await store.dispatch('notes/deleteNote', noteToDelete.value.id)
      showDeleteNoteModal.value = false
      noteToDelete.value = null
    } catch (error) {
      console.error('Not silinirken hata:', error)
    } finally {
      isLoading.value = false
    }
  }
};

// Not düzenleme işlemi
const editNote = (note) => {
  store.commit('notes/SET_ACTIVE_NOTE', note);
  router.push(`/note/${note.id}/edit`);
};

const isLoading = ref(false)

// Mobil kontrolü
const isMobile = computed(() => {
  return window.innerWidth <= 768;
});

const showMoveModal = ref(false);
const selectedFolderId = ref('');
const noteToMove = ref(null);

const showMoveNoteModal = (note) => {
  noteToMove.value = note;
  selectedFolderId.value = note.folderId || '';
  showMoveModal.value = true;
};

const moveNote = async () => {
  if (!noteToMove.value) return;
  
  try {
    isLoading.value = true;
    await store.dispatch('notes/updateNoteFolder', {
      noteId: noteToMove.value.id,
      folderId: selectedFolderId.value === 'all' ? null : selectedFolderId.value
    });
    showMoveModal.value = false;
  } catch (error) {
    console.error('Not taşınırken hata:', error);
  } finally {
    isLoading.value = false;
  }
};

const createNewFolder = async () => {
  if (!newFolderName.value.trim()) return;
  
  try {
    const folderId = await store.dispatch('folders/createFolder', {
      name: newFolderName.value.trim()
    });
    
    // Yeni oluşturulan klasörü seç
    newNote.value.folderId = folderId;
    
    // Modal'ı kapat ve input'u temizle
    showNewFolderModal.value = false;
    newFolderName.value = '';
  } catch (error) {
    console.error('Klasör oluşturulurken hata:', error);
  }
};
</script>

<style scoped>
.note-list {
  padding: 20px;
  overflow-y: auto;
  height: 100%;
}

.note-card {
  position: relative;
  cursor: grab;
  transition: all 0.3s ease;
  border: 1px solid #dee2e6;
}

.note-card:active {
  cursor: grabbing;
}

.note-content {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  height: 4.5em;
}

/* Modal arkaplanı için */
.modal {
  display: block;
  background-color: rgba(0, 0, 0, 0.5);
}

.drag-handle {
  cursor: grab;
  color: #6c757d;
}

.drag-handle:hover {
  color: #0d6efd;
}

.ghost-card {
  opacity: 0.5;
  background: #f8f9fa;
  border: 2px dashed #dee2e6;
}

.dragging-card {
  cursor: grabbing;
  transform: rotate(2deg);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.input-group-text {
  background-color: white;
  border-right: none;
}

.form-control:focus + .input-group-text {
  border-color: #86b7fe;
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
}

.search-box .form-control {
  border-left: none;
}

.search-box .form-control:focus {
  border-color: #dee2e6;
  box-shadow: none;
}

/* TinyMCE editör stilleri */
:deep(.tox-tinymce) {
  border-radius: 0.375rem;
  border: 1px solid #dee2e6;
}

:deep(.tox-statusbar) {
  border-top: 1px solid #dee2e6 !important;
}

:deep(.tox-editor-container) {
  background: white;
}

:deep(.tox-toolbar__primary) {
  background: none !important;
}

/* Modal stilleri */
.modal-body {
  scrollbar-width: thin;
  scrollbar-color: #dee2e6 #fff;
}

.modal-body::-webkit-scrollbar {
  width: 8px;
}

.modal-body::-webkit-scrollbar-track {
  background: #fff;
}

.modal-body::-webkit-scrollbar-thumb {
  background-color: #dee2e6;
  border-radius: 4px;
  border: 2px solid #fff;
}

.btn-group .btn {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
}

.btn-group .btn:hover {
  z-index: 1;
}

.note-card .btn-group {
  opacity: 0;
  transition: opacity 0.2s ease;
}

.note-card:hover .btn-group {
  opacity: 1;
}

.note-card.highlighted {
  animation: highlight 2s ease-out;
}

@keyframes highlight {
  0% {
    background-color: #fff3cd;
    transform: scale(1.02);
  }
  100% {
    background-color: white;
    transform: scale(1);
  }
}

.note-card.is-dragging {
  opacity: 0.5;
  transform: scale(1.02);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

@media (max-width: 768px) {
  .mobile-note-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 8px;
  }

  .note-card {
    width: 100%;
    margin: 0;
  }

  .col-12 {
    width: 100%;
    padding: 0;
  }

  .note-list {
    padding: 8px;
  }

  .search-box {
    width: 100%;
  }

  .col-12.col-md-4.col-lg-3.col-xl-2 {
    width: 100%;
  }

  .note-card {
    margin-bottom: 8px;
    pointer-events: auto !important;
    user-select: none;
  }

  .note-content {
    height: auto;
    max-height: none;
    font-size: 0.875rem;
    display: block;
    overflow: visible;
    white-space: pre-wrap;
    margin-bottom: 0.5rem;
  }

  .card-body {
    padding: 0.75rem;
    display: flex;
    flex-direction: column;
  }

  .note-card {
    margin-bottom: 8px;
    height: auto;
  }

  .card-title {
    font-size: 1rem;
    margin-right: 8px;
    flex: 1;
    line-height: 1.2;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .btn-group-sm .btn {
    padding: 0.25rem 0.4rem;
    font-size: 0.75rem;
  }

  .btn-group-sm .btn i {
    font-size: 0.875rem;
  }

  .badge {
    font-size: 0.7rem;
  }

  /* Container düzenlemeleri */
  .container-fluid {
    padding-left: 8px;
    padding-right: 8px;
  }

  .row {
    margin-left: -4px;
    margin-right: -4px;
  }

  .col-12 {
    padding-left: 4px;
    padding-right: 4px;
  }

  /* Modal düzenlemeleri */
  .modal-dialog.modal-fullscreen-sm-down {
    margin: 0;
    max-height: 100vh;
  }

  .modal-content {
    border-radius: 0;
    min-height: 100vh;
  }

  /* Arama kutusu düzenlemeleri */
  .search-box {
    margin-bottom: 8px;
  }

  .input-group {
    width: 100%;
  }

  .note-card .btn-group {
    opacity: 1; /* Her zaman görünür */
  }

  /* Mobil için drag handle stili */
  .drag-handle-mobile {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f8f9fa;
    border-right: 1px solid #dee2e6;
    border-radius: 4px 0 0 4px;
    cursor: grab;
    pointer-events: auto;
  }

  .drag-handle-mobile:active {
    cursor: grabbing;
    background: #e9ecef;
  }

  /* Mobilde kart içeriğine padding ekle */
  .card-body {
    padding-left: 32px !important;
  }
  
  /* Drag handle dışında sürüklemeyi devre dışı bırak */
  .note-card {
    pointer-events: none;
  }

  /* Butonlar için tıklama olaylarını aktif et */
  .btn-group {
    pointer-events: auto;
  }

  /* Butonlar için özel stil */
  .btn-group {
    z-index: 2;
  }
}

/* Tablet ve Desktop için düzenleme */
@media (min-width: 769px) {
  .note-list {
    padding: 20px;
  }

  .row {
    width: 100%;
    margin: 0;
  }

  .search-box {
    width: 100%;
  }

  .col-12 {
    flex: 0 0 50%;
    max-width: 50%;
  }

  .note-card .btn-group {
    opacity: 0;
    transition: opacity 0.2s ease;
  }

  .note-card:hover .btn-group {
    opacity: 1;
  }

  .note-content {
    display: -webkit-box;
    display: box;
    -webkit-box-orient: vertical;
    box-orient: vertical;
    -webkit-line-clamp: 4;
    line-clamp: 4;
    overflow: hidden;
    height: 6em;
    line-height: 1.5;
  }

  .card-body {
    padding: 1rem;
  }
}

/* Desktop için düzenleme */
@media (min-width: 992px) {
  .col-12 {
    flex: 0 0 33.333333%;
    max-width: 33.333333%;
  }
}

/* Geniş ekranlar için düzenleme */
@media (min-width: 1200px) {
  .col-12 {
    flex: 0 0 25%;
    max-width: 25%;
  }
}

/* Modal stilleri güncellendi */
.modal-move {
  max-width: 400px;
  margin: 1.75rem auto;
}

@media (max-width: 768px) {
  .modal-move {
    max-width: 90%;
    margin: 3rem auto;
  }
  
  .modal-content {
    min-height: auto;
  }
  
  .modal-header, 
  .modal-footer {
    padding: 0.75rem 1rem;
  }
  
  .modal-body {
    padding: 1rem;
  }
}
</style>