package com.school.sms.repository;

import com.school.sms.model.Student;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StudentRepository extends JpaRepository<Student, Long> {
    List<Student> findBySchoolClassId(Long classId);
    List<Student> findByFullNameContainingIgnoreCase(String name);
    boolean existsByAdmissionNumber(String admissionNumber);
}
