package com.school.sms.dto;

import com.school.sms.model.AttendanceStatus;
import lombok.Data;
import java.time.LocalDate;

@Data
public class AttendanceDto {
    private Long id;
    private Long studentId;
    private String studentName;
    private String admissionNumber;
    private Long classId;
    private LocalDate date;
    private AttendanceStatus status;
    private String remarks;
}
