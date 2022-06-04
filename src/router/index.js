import {createRouter, createWebHistory} from 'vue-router'

const routes = [
    {
        path: '/',
        component: () => import('../views/Login.vue'),
    },
    {
        path: '/home',
        component: () => import('../views/Home.vue'),
    },
    {
        path: '/cesium',
        component: () => import('../views/Cesium.vue')
    },
    {
        path: '/file',
        component: () => import('../views/Doc.vue')
    },
    {
        path: '/blog',
        component: () => import('../views/BlogList.vue')
    },
    {
        path: '/blogedit',
        component: () => import('../views/BlogEdit.vue')
    },
    {
        path: '/blogcontent',
        component: () => import('../views/BlogContent.vue')
    },
    {
        path: '/gamestore',
        component: () => import('../views/GameStore.vue')
    }
    // {
    //   path: '/about',
    //   name: 'about',
    //   // route level code-splitting
    //   // this generates a separate chunk (about.[hash].js) for this route
    //   // which is lazy-loaded when the route is visited.
    //   component: () => import(/* webpackChunkName: "about" */ '../views/AboutView.vue')
    // }
]

const router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes
})

export default router
