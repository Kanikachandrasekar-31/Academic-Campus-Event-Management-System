package com.example.Campushub.config;

import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;

/**
 * A default RestTemplate with sane timeouts, used for calls to Google
 * Calendar/OAuth and the optional external AI chatbot API. Without an
 * explicit timeout, an unreachable or slow external host would hang the
 * calling request indefinitely — which surfaces to the frontend as a
 * generic "cannot reach the server" error that has nothing to do with
 * CampusHub's own backend actually being down.
 */
@Configuration
public class RestClientConfig {

    @Bean
    public RestTemplate restTemplate(RestTemplateBuilder builder) {
        return builder
                .setConnectTimeout(Duration.ofSeconds(5))
                .setReadTimeout(Duration.ofSeconds(10))
                .build();
    }
}
