package com.example.Campushub.controller;

import com.example.Campushub.dto.ChatRequest;
import com.example.Campushub.dto.ChatResponse;
import com.example.Campushub.service.ChatbotService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/chatbot")
@CrossOrigin(origins = "*")
public class ChatbotController {

    private final ChatbotService chatbotService;

    public ChatbotController(ChatbotService chatbotService) {
        this.chatbotService = chatbotService;
    }

    @PostMapping("/ask")
    public ChatResponse ask(@RequestBody ChatRequest request, Authentication authentication) {
        String email = authentication != null ? authentication.getName() : null;
        return chatbotService.ask(request.getMessage(), email);
    }
}
