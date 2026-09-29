package com.school.sms.controller;

import com.school.sms.model.Payment;
import com.school.sms.model.Student;
import com.school.sms.repository.PaymentRepository;
import com.school.sms.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/finance")
@CrossOrigin(origins = "*", maxAge = 3600)
public class FinanceController {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private StudentRepository studentRepository;

    @PostMapping("/charge/{studentId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> addCharge(@PathVariable Long studentId, @RequestBody Map<String, Double> payload) {
        Student student = studentRepository.findById(studentId).orElseThrow(() -> new RuntimeException("Student not found"));
        Double amount = payload.get("amount");
        if (amount != null) {
            student.setBalance(student.getBalance() + amount);
            studentRepository.save(student);
        }
        return ResponseEntity.ok(student);
    }

    @PostMapping("/pay/{studentId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> recordPayment(@PathVariable Long studentId, @RequestBody Payment payment) {
        Student student = studentRepository.findById(studentId).orElseThrow(() -> new RuntimeException("Student not found"));
        
        payment.setStudent(student);
        paymentRepository.save(payment);
        
        // Update balance
        student.setBalance(student.getBalance() - payment.getAmount());
        studentRepository.save(student);
        
        return ResponseEntity.ok(payment);
    }

    @GetMapping("/payments/{studentId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER') or hasRole('STUDENT')")
    public ResponseEntity<List<Payment>> getStudentPayments(@PathVariable Long studentId) {
        return ResponseEntity.ok(paymentRepository.findByStudentId(studentId));
    }
}
