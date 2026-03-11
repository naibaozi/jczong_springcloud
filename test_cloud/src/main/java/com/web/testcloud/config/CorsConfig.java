package com.web.testcloud.config;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.Arrays;
import java.util.List;

/**
 * CORS 配置
 */
@Data
@Configuration
@ConfigurationProperties(prefix = "cors") // 绑定 Nacos 中 cors 前缀配置
public class CorsConfig {

    // ------------------- getter/setter 必须保留 -------------------
    // 对应 Nacos 配置项
    private String allowedOrigins;
    private String allowedMethods;
    private String allowedHeaders;
    private boolean allowCredentials;
    private long maxAge;

    /**
     * 生成 CORS 过滤器
     */
    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();

        //处理允许的源
        if ("*".equals(allowedOrigins)) {
            config.addAllowedOriginPattern("*"); // 替代 addAllowedOrigin("*")，支持 Cookie
        } else {
            List<String> originList = Arrays.asList(allowedOrigins.split(","));
            originList.forEach(config::addAllowedOrigin);
        }

        //处理允许的方法
        List<String> methodList = Arrays.asList(allowedMethods.split(","));
        methodList.forEach(config::addAllowedMethod);

        //处理允许的请求头
        config.addAllowedHeader(allowedHeaders);

        //核心配置
        config.setAllowCredentials(allowCredentials);
        config.setMaxAge(maxAge);

        //生效路径
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);

        return new CorsFilter(source);
    }

}