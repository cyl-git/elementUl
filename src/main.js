import Vue from 'vue'
import App from './App.vue'
import router from './router'
import axios from 'axios'
import './plugins/element.js'
import './assets/css/global.css'
import TreeTable from 'vue-table-with-tree-grid'
import VueQuillEditor from 'vue-quill-editor' //vue的富文本编辑器的引用
import 'quill/dist/quill.core.css'//vue的富文本编辑器的样式表
import 'quill/dist/quill.snow.css'//vue的富文本编辑器的样式表
import 'quill/dist/quill.bubble.css'//vue的富文本编辑器的样式表
Vue.prototype.$http = axios
Vue.use(VueQuillEditor, /* { default global options } */) //全局注册到vue实例中
//配置后端接口的路径
axios.defaults.baseURL = 'https://www.liulongbin.top:8888/api/private/v1/'
axios.interceptors.request.use(config => {
    config.headers.Authorization = window.sessionStorage.getItem('token')
    return config
})
Vue.config.productionTip = false
Vue.component('tree-table', TreeTable) //定义全局组件

//以下是定义一个全局时间过滤器
Vue.filter('dateFormat', function (originVal) {
    const dt = new Date(originVal) //根据传入的时间，得到一个时间对象
    const y = dt.getFullYear() //根据这个时间对象，得到具体的年月日，时分秒
    const m = (dt.getMonth() + 1 + '').padStart(2, '0')
    const d = (dt.getDate() + '').padStart(2, '0')
    const hh = (dt.getHours() + '').padStart(2, '0')
    const mm = (dt.getMinutes() + '').padStart(2, '0')
    const ss = (dt.getSeconds() + '').padStart(2, '0')

    return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})







new Vue({
    router,
    render: h => h(App)
}).$mount('#app')
