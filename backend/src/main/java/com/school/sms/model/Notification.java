package com.school.sms.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String recipientRole; // "ALL", "PARENT", "STUDENT", "TEACHER"
    private Long recipientId; // Specific user ID, or null for broadcast

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, length = 1000)
    private String message;

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
    
    private boolean isRead = false;
}
