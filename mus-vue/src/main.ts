import Vue from 'vue';
import App from './App.vue';
import './registerServiceWorker';
import { socketLib } from './socket.lib';

Vue.config.productionTip = false;

socketLib.connectionProm.then(() => {
  new Vue({
    render: (h) => h(App),
  }).$mount('#app');
})

