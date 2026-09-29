package com.school.sms.controller;

import com.school.sms.model.Student;
import com.school.sms.repository.StudentRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/students")
public class StudentController {

    private final StudentRepository studentRepository;

    public StudentController(StudentRepository studentRepository) {
        this.studentRepository = studentRepository;
    }

    @GetMapping
    public List<Student> getAll(@RequestParam(required = false) String search) {
        if (search != null && !search.isBlank()) {
            return studentRepository.findByFullNameContainingIgnoreCase(search);
        }
        return studentRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Student> getOne(@PathVariable Long id) {
        return studentRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> create(@Valid @RequestBody Student student) {
        if (studentRepository.existsByAdmissionNumber(student.getAdmissionNumber())) {
            return ResponseEntity.badRequest().body("Admission number already exists");
        }
        Student saved = studentRepository.save(student);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @Valid @RequestBody Student updated) {
        return studentRepository.findById(id).map(existing -> {
            existing.setFullName(updated.getFullName());
            existing.setDateOfBirth(updated.getDateOfBirth());
            existing.setGender(updated.getGender());
            existing.setGuardianName(updated.getGuardianName());
            existing.setGuardianPhone(updated.getGuardianPhone());
            existing.setAddress(updated.getAddress());
            existing.setSchoolClass(updated.getSchoolClass());
            existing.setActive(updated.isActive());
            return ResponseEntity.ok(studentRepository.save(existing));
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        if (!studentRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        studentRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
