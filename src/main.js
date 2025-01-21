import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

// Bootstrap
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap'

// TinyMCE
import Editor from '@tinymce/tinymce-vue'

const app = createApp(App)

app.use(router)
app.use(store)
app.component('Editor', Editor)

app.mount('#app') 