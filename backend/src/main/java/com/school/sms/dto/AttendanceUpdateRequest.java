package com.school.sms.dto;

import com.school.sms.model.AttendanceStatus;
import lombok.Data;
import java.time.LocalDate;
import java.util.List;

@Data
public class AttendanceUpdateRequest {
    private Long classId;
    private LocalDate date;
    private List<StudentAttendance> attendanceList;

    @Data
    public static class StudentAttendance {
        private Long studentId;
        private AttendanceStatus status;
        private String remarks;
    }
}
