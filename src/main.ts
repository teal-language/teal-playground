import Vue from 'vue'
import VueCompositionApi from '@vue/composition-api'
import App from './App.vue'

import './assets/styles/index.css'

Vue.use(VueCompositionApi)
Vue.config.productionTip = false

new Vue({
  render: h => h(App)
}).$mount('#app')
