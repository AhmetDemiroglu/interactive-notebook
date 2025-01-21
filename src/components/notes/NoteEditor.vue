<template>
  <div class="note-editor p-3 p-md-4">
    <!-- Loading Overlay -->
    <div class="loading" v-if="isLoading">
      <div class="lds-ripple">
        <div></div>
        <div></div>
      </div>
    </div>

    <!-- Üst Bar -->
    <div class="row g-2 mb-4 align-items-center">
      <!-- Sol Taraf: Not Başlığı -->
      <div class="col-12 col-md-7">
        <input 
          type="text" 
          class="form-control form-control-lg border-0 bg-transparent"
          v-model="localNote.title"
          placeholder="Not başlığı..."
        >
      </div>
      
      <!-- Sağ Taraf: Butonlar -->
      <div class="col-12 col-md-5">
        <div class="d-flex flex-column flex-md-row justify-content-md-end gap-2">
          <!-- PDF İndir Butonu -->
          <button 
            class="btn btn-outline-secondary"
            @click="downloadPDF"
            title="PDF olarak indir"
          >
            <i class="bi bi-file-earmark-pdf"></i>
            <span class="ms-1 d-none d-md-inline">PDF İndir</span>
          </button>

          <!-- Yazdır Butonu -->
          <button 
            class="btn btn-outline-secondary"
            @click="printNote"
            title="Yazdır"
          >
            <i class="bi bi-printer"></i>
            <span class="ms-1 d-none d-md-inline">Yazdır</span>
          </button>

          <!-- Kaydet Butonu -->
          <button 
            class="btn btn-primary"
            @click="saveAndGoBack"
            title="Değişiklikleri kaydet"
          >
            <i class="bi bi-save"></i>
            <span class="ms-1 d-none d-md-inline">Kaydet</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Not meta bilgileri -->
    <div class="d-flex align-items-center text-muted mb-4">
      <div class="me-3">
        <i class="bi bi-calendar me-1"></i>
        {{ formatDate(localNote.createdAt) }}
      </div>
      <!-- Klasör seçimi butonu -->
      <div class="me-3">
        <button 
          class="btn btn-link text-muted p-0 text-decoration-none folder-select-btn" 
          @click="showFolderModal = true"
        >
          <i class="bi bi-folder me-1"></i>
          {{ getFolderName(localNote.folderId) || 'Klasör Seç' }}
          <i class="bi bi-chevron-down ms-1 small"></i>
        </button>
      </div>
      <div v-if="localNote.updatedAt && localNote.updatedAt !== localNote.createdAt">
        <i class="bi bi-clock-history me-1"></i>
        Son güncelleme: {{ formatDate(localNote.updatedAt) }}
      </div>
    </div>

    <!-- Zengin metin editörü -->
    <editor
      v-model="localNote.content"
      :api-key="apiKey"
      :init="{
        height: 'calc(100vh - 300px)',
        menubar: true,
        plugins: [
          'advlist autolink lists link image charmap preview anchor',
          'searchreplace visualblocks code fullscreen',
          'insertdatetime media table paste code help wordcount'
        ],
        toolbar: 'undo redo | formatselect | ' +
          'bold italic backcolor | alignleft aligncenter ' +
          'alignright alignjustify | bullist numlist outdent indent | ' +
          'removeformat | help',
        content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:16px; max-width: 100%; }',
        statusbar: true,
        resize: true,
        autosave_ask_before_unload: true,
        autosave_interval: '30s',
        autosave_prefix: 'tinymce-autosave-{path}-{id}-',
        autosave_restore_when_empty: true
      }"
      @change="autoSave"
    />

    <!-- Klasör Seçim Modalı -->
    <div class="modal" v-if="showFolderModal">
      <div class="modal-dialog modal-fullscreen-sm-down">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Klasör Seç</h5>
            <button 
              type="button" 
              class="btn-close" 
              @click="cancelFolderSelection"
            ></button>
          </div>
          <div class="modal-body">
            <!-- Yeni Klasör Oluşturma -->
            <div class="mb-3" v-if="showNewFolderInput">
              <div class="input-group">
                <input 
                  type="text" 
                  class="form-control"
                  v-model="newFolderName"
                  placeholder="Klasör adı..."
                  ref="newFolderInput"
                  @keyup.enter="createNewFolder"
                >
                <button 
                  class="btn btn-primary"
                  @click="createNewFolder"
                  :disabled="!newFolderName.trim()"
                >
                  Oluştur
                </button>
                <button 
                  class="btn btn-outline-secondary"
                  @click="cancelNewFolder"
                >
                  İptal
                </button>
              </div>
            </div>

            <div class="list-group">
              <!-- Tüm Notlar seçeneği -->
              <button 
                type="button" 
                class="list-group-item list-group-item-action d-flex align-items-center"
                :class="{ active: tempFolderId === null }"
                @click="selectFolder(null)"
              >
                <i class="bi bi-journal-text me-2"></i>
                Tüm Notlar
              </button>

              <!-- Klasör listesi -->
              <button 
                v-for="folder in folders" 
                :key="folder.id"
                type="button" 
                class="list-group-item list-group-item-action d-flex align-items-center"
                :class="{ active: tempFolderId === folder.id }"
                @click="selectFolder(folder.id)"
              >
                <i class="bi bi-folder me-2"></i>
                {{ folder.name }}
              </button>

              <!-- Yeni Klasör Butonu -->
              <button 
                v-if="!showNewFolderInput"
                type="button" 
                class="list-group-item list-group-item-action d-flex align-items-center text-primary"
                @click="showNewFolderInput = true"
              >
                <i class="bi bi-plus-circle me-2"></i>
                Yeni Klasör
              </button>
            </div>
          </div>
          <div class="modal-footer">
            <button 
              type="button" 
              class="btn btn-primary w-100" 
              @click="saveFolderSelection"
            >
              Kaydet
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue';
import { useStore } from 'vuex';
import { useRoute, useRouter } from 'vue-router';
import Editor from '@tinymce/tinymce-vue';
import debounce from 'lodash/debounce';
import html2pdf from 'html2pdf.js'
import { TINYMCE_API_KEY } from '../../services/api'

const store = useStore();
const route = useRoute();
const router = useRouter();

// TinyMCE API key
const apiKey = TINYMCE_API_KEY;

// Yerel not state'i
const localNote = ref({
  title: '',
  content: '',
  folderId: null,
  createdAt: Date.now(),
  updatedAt: null
});

// Store'dan verileri al
const activeNote = computed(() => store.getters['notes/getActiveNote']);
const folders = computed(() => store.getters['folders/getAllFolders']);

// Not ID'sini route'dan al
const noteId = computed(() => route.params.id);

// Klasör adını getir
const getFolderName = (folderId) => {
  if (!folderId) return null;
  const folder = folders.value.find(f => f.id === folderId);
  return folder ? folder.name : null;
};

// Tarih formatlama
const formatDate = (timestamp) => {
  return new Date(timestamp).toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Otomatik kaydetme (debounce ile)
const autoSave = debounce(async () => {
  try {
    isLoading.value = true
    await store.dispatch('notes/updateNote', {
      id: noteId.value,
      note: {
        ...localNote.value,
        updatedAt: Date.now()
      }
    });
  } catch (error) {
    console.error('Otomatik kaydetme sırasında hata:', error);
  } finally {
    isLoading.value = false
  }
}, 2000);

// Not değiştiğinde store'u güncelle
watch(localNote, (newValue) => {
  if (newValue) {
    store.commit('notes/SET_ACTIVE_NOTE', { ...newValue });
  }
}, { deep: true });

// Component yüklendiğinde ve route değiştiğinde notu getir
watch([noteId, activeNote], async ([newNoteId, newActiveNote]) => {
  if (newNoteId) {
    if (!newActiveNote || newActiveNote.id !== newNoteId) {
      try {
        // Store'dan notu getir
        await store.dispatch('notes/fetchNote', newNoteId);
      } catch (error) {
        console.error('Not yüklenirken hata:', error);
        router.push('/');
      }
    } else {
      // Active note varsa ve ID'ler eşleşiyorsa, local state'i güncelle
      localNote.value = { ...newActiveNote };
    }
  }
}, { immediate: true });

// Active note değiştiğinde yerel state'i güncelle
watch(activeNote, (newNote) => {
  if (newNote) {
    localNote.value = { ...newNote };
  }
});

// Modal state'i
const showFolderModal = ref(false);

// Geçici seçim için state
const tempFolderId = ref(null);

// Modal açıldığında mevcut klasörü geçici state'e kopyala
watch(showFolderModal, (isOpen) => {
  if (isOpen) {
    tempFolderId.value = localNote.value.folderId;
  }
});

// Klasör seçme fonksiyonu (sadece geçici state'i günceller)
const selectFolder = (folderId) => {
  tempFolderId.value = folderId;
};

// Klasör seçimini kaydet
const saveFolderSelection = async () => {
  try {
    // Yerel state'i güncelle
    localNote.value = {
      ...localNote.value,
      folderId: tempFolderId.value,
      updatedAt: Date.now()
    };
    
    // Store'u güncelle
    await store.dispatch('notes/updateNote', {
      id: noteId.value,
      note: localNote.value
    });
  } catch (error) {
    console.error('Klasör güncellenirken hata:', error);
  } finally {
    // Hata olsa da olmasa da modalı kapat
    showFolderModal.value = false;
  }
};

// Klasör seçimini iptal et (sadece X'e tıklandığında)
const cancelFolderSelection = () => {
  showFolderModal.value = false;
  // Yeni klasör formunu temizle
  cancelNewFolder();
};

// Yeni klasör state'leri
const showNewFolderInput = ref(false);
const newFolderName = ref('');
const newFolderInput = ref(null);

// Yeni klasör oluşturma
const createNewFolder = async () => {
  if (newFolderName.value.trim()) {
    try {
      // Yeni klasör oluştur ve ID'sini al
      const folderId = await store.dispatch('folders/createFolder', {
        name: newFolderName.value,
        order: folders.value.length
      });
      
      // Yeni oluşturulan klasörü geçici olarak seç
      tempFolderId.value = folderId;
      
      // Input'u temizle ve gizle
      cancelNewFolder();
    } catch (error) {
      console.error('Klasör oluşturulurken hata:', error);
    }
  }
};

// Yeni klasör iptal
const cancelNewFolder = () => {
  showNewFolderInput.value = false;
  newFolderName.value = '';
};

// Input görünür olduğunda otomatik fokusla
watch(showNewFolderInput, (newValue) => {
  if (newValue) {
    nextTick(() => {
      newFolderInput.value?.focus();
    });
  }
});

// Not kaydetme ve ana sayfaya dönme
const saveAndGoBack = async () => {
  try {
    isLoading.value = true
    await store.dispatch('notes/updateNote', {
      id: noteId.value,
      note: {
        ...localNote.value,
        updatedAt: Date.now()
      }
    });

    const targetFolder = localNote.value.folderId || 'all';
    
    await router.push({
      name: 'home',
      params: { folder: targetFolder },
      query: { highlight: noteId.value }
    });

  } catch (error) {
    console.error('Not kaydedilirken hata:', error);
    alert(`Not kaydedilirken bir hata oluştu: ${error.message}`);
  } finally {
    isLoading.value = false
  }
};

// Yazdırma işlemi
const printNote = () => {
  window.print();
};

// PDF indirme işlemi
const downloadPDF = () => {
  const content = document.querySelector('.note-editor');
  if (!content) return;

  const options = {
    margin: 1,
    filename: `${localNote.value.title || 'not'}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
  };

  html2pdf().set(options).from(content).save();
};

// Bu fonksiyonları dışa aktar
defineExpose({
  saveAndGoBack,
  printNote,
  downloadPDF
});

const isLoading = ref(false)
</script>

<style scoped>
.note-editor {
  height: 100%;
  background-color: white;
}

.form-control-lg {
  font-size: 2rem;
  font-weight: bold;
}

.form-control-lg:focus {
  box-shadow: none;
}

:deep(.tox-tinymce) {
  border: none !important;
  border-top: 1px solid #dee2e6 !important;
}

/* Yazdırma stili */
@media print {
  .note-editor {
    padding: 2cm !important;
  }

  :deep(.tox-tinymce) {
    border: none !important;
  }
}

.folder-select-btn {
  display: inline-flex;
  align-items: center;
  transition: color 0.2s ease;
}

.folder-select-btn:hover {
  color: #0d6efd !important;
}

/* Modal stilleri */
.modal {
  display: block;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1100;
}

.list-group-item {
  cursor: pointer;
}

.list-group-item.active {
  background-color: #0d6efd;
  border-color: #0d6efd;
}

.list-group-item:hover:not(.active) {
  background-color: #f8f9fa;
}

.list-group-item.text-primary:hover {
  background-color: #f8f9fa;
  color: #0a58ca !important;
}

.list-group {
  max-height: 300px;
  overflow-y: auto;
}

.modal-footer {
  border-top: 1px solid #dee2e6;
  padding: 1rem;
}

@media (max-width: 768px) {
  .note-editor {
    padding: 1rem;
  }

  .form-control-lg {
    font-size: 1.25rem; /* Başlık yazı boyutunu küçülttük */
    padding: 0.5rem; /* Padding'i azalttık */
  }

  /* Butonları yatayda düzenle */
  .d-flex.flex-column {
    flex-direction: row !important;
    flex-wrap: wrap;
    gap: 0.5rem !important;
  }

  /* Butonları eşit genişlikte yap */
  .btn {
    flex: 1;
    padding: 0.375rem;
    min-width: 0;
    white-space: nowrap;
  }

  /* İkon dışındaki metinleri gizle */
  .btn span {
    display: none;
  }

  /* İkonları ortala */
  .btn i {
    margin: 0;
  }
}
</style> 