package com.example.Campushub.controller;

import com.example.Campushub.entity.Announcement;
import com.example.Campushub.service.AnnouncementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/announcements")
@CrossOrigin(origins = "*")
public class AnnouncementController {

    @Autowired
    private AnnouncementService service;

    @PostMapping
    public Announcement createAnnouncement(@RequestBody Announcement announcement) {
        return service.saveAnnouncement(announcement);
    }

    @GetMapping
    public List<Announcement> getAllAnnouncements() {
        return service.getAllAnnouncements();
    }
}