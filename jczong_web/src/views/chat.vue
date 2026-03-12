<template>
  <div class="chat">
    <h1>AI 智能助手</h1>
    <div class="chat-container">
      <div class="chat-messages" ref="messagesContainer">
        <div 
          v-for="(message, index) in messages" 
          :key="index" 
          :class="['chat-message', message.role]"
        >
          <div class="message-header">
            <span class="message-role">{{ message.role === 'user' ? '👤 我' : '🤖 AI' }}</span>
            <span class="message-time">{{ message.time }}</span>
          </div>
          <div class="message-content">{{ message.text }}</div>
        </div>
        <!-- 加载中提示 -->
        <div v-if="isLoading" class="chat-message loading">
          <div class="message-content">AI 正在思考中...</div>
        </div>
      </div>
      <div class="chat-input">
        <input 
          type="text" 
          v-model="inputMessage" 
          @keyup.enter="sendMessage"
          placeholder="请输入您的问题..."
          :disabled="isLoading"
        />
        <button @click="sendMessage" :disabled="isLoading || !inputMessage.trim()">
          {{ isLoading ? '发送中...' : '发送' }}
        </button>
      </div>
    </div>
  </div>
</template>


<script setup>
import { ref, nextTick } from 'vue'
import { chatWithSSE } from '@/api/chat_api.js'

const messages = ref([])
const inputMessage = ref('')
const isLoading = ref(false)
const messagesContainer = ref(null)
let currentController = null

// 格式化时间
const formatTime = (date) => {
  return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

// 滚动到底部
const scrollToBottom = async () => {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

const sendMessage = async () => {
  const text = inputMessage.value.trim()
  if (!text || isLoading.value) {
    return
  }

  // 添加用户消息
  messages.value.push({
    role: 'user',
    text: text,
    time: formatTime(new Date())
  })

  // 清空输入框
  inputMessage.value = ''
  isLoading.value = true
  currentController = null

  try {
    let aiResponseText = ''

    // 使用 fetch + SSE 流式接收（支持 POST）
    currentController = chatWithSSE(
      text,
      // onMessage 回调 - 处理接收到的数据
      (data) => {
        console.log('收到 SSE 数据:', data)
        
        if (data.type === 'start') {
          // 开始接收，添加 AI 消息占位
          messages.value.push({
            role: 'assistant',
            text: '',
            time: formatTime(new Date())
          })
          scrollToBottom()
        } else if (data.type === 'chunk') {
          // 接收到字符片段，追加到当前 AI 消息
          aiResponseText += data.content
          if (messages.value.length > 0) {
            const lastMessage = messages.value[messages.value.length - 1]
            if (lastMessage.role === 'assistant') {
              lastMessage.text = aiResponseText
            }
          }
          scrollToBottom()
        } else if (data.type === 'end') {
          // 完成
          console.log('AI 回复完成')
          isLoading.value = false
          scrollToBottom()
        } else if (data.type === 'error') {
          // 错误
          messages.value.push({
            role: 'assistant',
            text: `错误：${data.message}`,
            time: formatTime(new Date())
          })
          isLoading.value = false
          scrollToBottom()
        }
      },
      // onError 回调
      (error) => {
        console.error('SSE 错误:', error)
        messages.value.push({
          role: 'assistant',
          text: '连接失败，请稍后重试',
          time: formatTime(new Date())
        })
        isLoading.value = false
        scrollToBottom()
      },
      // onComplete 回调
      () => {
        console.log('SSE 连接关闭')
        isLoading.value = false
        currentController = null
      }
    )

    await scrollToBottom()
  } catch (error) {
    console.error('发送消息失败:', error)
    messages.value.push({
      role: 'assistant',
      text: `发送失败：${error.message}`,
      time: formatTime(new Date())
    })
    isLoading.value = false
  }
}










</script>


<style scoped>
.chat {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
  padding: 20px;
}

h1 {
  margin-bottom: 30px;
  color: #42b983;
}

.chat-container {
  display: flex;
  flex-direction: column;
  height: 600px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  overflow: hidden;
  background-color: #f9f9f9;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.chat-message {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  max-width: 80%;
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.chat-message.user {
  align-self: flex-end;
  margin-left: auto;
}

.chat-message.assistant {
  align-self: flex-start;
}

.chat-message.loading {
  align-self: center;
  opacity: 0.7;
  font-style: italic;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  margin-bottom: 5px;
  font-size: 12px;
  color: #666;
}

.message-role {
  font-weight: bold;
}

.message-time {
  color: #999;
}

.message-content {
  padding: 12px 16px;
  border-radius: 10px;
  word-wrap: break-word;
  line-height: 1.5;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.chat-message.user .message-content {
  background-color: #42b983;
  color: white;
  border-bottom-right-radius: 2px;
}

.chat-message.assistant .message-content {
  background-color: white;
  color: #333;
  border-bottom-left-radius: 2px;
}

.chat-input {
  display: flex;
  padding: 15px;
  background-color: white;
  border-top: 1px solid #e0e0e0;
  gap: 10px;
}

.chat-input input {
  flex: 1;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 25px;
  outline: none;
  font-size: 14px;
  transition: border-color 0.3s;
}

.chat-input input:focus {
  border-color: #42b983;
}

.chat-input input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.chat-input button {
  padding: 12px 30px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s;
}

.chat-input button:hover:not(:disabled) {
  background-color: #369970;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(66, 185, 131, 0.3);
}

.chat-input button:active:not(:disabled) {
  transform: translateY(0);
}

.chat-input button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
  opacity: 0.6;
}

/* 滚动条样式 */
.chat-messages::-webkit-scrollbar {
  width: 8px;
}

.chat-messages::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.chat-messages::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 4px;
}

.chat-messages::-webkit-scrollbar-thumb:hover {
  background: #aaa;
}
</style>