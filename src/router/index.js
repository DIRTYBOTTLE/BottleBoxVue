import {createRouter, createWebHistory} from 'vue-router'

const routes = [{
    path: '/', component: () => import('../views/Login.vue'),
}, {
    path: '/home', component: () => import('../views/Home.vue'),
}, {
    path: '/cesium', component: () => import('../views/Cesium.vue')
}, {
    path: '/file', component: () => import('../views/Doc.vue')
}, {
    path: '/blog', component: () => import('../views/BlogList.vue')
}, {
    path: '/blogedit', component: () => import('../views/BlogEdit.vue')
}, {
    path: '/blogcontent', component: () => import('../views/BlogContent.vue')
}, {
    path: '/gamestore', component: () => import('../views/GameStore.vue')
}]

const router = createRouter({
    history: createWebHistory(process.env.BASE_URL), routes
})

export default router
