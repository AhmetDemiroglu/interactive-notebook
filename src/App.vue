<template>
  <div class="app">
    <!-- Mobil Menü Butonu -->
    <button 
      class="mobile-menu-btn btn btn-light d-md-none"
      @click="toggleSidebar"
    >
      <i class="bi" :class="isSidebarOpen ? 'bi-x-lg' : 'bi-list'"></i>
    </button>

    <!-- Sidebar -->
    <Sidebar 
      class="sidebar" 
      :class="{ 'active': isSidebarOpen }"
    />

    <!-- Sidebar Overlay -->
    <div 
      v-if="isSidebarOpen" 
      class="sidebar-overlay d-md-none"
      @click="toggleSidebar"
    ></div>

    <div class="main-content">
      <Header class="header" />
      <main class="content-area">
        <router-view v-slot="{ Component, route }">
          <transition name="fade" mode="out-in">
            <component 
              :is="Component" 
              :key="route.params.folder || 'all'"
              ref="noteEditorRef" 
            />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, provide } from 'vue'
import Header from './components/layout/Header.vue'
import Sidebar from './components/layout/Sidebar.vue'
import { useStore } from 'vuex'

const noteEditorRef = ref(null)
provide('noteEditorRef', noteEditorRef)

const isSidebarOpen = ref(false)

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}
</script>

<style>
.app {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

.sidebar {
  width: 280px;
  height: 100vh;
  overflow-y: auto;
  border-right: 1px solid #dee2e6;
  background-color: #f8f9fa;
  flex-shrink: 0;
  z-index: 1030;
}

.main-content {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  width: calc(100% - 280px); /* Sidebar genişliğini çıkar */
  min-width: 0; /* Flexbox taşma sorunu için */
}

.header {
  flex-shrink: 0;
}

.content-area {
  flex-grow: 1;
  overflow-y: auto;
  background-color: #f8f9fa;
  padding: 1rem;
  min-width: 0;
  position: relative;
  height: 100%; /* Yükseklik eklendi */
}

/* Mobil Tasarım */
@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
    padding-top: 48px; /* 60px'ten 48px'e düşürdük */
  }

  .content-area {
    padding: 0.5rem;
  }

  .sidebar {
    position: fixed;
    left: -280px;
    transition: left 0.3s ease;
    z-index: 1040;
  }

  .sidebar.active {
    left: 0;
    box-shadow: 2px 0 8px rgba(0,0,0,0.1);
  }

  .sidebar-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0,0,0,0.5);
    z-index: 1035;
  }

  .mobile-menu-btn {
    position: fixed;
    top: 6px; /* 10px'ten 6px'e düşürdük */
    left: 8px; /* 10px'ten 8px'e düşürdük */
    z-index: 1040;
    width: 36px; /* 40px'ten 36px'e düşürdük */
    height: 36px; /* 40px'ten 36px'e düşürdük */
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
  }
}

/* Fade transition efektleri */
.fade-enter-active,
.fade-leave-active {
  transition: all 0.5s cubic-bezier(0.55, 0, 0.1, 1);
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  padding: 1rem;
  width: 100%;
  height: 100%;
  overflow-y: auto;
  background-color: #f8f9fa;
}

.fade-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1;
  transform: translateX(0);
}

/* Mobil için transition ayarları */
@media (max-width: 768px) {
  .fade-enter-active,
  .fade-leave-active {
    padding: 0.5rem;
  }

  .fade-enter-from {
    transform: translateX(20px);
  }

  .fade-leave-to {
    transform: translateX(-20px);
  }
}
</style> 