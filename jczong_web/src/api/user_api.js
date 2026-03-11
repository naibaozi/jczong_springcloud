/*
 * @Author: 反恐精英组-庄滨宇
 * @LastEditTime: 2025-11-27 20:43:15
 */
import request from '@/utils/request';

/**
 * 用户登录
 * @param {Object} data - { username, password }
 */
export const login = async (data) => {
    try {
        const res = await request('user', '/api/user/login',
            {
                method: 'POST',
                data
            }
        )
        return res.data
    } catch (err) {
        console.error('请求失败：', err)
    }
};

/**
 * 用户注册
 * @param {Object} data - { username, password }
 */
export const register = async (data) => {
    try {
        const res = await request('user', '/api/user/register',
            {
                method: 'POST',
                data
            }
        )
        return res.data
    } catch (err) {
        console.error('请求失败：', err)
    }

};

/**
 * 根据用户ID获取用户信息
 * @param {Number} userId - 用户ID
 */
export const getUserInfo = async (userId) => {
    try {
        const res = await request('user', '/api/user/info',
            {
                method: 'GET',
                params: { userId }
            }
        )
        return res.data
    } catch (err) {
        console.error('请求失败：', err)
    }
};

/**
 * 上传头像
 * @param {Number} userId - 用户ID
 * @param {File} file - 头像文件
 */
export const uploadAvatar = async (userId, file) => {
    const formData = new FormData();
    formData.append('userId', userId);
    formData.append('file', file);
    try {
        const res = await request('user', '/api/user/uploadAvatar',
            {
                method: 'POST',
                data: formData,
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            }
        )
        return res.data
    } catch (err) {
        console.error('请求失败：', err)
    }
};

/**
 * 更新头像URL
 * @param {Number} userId - 用户ID
 * @param {String} avatarUrl - 头像URL
 */
export const updateAvatar = async (userId, avatarUrl) => {

    try {
        const res = await request('user', '/api/user/updateAvatar',
            {
                method: 'POST',
                params: { userId, avatarUrl }
            }
        )
        return res.data
    } catch (err) {
        console.error('请求失败：', err)
    }
};

/**
 * 更新用户信息
 * @param {Number} userId - 用户ID
 * @param {String} username - 新用户名
 */
export const updateUserInfo = async (userId, username) => {
    try {
        const res = await request('user', '/api/user/updateInfo',
            {
                method: 'POST',
                params: { userId, username }
            }
        )
        return res.data
    } catch (err) {
        console.error('请求失败：', err)
    }
};

/**
 * 修改密码
 * @param {Object} data - { userId, oldPassword, newPassword }
 */
export const updatePassword = async (data) => {
    try {
        const res = await request('user', '/api/user/updatePassword',
            {
                method: 'POST',
                data
            }
        )
        return res.data
    } catch (err) {
        console.error('请求失败：', err)
    }
};