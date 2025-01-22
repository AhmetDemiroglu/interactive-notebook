<template>
  <div class="home">
    <!-- Loading Overlay -->
    <div class="loading" v-if="isLoading">
      <div class="lds-ripple">
        <div></div>
        <div></div>
      </div>
    </div>
    <div v-else class="container-xl">
      <div class="d-flex">
        <NoteList />
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, computed } from 'vue'
import { useStore } from 'vuex'
import NoteList from '@/components/notes/NoteList.vue'

const store = useStore()
const isLoading = computed(() => store.getters.isLoading)

onMounted(async () => {
  try {
    store.commit('SET_LOADING', true)
    await store.dispatch('folders/fetchFolders')
    await store.dispatch('notes/initializeNotes')
  } catch (error) {
    console.error('Veriler yüklenirken hata oluştu:', error)
  } finally {
    store.commit('SET_LOADING', false)
  }
})
</script>

<style scoped>
.home {
  height: 100%;
}

/* Geniş ekranlarda maksimum genişlik */
@media (min-width: 1200px) {
  .container-xl {
    max-width: 1400px; 
    margin: 0 auto;
    padding: 0;
  }
}

/* Mobilde tam genişlik */
@media (max-width: 768px) {
  .container-xl {
    width: 100%;
    padding: 0;
  }
}
</style> 