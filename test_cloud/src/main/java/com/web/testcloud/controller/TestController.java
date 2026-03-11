package com.web.testcloud.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/test")
//允许跨域
@CrossOrigin(origins = "*")
public class TestController {

    @RequestMapping(path = "/getTestString" , method = RequestMethod.GET)
    public String GetTestString (){
        System.out.println("GetTestString() method is called");
        return "I from test cloud Get Test String";
    }

    @RequestMapping(path = "/postTestString" , method = RequestMethod.POST)
    public String PostTestString (){
        System.out.println("PostTestString() method is called");
        return "I from test cloud Post Test String";
    }

}
