<template>
  <div class="note-view p-3 p-md-4">
    <div class="loading" v-if="isLoading">
      <div class="lds-ripple">
        <div></div>
        <div></div>
      </div>
    </div>

    <div v-else>
      <div class="d-flex justify-content-between align-items-start mb-4">
        <h1 class="mb-0">{{ note?.title }}</h1>
        <button 
          class="btn btn-primary"
          @click="editNote"
        >
          <i class="bi bi-pencil me-2"></i>
          Düzenle
        </button>
      </div>

      <div class="d-flex align-items-center text-muted mb-4">
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRoute, useRouter } from 'vue-router'

const store = useStore()
const route = useRoute()
const router = useRouter()
const isLoading = ref(false)

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
</style> 