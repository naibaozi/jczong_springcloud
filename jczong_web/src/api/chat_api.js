import request from "@/utils/request.js";

/**
 * 流式发送消息 - 使用 EventSource 接收 SSE
 * @param {string} prompt - 用户输入的消息
 * @param {function} onMessage - 接收到消息时的回调函数
 * @param {function} onError - 发生错误时的回调函数
 * @param {function} onComplete - 完成时的回调函数
 */
export const PostMessageStream = async (prompt, onMessage, onError, onComplete) => {
    const url = `/chat/stream?prompt=${encodeURIComponent(prompt)}`;
    
    try {
        const response = await request("chat", url, {
            method: "POST",
        });
        
        // 如果返回的是普通响应，直接处理
        if (response && typeof response === 'object') {
            onMessage(response);
            return;
        }
        
        return response;
    } catch (error) {
        console.error('请求失败:', error);
        throw error;
    }
};

/**
 * 使用 fetch API 接收 SSE 流式数据（支持 POST 请求）
 * @param {string} prompt - 用户输入的消息
 * @param {function} onMessage - 接收到消息时的回调函数
 * @param {function} onError - 发生错误时的回调函数
 * @param {function} onComplete - 完成时的回调函数
 * @returns {AbortController} - 可以调用 abort() 取消请求
 */
export const chatWithSSE = (prompt, onMessage, onError, onComplete) => {
    const SERVICE_URL = 'http://192.168.222.1:8000';
    const url = `${SERVICE_URL}/chat/stream?prompt=${encodeURIComponent(prompt)}`;
    
    const controller = new AbortController();
    
    // 使用 fetch 发送 POST 请求并接收 SSE 流
    fetch(url, {
        method: 'POST',
        headers: {
            'Accept': 'text/event-stream',
            'Content-Type': 'application/json'
        },
        signal: controller.signal
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.body;
    })
    .then(body => {
        const reader = body.getReader();
        const decoder = new TextDecoder('utf-8');
        let buffer = '';
        
        function read() {
            reader.read().then(({ done, value }) => {
                if (done) {
                    console.log('SSE 连接关闭');
                    if (onComplete) onComplete();
                    return;
                }
                
                // 解码数据
                const chunk = decoder.decode(value, { stream: true });
                buffer += chunk;
                
                // 分割消息（SSE 格式：data: {...}\n\n）
                const messages = buffer.split('\n\n');
                buffer = messages.pop() || ''; // 保留最后一个不完整的消息
                
                for (const message of messages) {
                    const lines = message.split('\n');
                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            try {
                                const dataStr = line.substring(6); // 去掉 'data: ' 前缀
                                const data = JSON.parse(dataStr);
                                onMessage(data);
                                
                                // 如果是结束标记，关闭连接
                                if (data.type === 'end' || data.type === 'error') {
                                    controller.abort();
                                    if (onComplete) onComplete();
                                    return;
                                }
                            } catch (e) {
                                console.error('解析 SSE 数据失败:', e, '原始数据:', line);
                            }
                        }
                    }
                }
                
                // 继续读取
                read();
            });
        }
        
        // 开始读取
        read();
    })
    .catch(error => {
        if (error.name === 'AbortError') {
            console.log('请求已取消');
        } else {
            console.error('SSE 连接错误:', error);
            if (onError) onError(error);
        }
    });
    
    return controller;
};