import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'
import Welcome from '../components/Welcome.vue'
import Users from '../components/user/Users.vue'
import Rights from '../components/power/Rights.vue'
import Roles from '../components/power/Roles.vue'

import Cate from '../components/goods/Cate.vue'
Vue.use(VueRouter)

/* const routes = [
    { path: '/', redirect: '/login' },
    { path: '/login', component: Login },
    { path: '/home', component: Home }
] */

const router = new VueRouter({
    routes: [
        { path: '/', redirect: '/login' },
        { path: '/login', component: Login },
        {
            path: '/home',
            component: Home,
            redirect: '/welcome',
            children: [
                { path: '/welcome', component: Welcome },
                { path: '/users', component: Users },
                { path: '/rights', component: Rights },
                { path: '/roles', component: Roles },
                { path: '/categories', component: Cate }
            ]
        }
    ]
})

//挂载路由导航守卫
router.beforeEach((to, from, next) => {
    // to 是将要访问的路径  from代表从哪个路径跳转来的，next() 是一个函数，表示放行。
    // next('/login')是强制跳转到指定的路径去 
    if (to.path === '/login') return next(); //如果用户访问的是登录页面，直接放行
    const tokenStr = window.sessionStorage.getItem('token') //如果用户访问的是有操作权限的页面的话，先从sessionStorage中取出唯一的登录token ,如果token 不存在 直接强制跳转到 login 页
    if (!tokenStr) return next('/login')
    next()  //直接放行
})




export default router
