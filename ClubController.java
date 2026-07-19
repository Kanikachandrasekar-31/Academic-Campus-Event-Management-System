package com.example.Campushub.controller;

import com.example.Campushub.entity.Club;
import com.example.Campushub.service.ClubService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/clubs")
@CrossOrigin(origins = "*")
public class ClubController {

    @Autowired
    private ClubService service;

    @PostMapping
    public Club createClub(@RequestBody Club club) {
        return service.saveClub(club);
    }

    @GetMapping
    public List<Club> getAllClubs() {
        return service.getAllClubs();
    }
}