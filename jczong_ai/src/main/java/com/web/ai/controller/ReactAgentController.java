package com.web.ai.controller;

import com.alibaba.cloud.ai.graph.agent.ReactAgent;
import com.alibaba.cloud.ai.graph.checkpoint.savers.MemorySaver;
import com.alibaba.cloud.ai.graph.exception.GraphRunnerException;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@Slf4j
@AllArgsConstructor
@RestController
@RequestMapping("/react/agent")
public class ReactAgentController {

    private final ChatModel chatModel;

    @GetMapping(value = "/chat", produces = MediaType.TEXT_PLAIN_VALUE)
    public String chat(@RequestParam String prompt) {
        if (prompt == null || prompt.trim().isEmpty()) {
            return "请输入有效的问题";
        }

        try {
            ReactAgent agent = ReactAgent.builder()
                    .name("chat_agent")
                    .model(chatModel)
                    .systemPrompt("你是一个友好的智能助手，能够帮助用户解答问题、提供建议和进行愉快的对话。请用中文回答用户的问题。")
                    .saver(new MemorySaver())
                    .build();

            return agent.call(prompt).getText();
        } catch (GraphRunnerException e) {
            log.error("调用 AI 助手失败", e);
            return "调用失败：" + e.getMessage();
        } catch (Exception e) {
            log.error("发生未知错误", e);
            return "发生错误：" + e.getMessage();
        }
    }

    /**
     * 流式输出接口（SSE）
     */
    @GetMapping(value = "/chat/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter chatStream(@RequestParam String prompt) {
        SseEmitter emitter = new SseEmitter(0L); // 0 表示永不过期

        // 在新线程中处理，避免阻塞主线程
        new Thread(() -> {
            try {
                if (prompt == null || prompt.trim().isEmpty()) {
                    emitter.send("请输入有效的问题");
                    emitter.complete();
                    return;
                }

                ReactAgent agent = ReactAgent.builder()
                        .name("chat_agent")
                        .model(chatModel)
                        .systemPrompt("你是一个友好的智能助手，能够帮助用户解答问题、提供建议和进行愉快的对话。请用中文回答用户的问题。")
                        .saver(new MemorySaver())
                        .build();

                // 模拟流式输出 - 按字符逐步发送
                String response = agent.call(prompt).getText();
                String[] tokens = response.split("(?<=\\s)"); // 按空格分词

                for (String token : tokens) {
                    emitter.send(token);
                    Thread.sleep(100); // 模拟打字效果，可调整或移除
                }

                emitter.complete();
                log.info("流式响应完成：{}", prompt);
            } catch (GraphRunnerException e) {
                log.error("流式调用 AI 助手失败", e);
                try {
                    emitter.send("调用失败：" + e.getMessage());
                    emitter.completeWithError(e);
                } catch (Exception ex) {
                    log.error("发送错误消息失败", ex);
                }
            } catch (Exception e) {
                log.error("流式调用发生未知错误", e);
                try {
                    emitter.send("发生错误：" + e.getMessage());
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
