package com.example.Campushub.service;

import com.example.Campushub.dto.DashboardResponse;
import com.example.Campushub.entity.Role;
import com.example.Campushub.repository.AnnouncementRepository;
import com.example.Campushub.repository.ClubRepository;
import com.example.Campushub.repository.EventRepository;
import com.example.Campushub.repository.FacultyRepository;
import com.example.Campushub.repository.RegistrationRepository;
import com.example.Campushub.repository.StudentRepository;
import com.example.Campushub.repository.UserRepository;
import com.example.Campushub.repository.VenueRepository;
import org.springframework.stereotype.Service;

@Service
public class DashboardService {

    private final StudentRepository studentRepository;
    private final EventRepository eventRepository;
    private final RegistrationRepository registrationRepository;
    private final VenueRepository venueRepository;
    private final FacultyRepository facultyRepository;
    private final ClubRepository clubRepository;
    private final AnnouncementRepository announcementRepository;
    private final UserRepository userRepository;

    public DashboardService(StudentRepository studentRepository,
                            EventRepository eventRepository,
                            RegistrationRepository registrationRepository,
                            VenueRepository venueRepository,
                            FacultyRepository facultyRepository,
                            ClubRepository clubRepository,
                            AnnouncementRepository announcementRepository,
                            UserRepository userRepository) {

        this.studentRepository = studentRepository;
        this.eventRepository = eventRepository;
        this.registrationRepository = registrationRepository;
        this.venueRepository = venueRepository;
        this.facultyRepository = facultyRepository;
        this.clubRepository = clubRepository;
        this.announcementRepository = announcementRepository;
        this.userRepository = userRepository;
    }

    public long getStudentCount() {
        return studentRepository.count();
    }

    public long getEventCount() {
        return eventRepository.count();
    }

    public long getRegistrationCount() {
        return registrationRepository.count();
    }

    public long getVenueCount() {
        return venueRepository.count();
    }

    public DashboardResponse getDashboard() {
        DashboardResponse response = new DashboardResponse();
        response.setStudents(getStudentCount());
        response.setFaculty(facultyRepository.count());
        response.setEvents(getEventCount());
        response.setRegistrations(getRegistrationCount());
        response.setVenues(getVenueCount());
        response.setClubs(clubRepository.count());
        response.setAnnouncements(announcementRepository.count());

        response.setStudentRoleCount(userRepository.countByRole(Role.STUDENT));
        response.setFacultyRoleCount(userRepository.countByRole(Role.FACULTY));
        response.setCoordinatorRoleCount(userRepository.countByRole(Role.EVENT_COORDINATOR));
        response.setAdminCount(userRepository.countByRole(Role.ADMIN));

        return response;
    }
}
