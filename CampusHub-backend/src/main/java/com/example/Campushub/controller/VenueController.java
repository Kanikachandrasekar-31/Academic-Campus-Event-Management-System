package com.example.Campushub.controller;

import com.example.Campushub.entity.Venue;
import com.example.Campushub.service.VenueService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/venues")
@CrossOrigin("*")
public class VenueController {

    private final VenueService service;

    public VenueController(VenueService service) {
        this.service = service;
    }

    @GetMapping
    public List<Venue> getAllVenues() {
        return service.getAllVenues();
    }

    @GetMapping("/{id}")
    public Venue getVenue(@PathVariable Long id) {
        return service.getVenueById(id);
    }

    @PostMapping
    public Venue addVenue(@RequestBody Venue venue) {
        return service.addVenue(venue);
    }

    @PutMapping("/{id}")
    public Venue updateVenue(@PathVariable Long id,
                             @RequestBody Venue venue) {
        return service.updateVenue(id, venue);
    }

    @DeleteMapping("/{id}")
    public String deleteVenue(@PathVariable Long id) {
        service.deleteVenue(id);
        return "Venue Deleted Successfully";
    }
}