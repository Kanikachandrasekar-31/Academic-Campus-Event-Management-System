package com.example.Campushub.service;

import com.example.Campushub.entity.Venue;
import com.example.Campushub.repository.VenueRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class VenueService {

    private final VenueRepository repository;

    public VenueService(VenueRepository repository) {
        this.repository = repository;
    }

    public List<Venue> getAllVenues() {
        return repository.findAll();
    }

    public Venue getVenueById(Long id) {
        return repository.findById(id).orElse(null);
    }

    public Venue addVenue(Venue venue) {
        return repository.save(venue);
    }

    public Venue updateVenue(Long id, Venue venue) {

        Venue oldVenue = repository.findById(id).orElse(null);

        if (oldVenue == null) {
            return null;
        }

        oldVenue.setName(venue.getName());
        oldVenue.setLocation(venue.getLocation());
        oldVenue.setCapacity(venue.getCapacity());
        oldVenue.setAvailable(venue.getAvailable());
        oldVenue.setImageUrl(venue.getImageUrl());

        return repository.save(oldVenue);
    }

    public void deleteVenue(Long id) {
        repository.deleteById(id);
    }
}