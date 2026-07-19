package com.example.Campushub.dto;

public class DashboardResponse {

    private long students;
    private long faculty;
    private long events;
    private long registrations;
    private long venues;
    private long clubs;
    private long announcements;

    // Role distribution (for the admin "User Role Distribution" donut)
    private long studentRoleCount;
    private long facultyRoleCount;
    private long coordinatorRoleCount;
    private long adminCount;

    public DashboardResponse() {
    }

    public long getStudents() {
        return students;
    }

    public void setStudents(long students) {
        this.students = students;
    }

    public long getFaculty() {
        return faculty;
    }

    public void setFaculty(long faculty) {
        this.faculty = faculty;
    }

    public long getEvents() {
        return events;
    }

    public void setEvents(long events) {
        this.events = events;
    }

    public long getRegistrations() {
        return registrations;
    }

    public void setRegistrations(long registrations) {
        this.registrations = registrations;
    }

    public long getVenues() {
        return venues;
    }

    public void setVenues(long venues) {
        this.venues = venues;
    }

    public long getClubs() {
        return clubs;
    }

    public void setClubs(long clubs) {
        this.clubs = clubs;
    }

    public long getAnnouncements() {
        return announcements;
    }

    public void setAnnouncements(long announcements) {
        this.announcements = announcements;
    }

    public long getStudentRoleCount() {
        return studentRoleCount;
    }

    public void setStudentRoleCount(long studentRoleCount) {
        this.studentRoleCount = studentRoleCount;
    }

    public long getFacultyRoleCount() {
        return facultyRoleCount;
    }

    public void setFacultyRoleCount(long facultyRoleCount) {
        this.facultyRoleCount = facultyRoleCount;
    }

    public long getCoordinatorRoleCount() {
        return coordinatorRoleCount;
    }

    public void setCoordinatorRoleCount(long coordinatorRoleCount) {
        this.coordinatorRoleCount = coordinatorRoleCount;
    }

    public long getAdminCount() {
        return adminCount;
    }

    public void setAdminCount(long adminCount) {
        this.adminCount = adminCount;
    }
}
