<template>
  <div class="note-folder">
    <div class="folder-header mb-4">
      <div class="d-flex justify-content-between align-items-center">
        <h2>
          <i class="bi bi-folder me-2"></i>
          {{ folder?.name || 'Tüm Notlar' }}
        </h2>
        <div class="folder-actions">
          <button 
            class="btn btn-outline-secondary me-2"
            @click="renameFolder"
            v-if="folder"
          >
            <i class="bi bi-pencil me-1"></i>
            Klasörü Yeniden Adlandır
          </button>
          <button 
            class="btn btn-primary"
            @click="showNewNoteModal = true"
          >
            <i class="bi bi-plus-lg me-1"></i>
            Yeni Not
          </button>
        </div>
      </div>
      <p class="text-muted mt-2">
        {{ notes.length }} not
      </p>
    </div>

    <div class="folder-content">
      <NoteList 
        :notes="notes" 
        :folder-id="folderId"
        :is-draggable="isDraggable"
        @touch-start="handleTouchStart"
        @touch-end="handleTouchEnd"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useStore } from 'vuex'
import { useRoute, useRouter } from 'vue-router'
import { useMediaQuery } from '@vueuse/core'
import NoteList from './NoteList.vue'

const store = useStore()
const route = useRoute()
const router = useRouter()

const folderId = computed(() => route.params.folder)
const folder = computed(() => 
  folderId.value ? store.getters['folders/getFolderById'](folderId.value) : null
)

const notes = computed(() => 
  folderId.value 
    ? store.getters['notes/getNotesByFolder'](folderId.value)
    : store.getters['notes/getAllNotes']
)

const showNewNoteModal = ref(false)

// Mobil kontrolleri
const isMobile = useMediaQuery('(max-width: 768px)')
const isLongPress = ref(false)
const isDraggable = computed(() => !isMobile.value || isLongPress.value)
let longPressTimer = null

const handleTouchStart = () => {
  if (!isMobile.value) return
  
  longPressTimer = setTimeout(() => {
    isLongPress.value = true
  }, 500)
}

const handleTouchEnd = () => {
  if (longPressTimer) {
    clearTimeout(longPressTimer)
  }
  isLongPress.value = false
}

const renameFolder = () => {
  // Klasör yeniden adlandırma modalını göster
}
</script>

<style scoped>
.note-folder {
  padding: 20px;
}

.folder-header {
  border-bottom: 1px solid #dee2e6;
}

@media (max-width: 768px) {
  .folder-header {
    flex-direction: column;
    gap: 1rem;
  }
  
  .folder-actions {
    width: 100%;
    display: flex;
    gap: 0.5rem;
  }
  
  .folder-actions .btn {
    flex: 1;
  }
}
</style> 