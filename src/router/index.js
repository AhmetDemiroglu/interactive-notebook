import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import NoteView from '../views/NoteView.vue'
import NoteEditor from '../components/notes/NoteEditor.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/folder/all'
    },
    {
      path: '/folder/:folder',
      name: 'home',
      component: HomeView,
      props: true
    },
    {
      path: '/note/:id',
      name: 'note',
      component: NoteView,
      props: true
    },
    {
      path: '/note/:id/edit',
      name: 'note-edit',
      component: NoteEditor,
      props: true
    }
  ]
})

export default router 