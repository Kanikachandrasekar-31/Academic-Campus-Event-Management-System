package com.example.Campushub.entity;

import jakarta.persistence.*;

/**
 * A faculty-defined grouping (e.g. "CSE / 2nd Year / A") used to scope
 * roster-based attendance/marks entry and to target assignments/study
 * materials at a specific class instead of the whole college.
 */
@Entity
@Table(name = "class_groups")
public class ClassGroup {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String department;
    private String year;
    private String section;
    private String createdBy;

    public ClassGroup() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public String getYear() {
        return year;
    }

    public void setYear(String year) {
        this.year = year;
    }

    public String getSection() {
        return section;
    }

    public void setSection(String section) {
        this.section = section;
    }

    public String getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }
}
