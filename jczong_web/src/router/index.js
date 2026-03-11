import { createRouter, createWebHistory } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/store/user'
import Index  from '@/views/index.vue'
import Test from '@/views/test.vue'


const routes = [
    {
        path: '/',
        // 修复2：重定向到 /index，但需单独定义 /index 路由
        redirect: '/index'
    },
    {
        path: '/index',
        name: 'Index', // 大驼峰命名
        component: Index,
        meta: {
            requireAuth: false
        }
    },
    {
        path: '/test',
        name: 'test',
        component: Test,
        meta: {
            requireAuth: false // 不需要登录
        }
    }
]

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes
})


/**
 * 路由拦截
 */
router.beforeEach((to, from, next) => {
    const userStore = useUserStore();
    const requireAuth = to.meta.requireAuth;

    const tokenFromUrl = to.query.token;
    const userIdFromUrl = to.query.userId;
    const usernameFromUrl = to.query.username;

    // 如果 URL 中有登录参数，先进行免密登录
    let isAndroidLogin = false;
    if (userIdFromUrl && !userStore.isLogin) {
        isAndroidLogin = userStore.loginFromAndroid({
            token: tokenFromUrl || '',
            userId: userIdFromUrl,
            username: usernameFromUrl || ''
        });
    }

    if (requireAuth) {
        // 仅需要登录的页面验证登录状态
        if (userStore.isLogin) {
            // 已登录
            userStore.fetchUserInfo().then(() => next()).catch(() => next());
        } else {
            // 未登录：提示并跳转到登录页，登录后返回原页面
            ElMessage.warning('请先登录后再访问该页面');
            next({
                path: '/login',
                query: { redirect: to.fullPath } // 记录跳转前的路径
            });
        }
    } else {
        // 其他页面直接放行
        next();
    }
});


export default router
