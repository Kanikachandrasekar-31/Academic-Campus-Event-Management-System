package com.example.Campushub.service;

import com.example.Campushub.dto.ChatResponse;
import com.example.Campushub.entity.Announcement;
import com.example.Campushub.entity.Assignment;
import com.example.Campushub.entity.Attendance;
import com.example.Campushub.entity.Event;
import com.example.Campushub.entity.Marks;
import com.example.Campushub.entity.Student;
import com.example.Campushub.entity.User;
import com.example.Campushub.repository.AnnouncementRepository;
import com.example.Campushub.repository.AssignmentRepository;
import com.example.Campushub.repository.AttendanceRepository;
import com.example.Campushub.repository.EventRepository;
import com.example.Campushub.repository.MarksRepository;
import com.example.Campushub.repository.StudentRepository;
import com.example.Campushub.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * The CampusMind chatbot. It first tries to answer from the college's own
 * live data (attendance, marks, assignments, events, announcements) using
 * simple keyword matching — no external calls needed for the common cases.
 * Only messages it can't classify are (optionally) forwarded to an external
 * AI API, and only if one has been configured; otherwise it gives a helpful
 * fallback instead of failing.
 */
@Service
public class ChatbotService {

    private static final Logger log = LoggerFactory.getLogger(ChatbotService.class);

    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    private final AttendanceRepository attendanceRepository;
    private final MarksRepository marksRepository;
    private final AssignmentRepository assignmentRepository;
    private final EventRepository eventRepository;
    private final AnnouncementRepository announcementRepository;
    private final RestTemplate restTemplate;

    @Value("${ai.chatbot.api-url:}")
    private String aiApiUrl;

    @Value("${ai.chatbot.api-key:}")
    private String aiApiKey;

    @Value("${ai.chatbot.model:gpt-4o-mini}")
    private String aiModel;

    public ChatbotService(StudentRepository studentRepository,
                           UserRepository userRepository,
                           AttendanceRepository attendanceRepository,
                           MarksRepository marksRepository,
                           AssignmentRepository assignmentRepository,
                           EventRepository eventRepository,
                           AnnouncementRepository announcementRepository,
                           RestTemplate restTemplate) {
        this.studentRepository = studentRepository;
        this.userRepository = userRepository;
        this.attendanceRepository = attendanceRepository;
        this.marksRepository = marksRepository;
        this.assignmentRepository = assignmentRepository;
        this.eventRepository = eventRepository;
        this.announcementRepository = announcementRepository;
        this.restTemplate = restTemplate;
    }

    public ChatResponse ask(String rawMessage, String currentUserEmail) {
        String message = rawMessage == null ? "" : rawMessage.trim();
        if (message.isEmpty()) {
            return new ChatResponse("Ask me about your attendance, marks, assignments, events, or announcements!", "rules");
        }

        String lower = message.toLowerCase();
        User currentUser = currentUserEmail != null ? userRepository.findByEmail(currentUserEmail).orElse(null) : null;
        Student student = currentUserEmail != null ? studentRepository.findByEmail(currentUserEmail).orElse(null) : null;

        if (containsAny(lower, "hi", "hello", "hey")) {
            String name = currentUser != null ? currentUser.getName() : null;
            return new ChatResponse("Hi" + (name != null ? " " + name : "") + "! I can help with attendance, marks, assignments, events, and announcements — what would you like to know?", "rules");
        }

        if (containsAny(lower, "attendance")) {
            return new ChatResponse(answerAttendance(student), "rules");
        }

        if (containsAny(lower, "mark", "marks", "grade", "score")) {
            return new ChatResponse(answerMarks(student), "rules");
        }

        if (containsAny(lower, "assignment", "due", "deadline", "homework")) {
            return new ChatResponse(answerAssignments(), "rules");
        }

        if (containsAny(lower, "event", "workshop", "hackathon", "fest")) {
            return new ChatResponse(answerEvents(), "rules");
        }

        if (containsAny(lower, "announcement", "notice")) {
            return new ChatResponse(answerAnnouncements(), "rules");
        }

        // Nothing matched — try an external AI model if one is configured.
        String aiReply = tryExternalAi(message);
        if (aiReply != null) {
            return new ChatResponse(aiReply, "ai");
        }

        return new ChatResponse(
                "I'm not sure about that yet — I can currently help with attendance, marks, assignments, "
                        + "upcoming events, and announcements. Try asking about one of those!",
                "fallback"
        );
    }

    private boolean containsAny(String haystack, String... needles) {
        for (String n : needles) {
            if (haystack.contains(n)) return true;
        }
        return false;
    }

    private String answerAttendance(Student student) {
        if (student == null) {
            return "I couldn't find a student record linked to your account, so I can't calculate personal attendance. "
                    + "You can check department-wide attendance on the Attendance page.";
        }
        List<Attendance> records = attendanceRepository.findAll().stream()
                .filter(a -> student.getRegisterNumber() != null && student.getRegisterNumber().equals(a.getRegisterNumber()))
                .collect(Collectors.toList());
        if (records.isEmpty()) {
            return "No attendance records found for you yet.";
        }
        long present = records.stream().filter(a -> "Present".equalsIgnoreCase(a.getStatus())).count();
        double percent = Math.round((present * 1000.0) / records.size()) / 10.0;
        String status = percent < 75 ? " That's below the 75% requirement — try to catch up soon!" : " You're in good shape.";
        return "Your attendance is " + percent + "% (" + present + " of " + records.size() + " classes attended)." + status;
    }

    private String answerMarks(Student student) {
        if (student == null) {
            return "I couldn't find a student record linked to your account, so I can't pull up personal marks.";
        }
        List<Marks> records = marksRepository.findAll().stream()
                .filter(m -> student.getRegisterNumber() != null && student.getRegisterNumber().equals(m.getRegisterNumber()))
                .collect(Collectors.toList());
        if (records.isEmpty()) {
            return "No marks have been recorded for you yet.";
        }
        double avg = records.stream().mapToInt(Marks::getTotal).average().orElse(0);
        String subjects = records.stream()
                .map(m -> m.getSubject() + ": " + m.getTotal())
                .collect(Collectors.joining(", "));
        return "Your average marks are " + Math.round(avg * 10) / 10.0 + ". By subject — " + subjects;
    }

    private String answerAssignments() {
        List<Assignment> assignments = assignmentRepository.findAll();
        if (assignments.isEmpty()) {
            return "There are no assignments posted right now.";
        }
        String list = assignments.stream()
                .limit(5)
                .map(a -> a.getTitle() + " (" + a.getSubject() + ", due " + a.getDueDate() + ")")
                .collect(Collectors.joining("; "));
        return "Here are the most recent assignments: " + list + ". Check the Assignments page for the full list.";
    }

    private String answerEvents() {
        List<Event> events = eventRepository.findAll();
        if (events.isEmpty()) {
            return "There are no events scheduled right now.";
        }
        String list = events.stream()
                .limit(5)
                .map(e -> e.getEventName() + " on " + e.getEventDate() + (e.getVenue() != null ? " at " + e.getVenue() : ""))
                .collect(Collectors.joining("; "));
        return "Upcoming events: " + list + ". Visit the Events page to register.";
    }

    private String answerAnnouncements() {
        List<Announcement> announcements = announcementRepository.findAll();
        if (announcements.isEmpty()) {
            return "There are no announcements right now.";
        }
        String list = announcements.stream()
                .limit(3)
                .map(Announcement::getTitle)
                .collect(Collectors.joining("; "));
        return "Recent announcements: " + list + ". See the Announcements page for full details.";
    }

    /**
     * Forwards to an OpenAI-compatible chat completions endpoint if configured.
     * Returns null (never throws) when no API is set up or the call fails,
     * so the caller always has a safe fallback path.
     */
    private String tryExternalAi(String message) {
        if (aiApiUrl == null || aiApiUrl.isBlank() || aiApiKey == null || aiApiKey.isBlank()) {
            return null;
        }
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(aiApiKey);

            Map<String, Object> body = Map.of(
                    "model", aiModel,
                    "messages", List.of(
                            Map.of("role", "system", "content",
                                    "You are CampusMind, a helpful assistant for a college campus management platform. "
                                            + "Answer briefly and only about academic/campus topics."),
                            Map.of("role", "user", "content", message)
                    )
            );

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.postForObject(aiApiUrl, request, Map.class);
            if (response == null) return null;

            @SuppressWarnings("unchecked")
            List<Map<String, Object>> choices = (List<Map<String, Object>>) response.get("choices");
            if (choices == null || choices.isEmpty()) return null;

            @SuppressWarnings("unchecked")
            Map<String, Object> msg = (Map<String, Object>) choices.get(0).get("message");
            if (msg == null) return null;

            Object content = msg.get("content");
            return content != null ? content.toString().trim() : null;
        } catch (RestClientException e) {
            log.warn("External AI chatbot call failed: {}", e.getMessage());
            return null;
        } catch (Exception e) {
            log.warn("Unexpected error calling external AI chatbot API: {}", e.getMessage());
            return null;
        }
    }
}
