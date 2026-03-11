import request from "@/utils/request.js";

/**
 * get获取字符串测试
 */
export async function getStringTest() {
    try {
        const res = await request('test', '/api/test/getTestString',
            {
                method: 'GET'
            }
            )
        console.log('get请求成功：', res.data)
        return res.data
    } catch (err) {
        console.error('请求失败：', err)
        return null
    }
}

/**
 * post获取字符串测试
 */
export async function postStringTest() {
    try {
        const res = await request('test', '/api/test/postTestString',
            {
                method: 'POST'
            }
        )
        console.log('post请求成功：', res.data)
        return res.data
    } catch (err) {
        console.error('请求失败：', err)
        return null
    }
}




