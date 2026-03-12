
package com.web.nacosconfig;


import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;


@SpringBootApplication
@EnableDiscoveryClient
public class NachosconfigApplication {

    public static void main(String[] args) {
        SpringApplication.run(NachosconfigApplication.class, args);
    }

}