import axios from 'axios'

const SERVICE_URL = 'http://192.168.222.1:8000'   // 测试



// 创建基础 axios 实例
const service = axios.create({
  timeout: 5000 // 统一超时时间
})

/**
 * 封装动态请求方法
 * @param {String} serviceName 微服务标识（如 'user'/'order'）
 * @param {String} url 接口路径（如 '/api/user/list'）
 * @param {Object} options axios 请求配置（method/data/params 等）
 */
const request = (serviceName, url, options = {}) => {
  // 校验微服务标识是否存在
  if (!SERVICE_URL) {
    throw new Error(`未配置网关地址！`)
  }

  const fullUrl = `${SERVICE_URL}${url}`

  // 发送请求（默认 GET，可通过 options 覆盖）
  return service({
    url: fullUrl,
    method: options.method || 'GET',
    data: options.data,
    params: options.params,
    headers: options.headers,
    ...options
  })
}

request.service = service

export default request