package com.example.Campushub.service;

import com.example.Campushub.entity.Student;
import com.example.Campushub.repository.StudentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Sends email notifications for assignments, events, and announcements.
 * Runs asynchronously so a slow/misconfigured mail server never delays the
 * API response for the create call that triggered it, and every failure is
 * caught and logged rather than bubbling up.
 */
@Service
public class NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);

    // The placeholder shipped in application.properties — if it hasn't been
    // replaced with a real account, skip sending instead of failing/hanging.
    private static final String PLACEHOLDER_USERNAME = "your_email@gmail.com";

    private final JavaMailSender mailSender;
    private final StudentRepository studentRepository;

    @Value("${spring.mail.username:}")
    private String mailUsername;

    public NotificationService(JavaMailSender mailSender, StudentRepository studentRepository) {
        this.mailSender = mailSender;
        this.studentRepository = studentRepository;
    }

    private boolean isMailConfigured() {
        return mailUsername != null
                && !mailUsername.isBlank()
                && !PLACEHOLDER_USERNAME.equalsIgnoreCase(mailUsername.trim());
    }

    @Async
    public void notifyAssignmentPosted(String title, String subject, String facultyName, String dueDate,
                                        String targetDepartment, String targetYear, String targetSection) {
        String emailSubject = "New Assignment Posted: " + title;
        String body = "A new assignment has been posted.\n\n"
                + "Title: " + title + "\n"
                + "Subject: " + subject + "\n"
                + "Posted by: " + facultyName + "\n"
                + "Due date: " + dueDate + "\n\n"
                + "Log in to CampusHub to view the full details.";
        notifyMatchingStudents(emailSubject, body, targetDepartment, targetYear, targetSection);
    }

    @Async
    public void notifyStudyMaterialUploaded(String title, String subject, String uploadedBy,
                                             String targetDepartment, String targetYear, String targetSection) {
        String emailSubject = "New Study Material: " + title;
        String body = "New study material has been uploaded.\n\n"
                + "Title: " + title + "\n"
                + "Subject: " + subject + "\n"
                + "Uploaded by: " + uploadedBy + "\n\n"
                + "Log in to CampusHub to download it.";
        notifyMatchingStudents(emailSubject, body, targetDepartment, targetYear, targetSection);
    }

    @Async
    public void notifyEventCreated(String eventName, String eventDate, String eventTime, String venue, String organizer) {
        String emailSubject = "New Campus Event: " + eventName;
        String body = "A new event has been scheduled.\n\n"
                + "Event: " + eventName + "\n"
                + "Date: " + eventDate + "\n"
                + "Time: " + (eventTime != null ? eventTime : "TBA") + "\n"
                + "Venue: " + (venue != null ? venue : "TBA") + "\n"
                + "Organizer: " + (organizer != null ? organizer : "CampusHub") + "\n\n"
                + "Log in to CampusHub to register.";
        notifyAllStudents(emailSubject, body);
    }

    @Async
    public void notifyAnnouncementPosted(String title, String message, String postedBy) {
        String emailSubject = "Announcement: " + title;
        String body = message + "\n\n— " + (postedBy != null ? postedBy : "CampusHub Administration");
        notifyAllStudents(emailSubject, body);
    }

    private void notifyAllStudents(String subject, String body) {
        notifyStudents(subject, body, studentRepository.findAll());
    }

    /** Notifies only students in the given class group, or everyone if all three fields are blank. */
    private void notifyMatchingStudents(String subject, String body,
                                         String targetDepartment, String targetYear, String targetSection) {
        boolean scoped = isSet(targetDepartment) || isSet(targetYear) || isSet(targetSection);
        if (!scoped) {
            notifyAllStudents(subject, body);
            return;
        }
        List<Student> matching = studentRepository.findAll().stream()
                .filter(s -> matches(s.getDepartment(), targetDepartment)
                        && matches(s.getYear(), targetYear)
                        && matches(s.getSection(), targetSection))
                .collect(Collectors.toList());
        notifyStudents(subject, body, matching);
    }

    private boolean isSet(String v) {
        return v != null && !v.isBlank();
    }

    /** A target field only filters when it's actually set — an unset target field matches any student. */
    private boolean matches(String studentValue, String targetValue) {
        if (!isSet(targetValue)) return true;
        return studentValue != null && studentValue.trim().equalsIgnoreCase(targetValue.trim());
    }

    private void notifyStudents(String subject, String body, List<Student> students) {
        if (!isMailConfigured()) {
            log.info("Mail not configured (spring.mail.username unset or still the placeholder) — skipping email: {}", subject);
            return;
        }

        try {
            String[] recipients = students.stream()
                    .map(Student::getEmail)
                    .filter(email -> email != null && !email.isBlank())
                    .toArray(String[]::new);

            if (recipients.length == 0) {
                log.info("No matching student emails on file — skipping email: {}", subject);
                return;
            }

            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(mailUsername);
            // BCC so students don't see each other's addresses; the "to" field
            // must still be set for most SMTP servers to accept the message.
            message.setTo(mailUsername);
            message.setBcc(recipients);
            message.setSubject(subject);
            message.setText(body);

            mailSender.send(message);
            log.info("Sent '{}' notification to {} student(s)", subject, recipients.length);
        } catch (Exception e) {
            // Never let a mail failure break the request that triggered it.
            log.warn("Failed to send email notification '{}': {}", subject, e.getMessage());
        }
    }
}
