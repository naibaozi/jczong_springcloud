package com.web.ai.controller;

import com.alibaba.cloud.ai.graph.agent.ReactAgent;
import com.alibaba.cloud.ai.graph.checkpoint.savers.MemorySaver;
import com.alibaba.cloud.ai.graph.exception.GraphRunnerException;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@AllArgsConstructor
@RestController
@RequestMapping("/chat")
@CrossOrigin(origins = "*", maxAge = 3600)
public class ReactAgentController {

    private final ChatModel chatModel;
    /**
     * 流式输出接口（SSE）- 返回 JSON 格式
     */
    @PostMapping (value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter chatStream(@RequestParam String prompt) {
        SseEmitter emitter = new SseEmitter(0L); // 0 表示永不过期

        // 在新线程中处理，避免阻塞主线程
        new Thread(() -> {
            try {
                if (prompt == null || prompt.trim().isEmpty()) {
                    Map<String, Object> errorData = new HashMap<>();
                    errorData.put("success", false);
                    errorData.put("message", "请输入有效的问题");
                    emitter.send(errorData);
                    emitter.complete();
                    return;
                }

                ReactAgent agent = ReactAgent.builder()
                        .name("chat_agent")
                        .model(chatModel)
                        .systemPrompt("你是一个友好的智能助手，能够帮助用户解答问题、提供建议和进行愉快的对话。请用中文回答用户的问题。")
                        .saver(new MemorySaver())
                        .build();

                // 获取 AI 响应
                String response = agent.call(prompt).getText();
                
                // 发送开始标记
                Map<String, Object> startData = new HashMap<>();
                startData.put("success", true);
                startData.put("type", "start");
                startData.put("message", "开始接收回复");
                emitter.send(startData);

                // 按字符流式发送
                char[] chars = response.toCharArray();
                for (int i = 0; i < chars.length; i++) {
                    Map<String, Object> chunkData = new HashMap<>();
                    chunkData.put("success", true);
                    chunkData.put("type", "chunk");
                    chunkData.put("content", String.valueOf(chars[i]));
                    chunkData.put("index", i);
                    emitter.send(chunkData);
                    Thread.sleep(50); // 模拟打字效果，可调整或移除
                }

                // 发送完成标记
                Map<String, Object> endData = new HashMap<>();
                endData.put("success", true);
                endData.put("type", "end");
                endData.put("message", "回复完成");
                emitter.send(endData);
                
                emitter.complete();
                log.info("流式响应完成：{}", prompt);
            } catch (GraphRunnerException e) {
                log.error("流式调用 AI 助手失败", e);
                try {
                    Map<String, Object> errorData = new HashMap<>();
                    errorData.put("success", false);
                    errorData.put("type", "error");
                    errorData.put("message", "调用失败：" + e.getMessage());
                    emitter.send(errorData);
                    emitter.completeWithError(e);
                } catch (Exception ex) {
                    log.error("发送错误消息失败", ex);
                }
            } catch (Exception e) {
                log.error("流式调用发生未知错误", e);
                try {
                    Map<String, Object> errorData = new HashMap<>();
                    errorData.put("success", false);
                    errorData.put("type", "error");
                    errorData.put("message", "发生错误：" + e.getMessage());
                    emitter.send(errorData);
                    emitter.completeWithError(e);
                } catch (Exception ex) {
                    log.error("发送错误消息失败", ex);
                }
            }
        }).start();

        // 设置回调
        emitter.onCompletion(() -> log.info("SSE 连接关闭"));
        emitter.onTimeout(() -> {
            log.warn("SSE 连接超时");
            emitter.completeWithError(new RuntimeException("连接超时"));
        });
        emitter.onError(throwable -> log.error("SSE 连接异常", throwable));

        return emitter;
    }
}
