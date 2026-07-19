package com.example.Campushub.dto;

public class ChatResponse {

    private String reply;
    // "rules" (answered from campus data), "ai" (external model), or "fallback"
    private String source;

    public ChatResponse() {
    }

    public ChatResponse(String reply, String source) {
        this.reply = reply;
        this.source = source;
    }

    public String getReply() {
        return reply;
    }

    public void setReply(String reply) {
        this.reply = reply;
    }

    public String getSource() {
        return source;
    }

    public void setSource(String source) {
        this.source = source;
    }
}
