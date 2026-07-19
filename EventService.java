package com.example.Campushub.service;

import com.example.Campushub.entity.Event;
import com.example.Campushub.repository.EventRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EventService {

    @Autowired
    private EventRepository repository;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private CalendarService calendarService;

    // CREATE
    public Event saveEvent(Event event) {
        Event saved = repository.save(event);
        notificationService.notifyEventCreated(
                saved.getEventName(), saved.getEventDate(), saved.getEventTime(),
                saved.getVenue(), saved.getOrganizer());
        calendarService.syncEventToConnectedStudents(
                saved.getEventName(), saved.getEventDate(), saved.getEventTime(), saved.getVenue());
        return saved;
    }

    // READ ALL
    public List<Event> getAllEvents() {
        return repository.findAll();
    }

    // READ BY ID
    public Event getEventById(Long id) {
        return repository.findById(id).orElse(null);
    }

    // UPDATE
    public Event updateEvent(Long id, Event event) {

        Event existing = repository.findById(id).orElse(null);

        if (existing != null) {

            existing.setEventName(event.getEventName());
            existing.setEventDate(event.getEventDate());
            existing.setEventTime(event.getEventTime());
            existing.setVenue(event.getVenue());
            existing.setOrganizer(event.getOrganizer());
            existing.setDescription(event.getDescription());
            existing.setPosterUrl(event.getPosterUrl());

            return repository.save(existing);
        }

        return null;
    }

    // DELETE
    public void deleteEvent(Long id) {
        repository.deleteById(id);
    }
}