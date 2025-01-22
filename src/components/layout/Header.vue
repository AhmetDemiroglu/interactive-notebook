<template>
  <header class="app-header">
    <nav class="navbar navbar-expand-lg navbar-light bg-white border-bottom">
      <div class="container-fluid">
        <!-- Logo ve Başlık -->
        <div class="navbar-brand d-flex align-items-center">
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
// Artık ekstra bir şeye ihtiyacımız yok
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
</style> 