package com.school.sms.controller;

import com.school.sms.model.Teacher;
import com.school.sms.repository.TeacherRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/teachers")
public class TeacherController {

    private final TeacherRepository teacherRepository;

    public TeacherController(TeacherRepository teacherRepository) {
        this.teacherRepository = teacherRepository;
    }

    @GetMapping
    public List<Teacher> getAll() {
        return teacherRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Teacher> getOne(@PathVariable Long id) {
        return teacherRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> create(@Valid @RequestBody Teacher teacher) {
        if (teacherRepository.existsByEmail(teacher.getEmail())) {
            return ResponseEntity.badRequest().body("A teacher with this email already exists");
        }
        return ResponseEntity.ok(teacherRepository.save(teacher));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @Valid @RequestBody Teacher updated) {
        return teacherRepository.findById(id).map(existing -> {
            existing.setFullName(updated.getFullName());
            existing.setPhone(updated.getPhone());
            existing.setSubjectSpecialty(updated.getSubjectSpecialty());
            return ResponseEntity.ok(teacherRepository.save(existing));
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        if (!teacherRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        teacherRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
