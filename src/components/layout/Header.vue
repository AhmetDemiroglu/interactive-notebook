<template>
  <header class="app-header">
    <nav class="navbar navbar-expand-lg navbar-light bg-white border-bottom">
      <div class="container-fluid">
        <!-- Logo ve Başlık -->
        <div 
          class="navbar-brand d-flex align-items-center logo-container"
          @click="goHome"
        >
          <img 
            src="../../assets/mindvault-logo.png" 
            alt="MindVault Logo" 
            class="logo me-2"
          >
          <img
            src="../../assets/mindvault.png" 
            alt="MindVault" 
            class="logo me-2"
          >
        </div>
      </div>
    </nav>
  </header>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';

const router = useRouter();
const store = useStore();

const goHome = () => {
  // Aktif klasörü temizle
  store.commit('folders/SET_ACTIVE_FOLDER', null);
  // Ana sayfaya yönlendir
  router.push('/');
};
</script>

<style scoped>
.app-header {
  background-color: white;
  border-bottom: 1px solid #dee2e6;
}

.navbar {
  padding: 0.5rem 1rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.04);
  min-height: 48px; /* Sabit yükseklik ekledik */
}

.logo {
  height: 40px;
  width: auto;
}

@media (max-width: 768px) {
  .app-header {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1030;
  }

  .navbar {
    padding: 0.25rem 0.5rem;
    min-height: 48px; /* Mobilde sabit yükseklik */
  }

  .logo {
    height: 40px; /* 32px'ten 40px'e çıkardık - desktop ile aynı boyut */
  }

  .navbar-brand {
    margin-left: 40px; /* Menü butonu için yer açtık */
  }
}

@media print {
  .app-header {
    display: none;
  }
}

.logo-container {
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.logo-container:hover {
  opacity: 0.8;
}

.logo {
  height: 32px;
  width: auto;
}
</style> 