package com.school.sms.controller;

import com.school.sms.model.Notification;
import com.school.sms.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*", maxAge = 3600)
public class NotificationController {

    @Autowired
    private NotificationRepository notificationRepository;

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Notification>> getUserNotifications(@PathVariable Long userId) {
        // Also fetch broadcast notifications (e.g., ALL or specific ROLE)
        List<Notification> notifications = notificationRepository.findByRecipientIdOrderByCreatedAtDesc(userId);
        return ResponseEntity.ok(notifications);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Notification> createNotification(@RequestBody Notification notification) {
        notification.setCreatedAt(LocalDateTime.now());
        return ResponseEntity.ok(notificationRepository.save(notification));
    }
    
    @PutMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Long id) {
        Notification notif = notificationRepository.findById(id).orElseThrow();
        notif.setRead(true);
        notificationRepository.save(notif);
        return ResponseEntity.ok().build();
    }
}
