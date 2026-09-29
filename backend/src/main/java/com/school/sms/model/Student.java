package com.school.sms.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "students")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String admissionNumber;

    @Column(nullable = false)
    private String fullName;

    private LocalDate dateOfBirth;

    private String gender;

    private String guardianName;

    private String guardianPhone;

    private String address;

    @ManyToOne
    @JoinColumn(name = "class_id")
    private SchoolClass schoolClass;

    @OneToOne
    @JoinColumn(name = "user_id")
    private User user; // linked login account, nullable

    @Column(nullable = false)
    private LocalDate enrollmentDate = LocalDate.now();

    @Column(nullable = false)
    private Double balance = 0.0;

    @Column(nullable = false)
    private boolean active = true;
}
