<template>
  <div class="note-view p-3 p-md-4">
    <div class="loading" v-if="isLoading">
      <div class="lds-ripple">
        <div></div>
        <div></div>
      </div>
    </div>

    <div v-else>
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h4 class="mb-0">{{ note?.title }}</h4>
        <div class="btn-group">
          <button 
            class="btn btn-outline-secondary" 
            @click="savePDF"
            title="PDF Olarak Kaydet"
          >
            <i class="bi bi-file-pdf"></i>
          </button>
          <button 
            class="btn btn-outline-secondary" 
            @click="printNote"
            title="Yazdır"
          >
            <i class="bi bi-printer"></i>
          </button>
          <button 
            class="btn btn-outline-primary" 
            @click="editNote"
            title="Düzenle"
          >
            <i class="bi bi-pencil"></i>
          </button>
          <button 
            class="btn btn-outline-danger" 
            @click="confirmDeleteNote"
            title="Sil"
          >
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </div>

      <div class="d-flex justify-content-between align-items-start mb-4">
        <div class="me-3">
          <i class="bi bi-calendar me-1"></i>
          {{ formatDate(note?.createdAt) }}
        </div>
        <div class="me-3" v-if="note?.folderId">
          <i class="bi bi-folder me-1"></i>
          {{ getFolderName(note?.folderId) }}
        </div>
        <div v-if="note?.updatedAt && note?.updatedAt !== note?.createdAt">
          <i class="bi bi-clock-history me-1"></i>
          Son güncelleme: {{ formatDate(note?.updatedAt) }}
        </div>
      </div>

      <div class="note-content" v-html="note?.content"></div>
    </div>

    <div class="modal" v-if="showDeleteModal">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Not Sil</h5>
            <button type="button" class="btn-close" @click="showDeleteModal = false"></button>
          </div>
          <div class="modal-body">
            <p>
              <strong>"{{ note?.title }}"</strong> notunu silmek istediğinizden emin misiniz?
            </p>
            <div class="alert alert-warning">
              <i class="bi bi-exclamation-triangle me-2"></i>
              Bu işlem geri alınamaz.
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="showDeleteModal = false">
              İptal
            </button>
            <button type="button" class="btn btn-danger" @click="deleteNote">
              Sil
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRoute, useRouter } from 'vue-router'
import html2pdf from 'html2pdf.js'

const store = useStore()
const route = useRoute()
const router = useRouter()
const isLoading = ref(false)
const showDeleteModal = ref(false)

const note = computed(() => store.getters['notes/getActiveNote'])
const folders = computed(() => store.getters['folders/getAllFolders'])

const getFolderName = (folderId) => {
  const folder = folders.value.find(f => f.id === folderId)
  return folder ? folder.name : ''
}

const formatDate = (timestamp) => {
  if (!timestamp) return ''
  return new Date(timestamp).toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const editNote = () => {
  router.push(`/note/${note.value.id}/edit`)
}

const savePDF = () => {
  const element = document.createElement('div')
  element.innerHTML = `
    <h1>${note.value.title}</h1>
    <hr>
    ${note.value.content}
  `
  
  const opt = {
    margin: 1,
    filename: `${note.value.title}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
  }
  
  html2pdf().set(opt).from(element).save()
}

const printNote = () => {
  const printWindow = window.open('', '_blank')
  printWindow.document.write(`
    <html>
      <head>
        <title>${note.value.title}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { margin-bottom: 20px; }
        </style>
      </head>
      <body>
        <h1>${note.value.title}</h1>
        <hr>
        ${note.value.content}
      </body>
    </html>
  `)
  printWindow.document.close()
  printWindow.print()
}

const confirmDeleteNote = () => {
  showDeleteModal.value = true
}

const deleteNote = async () => {
  try {
    await store.dispatch('notes/deleteNote', note.value.id)
    showDeleteModal.value = false
    router.push('/')
  } catch (error) {
    console.error('Not silinirken hata:', error)
  }
}

onMounted(async () => {
  try {
    isLoading.value = true
    await store.dispatch('notes/fetchNote', route.params.id)
  } catch (error) {
    console.error('Not yüklenirken hata:', error)
    router.push('/')
  } finally {
    isLoading.value = false
  }
})
</script>

<style scoped>
.note-view {
  height: 100%;
  background-color: white;
}

.note-content {
  font-size: 1.1rem;
  line-height: 1.6;
}

@media print {
  .note-view {
    padding: 2cm !important;
  }
}

.modal {
  display: block;
  background-color: rgba(0, 0, 0, 0.5);
}

.btn-group .btn {
  padding: 0.375rem 0.75rem;
}

.btn-group .btn i {
  font-size: 1rem;
}

.btn-outline-secondary:hover {
  background-color: #6c757d;
  color: white;
}
</style> 