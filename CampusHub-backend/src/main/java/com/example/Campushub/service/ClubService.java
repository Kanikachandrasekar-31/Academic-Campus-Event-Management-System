package com.example.Campushub.service;

import com.example.Campushub.entity.Club;
import com.example.Campushub.repository.ClubRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ClubService {

    @Autowired
    private ClubRepository repository;

    public Club saveClub(Club club) {
        return repository.save(club);
    }

    public List<Club> getAllClubs() {
        return repository.findAll();
    }
}