import { describe, it, expect } from 'vitest';
import { academicService } from '../services/academicService';
import { AcademicRecord } from '../types';

describe('Academic Records and SGPA Calculations', () => {
  it('Calculates percentage and SGPA accurately when grades and credits are present', () => {
    const records: AcademicRecord[] = [
      {
        id: 'r1',
        mentee_id: 'm1',
        semester: 4,
        academic_year: '2025-2026',
        subject_code: '22CS401',
        subject_name: 'Algorithms',
        credits: 4.0,
        internal_marks: 45,
        external_marks: 45,
        total_marks: 90,
        maximum_marks: 100,
        grade: 'O', // 10 points * 4 credits = 40
        result_status: 'PASS',
        verification_status: 'verified',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'r2',
        mentee_id: 'm1',
        semester: 4,
        academic_year: '2025-2026',
        subject_code: '22CS402',
        subject_name: 'DBMS',
        credits: 4.0,
        internal_marks: 40,
        external_marks: 42,
        total_marks: 82,
        maximum_marks: 100,
        grade: 'A+', // 9 points * 4 credits = 36
        result_status: 'PASS',
        verification_status: 'verified',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    const summaries = academicService.calculateSummaries(records);
    expect(summaries.length).toBe(1);

    const sem4 = summaries[0];
    expect(sem4.semester).toBe(4);
    expect(sem4.totalSubjects).toBe(2);
    expect(sem4.passedSubjects).toBe(2);
    expect(sem4.totalObtainedMarks).toBe(172);
    expect(sem4.totalMaxMarks).toBe(200);
    expect(sem4.percentage).toBe(86);
    // (40 + 36) / 8 = 9.5
    expect(sem4.sgpa).toBe(9.5);
    expect(sem4.status).toBe('PASS');
  });

  it('Marks SGPA as null/unavailable rather than guessing when official grades are absent', () => {
    const unverifiedRecords: AcademicRecord[] = [
      {
        id: 'r3',
        mentee_id: 'm2',
        semester: 5,
        academic_year: '2025-2026',
        subject_code: '22CS501',
        subject_name: 'Software Engineering',
        credits: 3.0,
        internal_marks: 38,
        external_marks: null,
        total_marks: 38,
        maximum_marks: 50,
        grade: null, // No official grade assigned yet!
        result_status: 'PENDING',
        verification_status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    const summaries = academicService.calculateSummaries(unverifiedRecords);
    expect(summaries.length).toBe(1);
    expect(summaries[0].sgpa).toBeNull();
    expect(summaries[0].status).toBe('PENDING');
  });
});
