package com.school.sms.controller;

import com.school.sms.dto.AttendanceDto;
import com.school.sms.dto.AttendanceUpdateRequest;
import com.school.sms.model.Attendance;
import com.school.sms.model.AttendanceStatus;
import com.school.sms.model.SchoolClass;
import com.school.sms.model.Student;
import com.school.sms.repository.AttendanceRepository;
import com.school.sms.repository.SchoolClassRepository;
import com.school.sms.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.HashMap;

@RestController
@RequestMapping("/api/attendance")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AttendanceController {

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private SchoolClassRepository classRepository;

    @Autowired
    private StudentRepository studentRepository;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER')")
    public ResponseEntity<?> saveAttendance(@RequestBody AttendanceUpdateRequest request) {
        SchoolClass schoolClass = classRepository.findById(request.getClassId())
                .orElseThrow(() -> new RuntimeException("Class not found"));

        for (AttendanceUpdateRequest.StudentAttendance sa : request.getAttendanceList()) {
            Student student = studentRepository.findById(sa.getStudentId())
                    .orElseThrow(() -> new RuntimeException("Student not found"));

            Attendance attendance = attendanceRepository.findByStudentIdAndDateAndSchoolClassId(
                    student.getId(), request.getDate(), schoolClass.getId()).orElse(new Attendance());

            attendance.setStudent(student);
            attendance.setSchoolClass(schoolClass);
            attendance.setDate(request.getDate());
            attendance.setStatus(sa.getStatus());
            attendance.setRemarks(sa.getRemarks());

            attendanceRepository.save(attendance);
        }

        return ResponseEntity.ok(Map.of("message", "Attendance saved successfully"));
    }

    @GetMapping("/class/{classId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER')")
    public ResponseEntity<List<AttendanceDto>> getClassAttendance(
            @PathVariable Long classId,
            @RequestParam(required = false) String date) {
        
        LocalDate queryDate = date != null ? LocalDate.parse(date) : LocalDate.now();
        List<Attendance> attendances = attendanceRepository.findBySchoolClassIdAndDate(classId, queryDate);
        
        // Also we might want to get all students for this class and return them even if attendance is not marked yet
        SchoolClass schoolClass = classRepository.findById(classId).orElseThrow(() -> new RuntimeException("Class not found"));
        List<Student> students = studentRepository.findAll().stream().filter(s -> s.getSchoolClass() != null && s.getSchoolClass().getId().equals(classId)).collect(Collectors.toList());

        Map<Long, Attendance> attendanceMap = attendances.stream().collect(Collectors.toMap(a -> a.getStudent().getId(), a -> a));

        List<AttendanceDto> result = students.stream().map(student -> {
            AttendanceDto dto = new AttendanceDto();
            dto.setStudentId(student.getId());
            dto.setStudentName(student.getFullName());
            dto.setAdmissionNumber(student.getAdmissionNumber());
            dto.setClassId(classId);
            dto.setDate(queryDate);
            
            if (attendanceMap.containsKey(student.getId())) {
                Attendance a = attendanceMap.get(student.getId());
                dto.setId(a.getId());
                dto.setStatus(a.getStatus());
                dto.setRemarks(a.getRemarks());
            }
            return dto;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER') or hasRole('STUDENT')")
    public ResponseEntity<List<AttendanceDto>> getStudentAttendance(@PathVariable Long studentId) {
        List<Attendance> attendances = attendanceRepository.findByStudentIdOrderByDateDesc(studentId);
        
        List<AttendanceDto> result = attendances.stream().map(a -> {
            AttendanceDto dto = new AttendanceDto();
            dto.setId(a.getId());
            dto.setStudentId(a.getStudent().getId());
            dto.setStudentName(a.getStudent().getFullName());
            dto.setAdmissionNumber(a.getStudent().getAdmissionNumber());
            dto.setClassId(a.getSchoolClass().getId());
            dto.setDate(a.getDate());
            dto.setStatus(a.getStatus());
            dto.setRemarks(a.getRemarks());
            return dto;
        }).collect(Collectors.toList());
        
        return ResponseEntity.ok(result);
    }

    @GetMapping("/reports/class/{classId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER')")
    public ResponseEntity<?> getClassReport(@PathVariable Long classId) {
        List<Attendance> attendances = attendanceRepository.findBySchoolClassId(classId);
        
        long total = attendances.size();
        long present = attendances.stream().filter(a -> a.getStatus() == AttendanceStatus.PRESENT).count();
        long absent = attendances.stream().filter(a -> a.getStatus() == AttendanceStatus.ABSENT).count();
        long late = attendances.stream().filter(a -> a.getStatus() == AttendanceStatus.LATE).count();
        long excused = attendances.stream().filter(a -> a.getStatus() == AttendanceStatus.EXCUSED).count();
        
        Map<String, Object> report = new HashMap<>();
        report.put("classId", classId);
        report.put("totalRecords", total);
        report.put("present", present);
        report.put("absent", absent);
        report.put("late", late);
        report.put("excused", excused);
        report.put("presentPercentage", total > 0 ? (double) present / total * 100 : 0);
        
        return ResponseEntity.ok(report);
    }
}
