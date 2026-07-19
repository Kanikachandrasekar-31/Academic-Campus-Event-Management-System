package com.example.Campushub.dto;

public class AtRiskStudent {

    private String registerNumber;
    private String studentName;
    private double attendancePercent;
    private double averageMarks;
    private String riskLevel;
    private String primaryReason;

    public AtRiskStudent() {
    }

    public AtRiskStudent(String registerNumber, String studentName, double attendancePercent,
                          double averageMarks, String riskLevel, String primaryReason) {
        this.registerNumber = registerNumber;
        this.studentName = studentName;
        this.attendancePercent = attendancePercent;
        this.averageMarks = averageMarks;
        this.riskLevel = riskLevel;
        this.primaryReason = primaryReason;
    }

    public String getRegisterNumber() {
        return registerNumber;
    }

    public void setRegisterNumber(String registerNumber) {
        this.registerNumber = registerNumber;
    }

    public String getStudentName() {
        return studentName;
    }

    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }

    public double getAttendancePercent() {
        return attendancePercent;
    }

    public void setAttendancePercent(double attendancePercent) {
        this.attendancePercent = attendancePercent;
    }

    public double getAverageMarks() {
        return averageMarks;
    }

    public void setAverageMarks(double averageMarks) {
        this.averageMarks = averageMarks;
    }

    public String getRiskLevel() {
        return riskLevel;
    }

    public void setRiskLevel(String riskLevel) {
        this.riskLevel = riskLevel;
    }

    public String getPrimaryReason() {
        return primaryReason;
    }

    public void setPrimaryReason(String primaryReason) {
        this.primaryReason = primaryReason;
    }
}
