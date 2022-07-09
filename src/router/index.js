import {createRouter, createWebHistory} from 'vue-router'

const routes = [{
    path: '/', component: () => import('../views/Login.vue'),
    // redirect:'/cesium'
}, {
    path: '/home', component: () => import('../views/Home.vue'),
    // redirect:'/cesium'
}, {
    path: '/cesium', component: () => import('../views/Cesium.vue')
}, {
    path: '/file', component: () => import('../views/Doc.vue'),
    // redirect:'/cesium'
}, {
    path: '/blog', component: () => import('../views/BlogList.vue'),
    // redirect:'/cesium'
}, {
    path: '/blogedit', component: () => import('../views/BlogEdit.vue'),
    // redirect:'/cesium'
}, {
    path: '/blogcontent', component: () => import('../views/BlogContent.vue'),
    // redirect:'/cesium'
}, {
    path: '/gamestore', component: () => import('../views/GameStore.vue'),
    // redirect:'/cesium'
}]

const router = createRouter({
    history: createWebHistory(process.env.BASE_URL), routes
})

export default router
