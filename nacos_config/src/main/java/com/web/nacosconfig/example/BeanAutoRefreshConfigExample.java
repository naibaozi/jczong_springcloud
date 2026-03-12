package com.web.nacosconfig.example;

import java.util.HashMap;
import java.util.Map;


import com.web.nacosconfig.model.NacosConfigInfo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Dynamic bean refresh example.
 *
 * @author lixiaoshuang
 */
@RestController
@RequestMapping("/nacos/bean")
public class BeanAutoRefreshConfigExample {

    @Autowired
    private NacosConfigInfo nacosConfigInfo;

    @GetMapping
    public Map<String, String> getConfigInfo() {
        Map<String, String> result = new HashMap<>();
        result.put("serverAddr", nacosConfigInfo.getServerAddr());
        result.put("prefix", nacosConfigInfo.getPrefix());
        result.put("group", nacosConfigInfo.getGroup());
        result.put("namespace", nacosConfigInfo.getNamespace());
        return result;
    }
}