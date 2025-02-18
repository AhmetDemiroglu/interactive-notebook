<template>
  <div class="sidebar bg-light">
    <div class="p-3">
      <div class="search-box mb-3">
        <div class="input-group">
          <span class="input-group-text">
            <i class="bi bi-search"></i>
          </span>
          <input 
            type="text" 
            class="form-control" 
            placeholder="Klasörlerde ara..."
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

      <div class="mb-3">
        <button 
          class="btn btn-primary w-100 d-flex align-items-center justify-content-center"
          @click="showNewNoteModal = true"
        >
          <i class="bi bi-plus-lg me-2"></i>
          Yeni Not
        </button>
      </div>

      <div class="all-notes mb-3">
        <div 
          class="d-flex align-items-center justify-content-between p-2 folder-item"
          :class="{ active: activeFolder === null }"
          data-folder-id="all"
          @click="goToAllNotes"
          @dragover.prevent
          @drop="handleDrop($event, null)"
        >
          <div class="d-flex align-items-center">
            <i class="bi bi-journal-text me-2"></i>
            <span>Tüm Notlar</span>
          </div>
          <span class="badge bg-secondary">{{ totalNotes }}</span>
        </div>
      </div>

      <div class="folders">
        <div class="d-flex justify-content-between align-items-center mb-2">
          <h6 class="mb-0">Klasörler</h6>
          <button 
            class="btn btn-sm btn-primary" 
            @click="showNewFolderModal = true"
          >
            <i class="bi bi-plus"></i>
          </button>
        </div>

        <draggable 
          v-model="draggableFolders" 
          item-key="id"
          group="folders-only"
          :handle="isMobile ? '.folder-drag-handle' : undefined"
          @end="onDragEnd"
          ghost-class="ghost-folder"
          drag-class="dragging-folder"
          :data-type="'folder'"
        >
          <template #item="{ element }">
            <div 
              v-if="!searchQuery || element.name.toLowerCase().includes(searchQuery.toLowerCase())"
              :key="element.id"  
              class="d-flex justify-content-between align-items-center p-2 folder-item"
              :class="{ 
                active: activeFolder === element.id,
                'drag-over': isDragOver === element.id
              }"
              :data-folder-id="element.id"
              :data-type="'folder'"
              draggable="true"
              @dragover.prevent
              @dragenter.prevent="handleDragEnter($event, element.id)"
              @dragleave.prevent="handleDragLeave($event, element.id)"
              @drop="handleDrop($event, element.id)"
            >
              <!-- Mobil için drag handle -->
              <div 
                v-if="isMobile"
                class="folder-drag-handle"
                @mousedown="startDrag"
                @touchstart="startDrag"
              >
                <i class="bi bi-grip-vertical"></i>
              </div>

              <!-- Folder içeriği -->
              <div class="folder-content d-flex align-items-center justify-content-between w-100">
                <div class="d-flex align-items-center" @click="selectFolder(element.id)">
                  <i class="bi bi-folder me-2"></i>
                  <span class="folder-name">{{ element.name }}</span>
                  <span class="badge bg-secondary ms-2">{{ getFolderNoteCount(element.id) }}</span>
                </div>
                <div class="folder-actions">
                  <button 
                    class="btn btn-sm btn-outline-primary me-1"
                    @click.stop="editFolder(element)"
                    title="Düzenle"
                  >
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button 
                    class="btn btn-sm btn-outline-danger"
                    @click.stop="confirmDeleteFolder(element)"
                    title="Sil"
                  >
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          </template>
        </draggable>
      </div>
    </div>

    <div class="modal mt-5" v-if="showNewFolderModal">
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

    <div class="modal mt-5" v-if="showNewNoteModal">
      <div class="modal-dialog modal-lg">
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
                    'advlist',
                    'autolink',
                    'lists',
                    'link',
                    'image',
                    'charmap',
                    'preview',
                    'anchor',
                    'searchreplace',
                    'visualblocks',
                    'code',
                    'fullscreen',
                    'insertdatetime',
                    'media',
                    'table',
                    'code',
                    'help',
                    'wordcount',
                    'save',
                    'emoticons',
                    'codesample'
                  ],
                  toolbar: [
                    'undo redo | blocks | bold italic backcolor | alignleft aligncenter alignright alignjustify |',
                    'bullist numlist outdent indent | removeformat | help | code | codesample'
                  ].join(''),
                  content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
                  statusbar: true,
                  resize: true,
                  branding: false,
                  promotion: false,
                  language: 'tr',
                  paste_data_images: true,
                  paste_as_text: false,
                  convert_urls: false,
                  relative_urls: false,
                  remove_script_host: false,
                  extended_valid_elements: 'script[language|type|src]',
                  valid_children: '+body[style]',
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
              <div class="input-group">
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

    <div class="modal mt-5" v-if="showDeleteFolderModal">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Klasör Sil</h5>
            <button 
              type="button" 
              class="btn-close" 
              @click="showDeleteFolderModal = false"
            ></button>
          </div>
          <div class="modal-body">
            <p>
              <strong>"{{ folderToDelete?.name }}"</strong> klasörünü silmek istediğinizden emin misiniz?
            </p>
            <div class="alert alert-warning">
              <i class="bi bi-exclamation-triangle me-2"></i>
              Bu işlem geri alınamaz ve klasördeki tüm notlar "Tüm Notlar" klasörüne taşınacaktır.
            </div>
          </div>
          <div class="modal-footer">
            <button 
              type="button" 
              class="btn btn-secondary" 
              @click="showDeleteFolderModal = false"
            >
              İptal
            </button>
            <button 
              type="button" 
              class="btn btn-danger" 
              @click="deleteFolder"
            >
              Sil
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Klasör Düzenleme Modalı -->
    <div class="modal" v-if="showEditFolderModal" @click="showEditFolderModal = false">
      <div class="modal-dialog" @click.stop>
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Klasörü Düzenle</h5>
            <button class="btn-close" @click="showEditFolderModal = false"></button>
          </div>
          <div class="modal-body">
            <input 
              type="text" 
              class="form-control" 
              v-model="editingFolder.name"
              placeholder="Klasör adı"
              @keyup.enter="updateFolder"
            >
          </div>
          <div class="modal-footer">
            <button 
              class="btn btn-secondary" 
              @click="showEditFolderModal = false"
            >
              İptal
            </button>
            <button 
              class="btn btn-primary" 
              @click="updateFolder"
            >
              Kaydet
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
            <div class="input-group">
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
              <button 
                class="btn btn-outline-secondary" 
                type="button"
                @click="showNewFolderModal = true"
              >
                <i class="bi bi-plus-lg"></i>
              </button>
            </div>
          </div>
          <!-- ... diğer modal içeriği ... -->
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useStore } from 'vuex';
import draggable from 'vuedraggable';
import { useRouter, useRoute } from 'vue-router';
import Editor from '@tinymce/tinymce-vue';

const store = useStore();
const router = useRouter();
const route = useRoute();
const searchQuery = ref('');
const showNewFolderModal = ref(false);
const newFolderName = ref('');
const showNewNoteModal = ref(false);
const newNote = ref({
  title: '',
  content: '',
  folderId: ''
});

// Store'dan verileri al
const folders = computed(() => store.getters['folders/getAllFolders']);

// Draggable için ayrı bir computed property
const draggableFolders = computed({
  get: () => folders.value,
  set: async (value) => {
    try {
      // Tüm klasör verilerini koru, sadece order'ı güncelle
      const updates = value.map((folder, index) => ({
        ...folder, // Tüm klasör verilerini koru
        order: index,
        updatedAt: Date.now()
      }));

      // Store'u güncelle
      store.commit('folders/UPDATE_FOLDER_ORDER', updates);
      
      // Firebase'i güncelle
      await store.dispatch('folders/updateFolderOrder', updates);
    } catch (error) {
      console.error('Klasör sıralaması güncellenirken hata:', error);
    }
  }
});

const activeFolder = computed(() => store.getters['folders/getActiveFolder']);

// Tüm notlar sayısı (filtrelemeyi kaldırdık)
const totalNotes = computed(() => store.getters['notes/getAllNotes'].length);

// Filtrelenmiş klasörler
const filteredFolders = computed(() => {
  if (!searchQuery.value) return folders.value;
  
  const query = searchQuery.value.toLowerCase();
  return folders.value.filter(folder => 
    folder.name.toLowerCase().includes(query)
  );
});

// Klasör içindeki not sayısını hesapla
const getFolderNoteCount = (folderId) => {
  return store.getters['notes/getNotesByFolder'](folderId).length;
};

// Klasör seçme
const selectFolder = async (folderId) => {
  try {
    // Aktif klasörü güncelle
    store.commit('folders/SET_ACTIVE_FOLDER', folderId)
    
    // Direkt olarak ilgili klasöre git
    await router.push({
      name: 'home',
      params: { folder: folderId || 'all' }
    })
  } catch (error) {
    console.error('Klasör seçilirken hata:', error)
  }
}

// Yeni klasör oluşturma
const createNewFolder = async () => {
  if (!newFolderName.value.trim()) return;
  
  try {
    const folderId = await store.dispatch('folders/createFolder', {
      name: newFolderName.value.trim()
    });
    
    // Yeni oluşturulan klasörü seç
    selectedFolderId.value = folderId;
    
    // Modal'ı kapat ve input'u temizle
    showNewFolderModal.value = false;
    newFolderName.value = '';
  } catch (error) {
    console.error('Klasör oluşturulurken hata:', error);
  }
};

// Silme modalı için state
const showDeleteFolderModal = ref(false);
const folderToDelete = ref(null);

// Klasör silme onayı modalını göster
const confirmDeleteFolder = (folder) => {
  folderToDelete.value = folder;
  showDeleteFolderModal.value = true;
};

// Klasör silme işlemi
const deleteFolder = async () => {
  if (folderToDelete.value) {
    try {
      await store.dispatch('folders/deleteFolder', folderToDelete.value.id);
      showDeleteFolderModal.value = false;
      folderToDelete.value = null;
    } catch (error) {
      console.error('Klasör silinirken hata:', error);
    }
  }
};

// Sürükle-bırak sonrası
const onDragEnd = async (evt) => {
  if (evt.from !== evt.to || evt.from.dataset.type !== 'folder') return;
  
  try {
    await store.dispatch('folders/updateFolderOrder', draggableFolders.value);
  } catch (error) {
    console.error('Klasör sırası güncellenirken hata:', error);
  }
};

// Tüm notlara git
const goToAllNotes = async () => {
  try {
    store.commit('folders/SET_ACTIVE_FOLDER', null)
    
    // Direkt olarak tüm notlara git
    await router.push({ 
      name: 'home', 
      params: { folder: 'all' } 
    })
  } catch (error) {
    console.error('Tüm notlara giderken hata:', error)
  }
}

// Not oluşturma fonksiyonu
const createNote = async () => {
  if (newNote.value.title.trim() && newNote.value.content.trim()) {
    try {
      await store.dispatch('notes/createNote', {
        ...newNote.value,
        folderId: newNote.value.folderId || null,
        createdAt: Date.now(),
        order: store.getters['notes/getAllNotes'].length
      });
      
      // Formu temizle ve modalı kapat
      newNote.value = {
        title: '',
        content: '',
        folderId: ''
      };
      showNewNoteModal.value = false;
    } catch (error) {
      console.error('Not oluşturulurken hata:', error);
    }
  }
};

// Arama yapıldığında ana sayfaya yönlendirmeyi kaldırdık
watch(searchQuery, (newValue) => {
  // Artık sadece klasör araması yapılacak
});

// Not bırakma işlemi
const handleDrop = async (event, targetFolderId) => {
  event.preventDefault();
  
  // Sürüklenen öğenin tipini kontrol et
  const sourceType = event.dataTransfer.getData('type');
  if (sourceType !== 'note') return;
  
  // Sürüklenen notun ID'sini al
  const noteId = event.dataTransfer.getData('noteId');
  if (!noteId) return;

  try {
    // Notu yeni klasöre taşı
    await store.dispatch('notes/updateNoteFolder', {
      noteId,
      folderId: targetFolderId
    });
  } catch (error) {
    console.error('Not taşınırken hata:', error);
  }
};

// TinyMCE API key
const apiKey = 'tur3bvltmbvaypzojxmg9hevhhh96xy40ntwggl0c6839llb';

// Klasör adını getir
const getSelectedFolderName = computed(() => {
  if (!newNote.value.folderId) return 'Klasör seçin';
  const folder = folders.value.find(f => f.id === newNote.value.folderId);
  return folder ? folder.name : 'Klasör seçin';
});

// Modal açıldığında aktif klasörü otomatik seç
watch(showNewNoteModal, (isOpen) => {
  if (isOpen) {
    newNote.value.folderId = activeFolder.value || '';
  }
});

const showEditFolderModal = ref(false)
const editingFolder = ref({ id: null, name: '' })

const editFolder = (folder) => {
  editingFolder.value = { ...folder }
  showEditFolderModal.value = true
}

const updateFolder = async () => {
  if (editingFolder.value.name.trim()) {
    try {
      await store.dispatch('folders/updateFolder', {
        id: editingFolder.value.id,
        name: editingFolder.value.name.trim()
      })
      showEditFolderModal.value = false
    } catch (error) {
      console.error('Klasör güncellenirken hata:', error)
    }
  }
}

const isDragOver = ref(null);

const handleDragEnter = (event, folderId) => {
  event.preventDefault();
  isDragOver.value = folderId;
};

const handleDragLeave = (event, folderId) => {
  event.preventDefault();
  if (isDragOver.value === folderId) {
    isDragOver.value = null;
  }
};

// Mobil kontrolü
const isMobile = computed(() => {
  return window.innerWidth <= 768;
});

// Sürükleme başlatma kontrolü
const startDrag = (event) => {
  if (!isMobile.value) return;
  
  const folderItem = event.target.closest('.folder-item');
  if (event.target.closest('.folder-drag-handle')) {
    folderItem.setAttribute('draggable', 'true');
    // Sürükleme sırasında pointer-events'i geçici olarak aktif et
    folderItem.style.pointerEvents = 'auto';
    
    const cleanup = () => {
      folderItem.setAttribute('draggable', 'false');
      folderItem.style.pointerEvents = '';
      folderItem.removeEventListener('dragend', cleanup);
    };
    
    folderItem.addEventListener('dragend', cleanup);
  }
};

const showMoveModal = ref(false);
const selectedFolderId = ref('');
</script>

<style scoped>
.sidebar {
  height: 100vh;
  width: 280px;
  border-right: 1px solid #dee2e6;
}

.folder-item {
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.folder-item:hover {
  background-color: #e9ecef;
}

.folder-item.active {
  background-color: #0d47a1;
  color: white;
}

.folder-item.active:hover {
  background-color: #1565c0;
}

.folder-item.active .btn-outline-primary {
  color: #fff;
  border-color: #fff;
  background-color: transparent;
}

.folder-item.active .btn-outline-primary:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.folder-item.active .btn-outline-danger {
  color: #fff;
  border-color: #fff;
  background-color: transparent;
}

.folder-item.active .btn-outline-danger:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.folder-item.drag-over {
  background-color: #e9ecef;
  border: 2px dashed #0d6efd;
}

.folder-item:active {
  cursor: grabbing;
}

.modal {
  display: block;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1100;
}

.modal-dialog {
  margin-top: 2rem;
}

.folder-drag-handle {
  cursor: grab;
  color: #6c757d;
}

.folder-drag-handle:hover {
  color: #0d6efd;
}

.folder-item {
  cursor: default;
}

.ghost-folder {
  opacity: 0.5;
  background: #f8f9fa;
  border: 2px dashed #dee2e6;
}

.dragging-folder {
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

/* TinyMCE editör stilleri */
:deep(.tox-tinymce) {
  border-radius: 0.375rem;
}

:deep(.tox-toolbar__primary) {
  background: none !important;
}

.folder-actions {
  opacity: 0;
  transition: opacity 0.2s ease;
}

.folder-item:hover .folder-actions {
  opacity: 1;
}

@media (max-width: 768px) {
  .folder-actions {
    opacity: 1;
  }

  .folder-item {
    user-select: none;
  }

  .folder-drag-handle {
    cursor: grab;
  }

  .folder-drag-handle:active {
    cursor: grabbing;
  }
}

.folder-content {
  flex: 1;
  padding-left: 8px;
  min-width: 0; /* Taşma kontrolü için */
}

.folder-name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  min-width: 0;
}

.folder-actions {
  flex-shrink: 0; /* Butonların küçülmesini engelle */
  white-space: nowrap; /* Butonları yan yana tut */
}

@media (max-width: 768px) {
  .folder-item {
    display: flex;
    align-items: center;
    padding: 0.5rem;
  }
  
  .folder-drag-handle {
    width: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #6c757d;
    margin-right: 4px;
  }

  .folder-actions {
    opacity: 1;
    margin-left: 8px;
  }
}

/* Tüm Notlar sekmesi için cursor */
.all-notes .folder-item {
  cursor: pointer;
}

/* Klasör öğeleri için cursor */
.folder-content .folder-name,
.folder-content .badge,
.folder-content .bi-folder {
  cursor: pointer;
}

/* Sürükleme durumunda cursor */
.folder-drag-handle {
  cursor: grab;
}

.folder-drag-handle:active {
  cursor: grabbing;
}

/* Butonlar için cursor zaten pointer */

/* Klasör öğesi hover durumu */
.folder-item:hover {
  background-color: #e9ecef;
}

/* Aktif klasör stilleri */
.folder-item.active {
  background-color: #0d47a1;
  color: white;
}
</style>