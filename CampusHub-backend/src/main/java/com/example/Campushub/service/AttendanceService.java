package com.example.Campushub.service;

import com.example.Campushub.entity.Attendance;
import com.example.Campushub.repository.AttendanceRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AttendanceService {

    private final AttendanceRepository repository;

    public AttendanceService(AttendanceRepository repository) {
        this.repository = repository;
    }

    public Attendance saveAttendance(Attendance attendance) {
        return repository.save(attendance);
    }

    public List<Attendance> getAllAttendance() {
        return repository.findAll();
    }

    public Attendance getAttendanceById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Attendance not found"));
    }

    public Attendance updateAttendance(Long id, Attendance attendance) {

        Attendance existing = getAttendanceById(id);

        existing.setStudentName(attendance.getStudentName());
        existing.setRegisterNumber(attendance.getRegisterNumber());
        existing.setDepartment(attendance.getDepartment());
        existing.setSubject(attendance.getSubject());
        existing.setAttendanceDate(attendance.getAttendanceDate());
        existing.setStatus(attendance.getStatus());

        return repository.save(existing);
    }

    public void deleteAttendance(Long id) {
        repository.deleteById(id);
    }
}