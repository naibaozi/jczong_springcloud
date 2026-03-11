import { defineStore } from 'pinia';
import { login as userLogin, register as userRegister, getUserInfo} from '@/api/user_api.js';
import { ElMessage } from 'element-plus';
import router from '@/router'; // 统一路径导入（避免相对路径错误）

export const useUserStore = defineStore('user', {
    state: () => ({
        userId: 0, // 用户ID（0-未登录）
        username: '', // 用户名
        avatar: '', // 头像URL
        token: localStorage.getItem('token') || '', // 模拟token（实际可存JWT）
        isLogin: !!localStorage.getItem('token'), // 登录状态
    }),
    getters: {
        // 认证状态getter
        isAuthenticated: (state) => state.isLogin && state.userId > 0 && !!state.token,
        // 用户信息getter
        userInfo: (state) => ({
            userId: state.userId,
            username: state.username,
            avatar: state.avatar,
        })
    },
    persist: {
        // 开启 Pinia 持久化（避免页面刷新后状态丢失）
        enabled: true,
        strategies: [
            {
                key: 'user_store',
                storage: localStorage,
                paths: ['userId', 'username', 'avatar', 'token'], // 只持久化关键状态
            },
        ],
    },
    actions: {
        /**
         * 登录（生成符合后端要求的Token：USER_{Base64(userId_username)}）
         */
        async login(userInfo) {
            if (this.isLogin) {
                ElMessage.info('您已登录，无需重复操作');
                return true;
            }

            try {
                const res = await userLogin(userInfo);
                if (res?.code === 200 && res.data) {
                    const { id, username, avatar, maxLevel, unlimitedUnlocked, coin = 10, exp = 5 } = res.data;
                    // 完整赋值状态
                    this.userId = id || 0;
                    this.username = username || '游客';
                    this.avatar = avatar || '';
                    this.isLogin = true;

                    // 关键修改：生成后端要求的Token格式
                    // 1. 拼接 userId 和 username（格式：userId_username）
                    const tokenPayload = `${id}_${username}`;
                    // 2. Base64编码（兼容中文，使用UTF-8）
                    const base64Payload = btoa(encodeURIComponent(tokenPayload));
                    // 3. 拼接前缀，生成最终Token
                    this.token = `USER_${base64Payload}`;
                    localStorage.setItem('token', this.token);

                    ElMessage.success(res.msg || '登录成功');

                    // 处理跳转：优先取 query.redirect，无则跳首页
                    const redirectPath = router.currentRoute.value.query.redirect || '/';
                    if (router.currentRoute.value.path !== redirectPath) {
                        router.push(redirectPath);
                    }

                    return true;
                } else {
                    ElMessage.error('登录失败：' + (res?.msg || '用户名或密码错误'));
                    return false;
                }
            } catch (error) {
                console.error('登录失败：', error);
                ElMessage.error('网络错误，登录失败');
                return false;
            }
        },

        /**
         * 注册（注册后自动登录）
         */
        async register(userInfo) {
            // 校验用户名和密码（前端基础校验）
            if (!userInfo.username || !userInfo.password) {
                ElMessage.warning('用户名和密码不能为空');
                return false;
            }

            try {
                const res = await userRegister({
                    username: userInfo.username,
                    password: userInfo.password
                });
                if (res?.code === 200) {
                    ElMessage.success(res.msg || '注册成功，自动登录中...');
                    // 注册成功后自动登录（复用 login 逻辑）
                    return this.login({
                        username: userInfo.username,
                        password: userInfo.password
                    });
                } else {
                    ElMessage.error('注册失败：' + (res?.msg || '未知错误'));
                    return false;
                }
            } catch (error) {
                console.error('注册失败：', error);
                ElMessage.error('网络错误，注册失败');
                return false;
            }
        },

        /**
         * 退出登录（清除状态+跳转）
         */
        logout() {
            // 清除 Pinia 状态
            this.userId = 0;
            this.username = '';
            this.avatar = '';
            this.isLogin = false;
            // 清除本地存储
            localStorage.removeItem('token');
            // 清除持久化存储（可选，根据需求决定）
            localStorage.removeItem('user_store');

            ElMessage.success('退出登录成功');
            // 退出后跳首页（避免停留在需要登录的页面）
            if (router.currentRoute.value.meta.requireAuth) {
                router.push('/');
            }
        },

        /**
         * 同步用户信息（页面刷新/初始化时调用）
         */
        async fetchUserInfo() {
            // 未登录或无 userId，无需同步
            if (!this.isLogin || this.userId === 0) return;

            try {
                const res = await getUserInfo(this.userId);
                if (res.code === 200 && res.data) {
                    const { username, avatar } = res.data;
                    this.username = username || this.username;
                    this.avatar = avatar || this.avatar;
                }
            } catch (error) {
                console.error('同步用户信息失败：', error);
                // 信息同步失败，强制退出登录（避免状态不一致）
                this.logout();
                ElMessage.error('用户信息已过期，请重新登录');
            }
        },


        /**
         * 手动刷新用户状态（用于主动同步）
         */
        async refreshUserState() {
            if (!this.isLogin) return;
            try {
                await this.fetchUserInfo();
                await this.setUnlimitedUnlocked();
                ElMessage.success('用户状态已刷新');
            } catch (error) {
                console.error('刷新用户状态失败：', error);
                ElMessage.error('刷新失败，请重试');
            }
        },
    }
});