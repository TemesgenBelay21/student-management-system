package com.school.sms.controller;

import com.school.sms.model.AttendanceStatus;
import com.school.sms.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "*", maxAge = 3600)
public class DashboardController {

    @Autowired private StudentRepository studentRepository;
    @Autowired private TeacherRepository teacherRepository;
    @Autowired private SchoolClassRepository classRepository;
    @Autowired private PaymentRepository paymentRepository;
    @Autowired private GradeRepository gradeRepository;
    @Autowired private AttendanceRepository attendanceRepository;

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        
        long totalStudents = studentRepository.count();
        long totalTeachers = teacherRepository.count();
        long totalClasses = classRepository.count();
        
        // Sum of outstanding balances
        double totalOutstandingBalance = studentRepository.findAll().stream()
                .mapToDouble(s -> s.getBalance() != null ? s.getBalance() : 0.0)
                .sum();
                
        // Total collected
        double totalCollected = paymentRepository.findAll().stream()
                .mapToDouble(p -> p.getAmount() != null ? p.getAmount() : 0.0)
                .sum();

        stats.put("totalStudents", totalStudents);
        stats.put("totalTeachers", totalTeachers);
        stats.put("totalClasses", totalClasses);
        stats.put("totalOutstandingBalance", totalOutstandingBalance);
        stats.put("totalCollected", totalCollected);
        
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/grades-distribution")
    public ResponseEntity<List<Map<String, Object>>> getGradeDistribution() {
        // Group by letter grade
        Map<String, Long> distribution = gradeRepository.findAll().stream()
                .filter(g -> g.getLetterGrade() != null && !g.getLetterGrade().isEmpty())
                .collect(Collectors.groupingBy(g -> g.getLetterGrade().toUpperCase(), Collectors.counting()));
                
        List<Map<String, Object>> result = new ArrayList<>();
        distribution.forEach((grade, count) -> {
            Map<String, Object> map = new HashMap<>();
            map.put("name", grade);
            map.put("value", count);
            result.add(map);
        });
        
        // Sort by grade
        result.sort((a, b) -> ((String) a.get("name")).compareTo((String) b.get("name")));
        return ResponseEntity.ok(result);
    }
    
    @GetMapping("/attendance-trends")
    public ResponseEntity<List<Map<String, Object>>> getAttendanceTrends() {
        // Simple mock of past 7 days based on data
        LocalDate today = LocalDate.now();
        List<Map<String, Object>> trends = new ArrayList<>();
        
        for (int i = 6; i >= 0; i--) {
            LocalDate date = today.minusDays(i);
            var records = attendanceRepository.findAll().stream()
                    .filter(a -> a.getDate().equals(date))
                    .collect(Collectors.toList());
                    
            long present = records.stream().filter(a -> a.getStatus() == AttendanceStatus.PRESENT).count();
            long absent = records.stream().filter(a -> a.getStatus() == AttendanceStatus.ABSENT).count();
            
            Map<String, Object> dayMap = new HashMap<>();
            dayMap.put("date", date.toString());
            dayMap.put("present", present);
            dayMap.put("absent", absent);
            trends.add(dayMap);
        }
        
        return ResponseEntity.ok(trends);
    }
}
