package com.signature.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import lombok.RequiredArgsConstructor;

@Configuration
@RequiredArgsConstructor
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**").allowedOrigins("*").allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE",
                "OPTIONS");
    }

    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        registry.addViewController("/bureau-bianco").setViewName("forward:/bureau-bianco/index.html");
        registry.addViewController("/{x:[\\w\\-]+}").setViewName("forward:/bureau-bianco/index.html");
        registry.addViewController("/{x:[\\w\\-]+}/**/{y:[\\w\\-]+}").setViewName("forward:/bureau-bianco/index.html");
        registry.addViewController("/{x:^(?!api/v1$).*$}/**/{y:[\\w\\-]+}")
                .setViewName("forward:/bureau-bianco/index.html");
    }

}
