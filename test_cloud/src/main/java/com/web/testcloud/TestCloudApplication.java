package com.web.testcloud;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class TestCloudApplication {
    public static void main(String[] args) {

        SpringApplication.run(TestCloudApplication.class, args);
    }
}
