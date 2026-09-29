package com.school.sms.repository;

import com.school.sms.model.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    List<Attendance> findBySchoolClassIdAndDate(Long classId, LocalDate date);
    List<Attendance> findByStudentIdOrderByDateDesc(Long studentId);
    Optional<Attendance> findByStudentIdAndDateAndSchoolClassId(Long studentId, LocalDate date, Long classId);
    List<Attendance> findBySchoolClassId(Long classId);
}
