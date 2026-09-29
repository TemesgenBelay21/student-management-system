package com.school.sms.controller;

import com.school.sms.model.Exam;
import com.school.sms.model.Grade;
import com.school.sms.model.Subject;
import com.school.sms.model.Student;
import com.school.sms.repository.ExamRepository;
import com.school.sms.repository.GradeRepository;
import com.school.sms.repository.SubjectRepository;
import com.school.sms.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/academic")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AcademicController {

    @Autowired
    private ExamRepository examRepository;

    @Autowired
    private SubjectRepository subjectRepository;

    @Autowired
    private GradeRepository gradeRepository;

    @Autowired
    private StudentRepository studentRepository;

    // --- SUBJECTS ---
    @GetMapping("/subjects")
    public ResponseEntity<List<Subject>> getSubjects() {
        return ResponseEntity.ok(subjectRepository.findAll());
    }

    @PostMapping("/subjects")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Subject> addSubject(@RequestBody Subject subject) {
        return ResponseEntity.ok(subjectRepository.save(subject));
    }

    // --- EXAMS ---
    @GetMapping("/exams")
    public ResponseEntity<List<Exam>> getExams() {
        return ResponseEntity.ok(examRepository.findAll());
    }

    @PostMapping("/exams")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Exam> addExam(@RequestBody Exam exam) {
        return ResponseEntity.ok(examRepository.save(exam));
    }

    // --- GRADES ---
    @PostMapping("/grades")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER')")
    public ResponseEntity<Grade> saveGrade(@RequestBody Map<String, Object> payload) {
        Long studentId = Long.valueOf(payload.get("studentId").toString());
        Long subjectId = Long.valueOf(payload.get("subjectId").toString());
        Long examId = Long.valueOf(payload.get("examId").toString());
        Double marks = Double.valueOf(payload.get("marks").toString());
        String letterGrade = payload.get("letterGrade") != null ? payload.get("letterGrade").toString() : null;

        Student student = studentRepository.findById(studentId).orElseThrow();
        Subject subject = subjectRepository.findById(subjectId).orElseThrow();
        Exam exam = examRepository.findById(examId).orElseThrow();

        Grade grade = gradeRepository.findByStudentIdAndSubjectIdAndExamId(studentId, subjectId, examId)
                .orElse(new Grade());

        grade.setStudent(student);
        grade.setSubject(subject);
        grade.setExam(exam);
        grade.setMarks(marks);
        grade.setLetterGrade(letterGrade);

        return ResponseEntity.ok(gradeRepository.save(grade));
    }

    @GetMapping("/grades/student/{studentId}")
    public ResponseEntity<List<Grade>> getStudentGrades(@PathVariable Long studentId) {
        return ResponseEntity.ok(gradeRepository.findByStudentId(studentId));
    }
}
