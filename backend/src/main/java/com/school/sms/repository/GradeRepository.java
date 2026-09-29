package com.school.sms.repository;

import com.school.sms.model.Grade;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface GradeRepository extends JpaRepository<Grade, Long> {
    List<Grade> findByStudentId(Long studentId);
    List<Grade> findByExamIdAndSubjectId(Long examId, Long subjectId);
    Optional<Grade> findByStudentIdAndSubjectIdAndExamId(Long studentId, Long subjectId, Long examId);
}
