<template>
  <header class="app-header">
    <nav class="navbar navbar-expand-lg navbar-light bg-white border-bottom">
      <div class="container-fluid">
        <!-- Logo ve Başlık - Tıklanabilir -->
        <router-link 
          to="/folder/all" 
          class="navbar-brand d-flex align-items-center"
          title="Tüm Notlar"
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
        </router-link>
      </div>
    </nav>
  </header>
</template>

<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()

const goToHome = () => {
  router.push('/folder/all')
}
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

.navbar-brand {
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.navbar-brand:hover {
  opacity: 0.8;
}
</style> 