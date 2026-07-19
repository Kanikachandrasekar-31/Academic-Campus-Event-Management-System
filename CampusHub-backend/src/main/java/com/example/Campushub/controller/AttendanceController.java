package com.example.Campushub.controller;

import com.example.Campushub.entity.Attendance;
import com.example.Campushub.entity.Student;
import com.example.Campushub.repository.StudentRepository;
import com.example.Campushub.service.AttendanceService;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/attendance")
@CrossOrigin("*")
public class AttendanceController {

    private final AttendanceService service;
    private final StudentRepository studentRepository;

    public AttendanceController(AttendanceService service, StudentRepository studentRepository) {
        this.service = service;
        this.studentRepository = studentRepository;
    }

    @PostMapping
    public Attendance addAttendance(@RequestBody Attendance attendance) {
        return service.saveAttendance(attendance);
    }

    // Students only ever see their own attendance rows, even via a direct API
    // call — this mirrors the Attendance page's frontend filtering but enforces
    // it server-side too, since the UI alone isn't a security boundary.
    @GetMapping
    public List<Attendance> getAllAttendance(Authentication authentication) {
        List<Attendance> all = service.getAllAttendance();
        if (isStudent(authentication)) {
            Student self = studentRepository.findByEmail(authentication.getName()).orElse(null);
            if (self == null || self.getRegisterNumber() == null) return Collections.emptyList();
            return all.stream()
                    .filter(a -> self.getRegisterNumber().equals(a.getRegisterNumber()))
                    .collect(Collectors.toList());
        }
        return all;
    }

    private boolean isStudent(Authentication authentication) {
        if (authentication == null) return false;
        for (GrantedAuthority ga : authentication.getAuthorities()) {
            if ("ROLE_STUDENT".equals(ga.getAuthority())) return true;
        }
        return false;
    }

    @GetMapping("/{id}")
    public Attendance getAttendance(@PathVariable Long id) {
        return service.getAttendanceById(id);
    }

    @PutMapping("/{id}")
    public Attendance updateAttendance(@PathVariable Long id,
                                       @RequestBody Attendance attendance) {
        return service.updateAttendance(id, attendance);
    }

    @DeleteMapping("/{id}")
    public String deleteAttendance(@PathVariable Long id) {
        service.deleteAttendance(id);
        return "Attendance Deleted Successfully";
    }
}
