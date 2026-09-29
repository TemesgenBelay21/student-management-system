package com.school.sms.controller;

import com.school.sms.model.SchoolClass;
import com.school.sms.repository.SchoolClassRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/classes")
public class ClassController {

    private final SchoolClassRepository schoolClassRepository;

    public ClassController(SchoolClassRepository schoolClassRepository) {
        this.schoolClassRepository = schoolClassRepository;
    }

    @GetMapping
    public List<SchoolClass> getAll() {
        return schoolClassRepository.findAll();
    }

    @PostMapping
    public SchoolClass create(@Valid @RequestBody SchoolClass schoolClass) {
        return schoolClassRepository.save(schoolClass);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @Valid @RequestBody SchoolClass updated) {
        return schoolClassRepository.findById(id).map(existing -> {
            existing.setName(updated.getName());
            existing.setSection(updated.getSection());
            existing.setClassTeacher(updated.getClassTeacher());
            return ResponseEntity.ok(schoolClassRepository.save(existing));
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        if (!schoolClassRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        schoolClassRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
