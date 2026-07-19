package com.example.Campushub.service;

import com.example.Campushub.entity.ClassGroup;
import com.example.Campushub.repository.ClassGroupRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ClassGroupService {

    private final ClassGroupRepository repository;

    public ClassGroupService(ClassGroupRepository repository) {
        this.repository = repository;
    }

    public List<ClassGroup> getAll() {
        return repository.findAll();
    }

    public ClassGroup create(ClassGroup group) {
        return repository.save(group);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }
}
