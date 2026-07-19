package com.example.Campushub.service;

import com.example.Campushub.entity.Announcement;
import com.example.Campushub.repository.AnnouncementRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AnnouncementService {

    @Autowired
    private AnnouncementRepository repository;

    @Autowired
    private NotificationService notificationService;

    public Announcement saveAnnouncement(Announcement announcement) {
        Announcement saved = repository.save(announcement);
        notificationService.notifyAnnouncementPosted(saved.getTitle(), saved.getMessage(), saved.getPostedBy());
        return saved;
    }

    public List<Announcement> getAllAnnouncements() {
        return repository.findAll();
    }
}