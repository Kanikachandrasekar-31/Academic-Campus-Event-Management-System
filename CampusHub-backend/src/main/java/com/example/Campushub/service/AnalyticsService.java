package com.example.Campushub.service;

import com.example.Campushub.dto.AtRiskStudent;
import com.example.Campushub.entity.Attendance;
import com.example.Campushub.entity.Marks;
import com.example.Campushub.entity.Student;
import com.example.Campushub.repository.AttendanceRepository;
import com.example.Campushub.repository.MarksRepository;
import com.example.Campushub.repository.StudentRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Rule-based (not ML) academic-risk flagging: a student is flagged when their
 * attendance drops below 75% and/or their average internal marks drop below 40.
 * Thresholds are intentionally simple/transparent rather than a trained model.
 */
@Service
public class AnalyticsService {

    private static final double ATTENDANCE_THRESHOLD = 75.0;
    private static final double MARKS_THRESHOLD = 40.0;

    private final StudentRepository studentRepository;
    private final AttendanceRepository attendanceRepository;
    private final MarksRepository marksRepository;

    public AnalyticsService(StudentRepository studentRepository,
                             AttendanceRepository attendanceRepository,
                             MarksRepository marksRepository) {
        this.studentRepository = studentRepository;
        this.attendanceRepository = attendanceRepository;
        this.marksRepository = marksRepository;
    }

    public List<AtRiskStudent> getAtRiskStudents() {
        List<Student> students = studentRepository.findAll();

        Map<String, List<Attendance>> attendanceByReg = attendanceRepository.findAll().stream()
                .filter(a -> a.getRegisterNumber() != null)
                .collect(Collectors.groupingBy(Attendance::getRegisterNumber));

        Map<String, List<Marks>> marksByReg = marksRepository.findAll().stream()
                .filter(m -> m.getRegisterNumber() != null)
                .collect(Collectors.groupingBy(Marks::getRegisterNumber));

        List<AtRiskStudent> result = new ArrayList<>();

        for (Student student : students) {
            String reg = student.getRegisterNumber();
            if (reg == null) continue;

            List<Attendance> attendanceRecords = attendanceByReg.get(reg);
            List<Marks> marksRecords = marksByReg.get(reg);

            // Not enough data to evaluate this student yet — skip rather than guess.
            if ((attendanceRecords == null || attendanceRecords.isEmpty())
                    && (marksRecords == null || marksRecords.isEmpty())) {
                continue;
            }

            Double attendancePercent = null;
            if (attendanceRecords != null && !attendanceRecords.isEmpty()) {
                long present = attendanceRecords.stream()
                        .filter(a -> "Present".equalsIgnoreCase(a.getStatus()))
                        .count();
                attendancePercent = (present * 100.0) / attendanceRecords.size();
            }

            Double averageMarks = null;
            if (marksRecords != null && !marksRecords.isEmpty()) {
                averageMarks = marksRecords.stream()
                        .mapToInt(Marks::getTotal)
                        .average()
                        .orElse(0.0);
            }

            boolean lowAttendance = attendancePercent != null && attendancePercent < ATTENDANCE_THRESHOLD;
            boolean lowMarks = averageMarks != null && averageMarks < MARKS_THRESHOLD;

            if (!lowAttendance && !lowMarks) continue;

            String riskLevel;
            String primaryReason;
            if (lowAttendance && lowMarks) {
                riskLevel = "High";
                primaryReason = "Low attendance & marks";
            } else if (lowAttendance) {
                riskLevel = attendancePercent < 50.0 ? "High" : "Medium";
                primaryReason = "Low attendance";
            } else {
                riskLevel = averageMarks < 25.0 ? "High" : "Medium";
                primaryReason = "Low marks";
            }

            result.add(new AtRiskStudent(
                    reg,
                    student.getName(),
                    attendancePercent != null ? Math.round(attendancePercent * 10) / 10.0 : 0.0,
                    averageMarks != null ? Math.round(averageMarks * 10) / 10.0 : 0.0,
                    riskLevel,
                    primaryReason
            ));
        }

        result.sort(Comparator.comparing((AtRiskStudent s) -> s.getRiskLevel().equals("High") ? 0 : 1)
                .thenComparing(AtRiskStudent::getAttendancePercent));

        return result;
    }
}
