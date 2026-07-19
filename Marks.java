package com.example.Campushub.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "marks")
public class Marks {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String studentName;

    private String registerNumber;

    private String subject;

    private int internal1;

    private int internal2;

    private int assignment;

    private int total;

    public Marks() {
    }

    public Marks(Long id, String studentName, String registerNumber,
                 String subject, int internal1,
                 int internal2, int assignment, int total) {
        this.id = id;
        this.studentName = studentName;
        this.registerNumber = registerNumber;
        this.subject = subject;
        this.internal1 = internal1;
        this.internal2 = internal2;
        this.assignment = assignment;
        this.total = total;
    }

    @PrePersist
    @PreUpdate
    public void calculateTotal() {
        this.total = internal1 + internal2 + assignment;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getStudentName() {
        return studentName;
    }

    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }

    public String getRegisterNumber() {
        return registerNumber;
    }

    public void setRegisterNumber(String registerNumber) {
        this.registerNumber = registerNumber;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public int getInternal1() {
        return internal1;
    }

    public void setInternal1(int internal1) {
        this.internal1 = internal1;
    }

    public int getInternal2() {
        return internal2;
    }

    public void setInternal2(int internal2) {
        this.internal2 = internal2;
    }

    public int getAssignment() {
        return assignment;
    }

    public void setAssignment(int assignment) {
        this.assignment = assignment;
    }

    public int getTotal() {
        return total;
    }
}