import { z } from 'zod';

export const profileSchema = z.object({
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional().nullable().refine((val) => {
    if (!val || val.trim() === '') return true;
    // Allow standard Indian/international mobile numbers (10 digits or with +91)
    return /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{7,12}$/.test(val.trim());
  }, 'Please enter a valid phone number (e.g., +91 9876543210 or 10 digits)'),
  department: z.string().min(2, 'Department is required'),
  branch: z.string().min(2, 'Branch is required'),
  usn: z.string().optional().nullable().refine((val) => {
    if (!val || val.trim() === '') return true;
    // NMAMIT USN format e.g. 4NM22CS001
    return /^[0-9][A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{3}$/i.test(val.trim()) || val.length >= 6;
  }, 'Please enter a valid college USN (e.g. 4NM22CS001)'),
  semester: z.coerce.number().min(1).max(8).optional().nullable(),
});

export type ProfileFormData = z.infer<typeof profileSchema>;

export const recommendationSchema = z.object({
  mentee_id: z.string().min(1, 'Please select a mentee'),
  title: z.string().min(3, 'Title must be at least 3 characters'),
  subject: z.string().min(2, 'Subject name/code is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  resource_type: z.enum(['url', 'document', 'note']),
  resource_url: z.string().optional().nullable().refine((val) => {
    if (!val || val.trim() === '') return true;
    try {
      new URL(val);
      return true;
    } catch {
      return false;
    }
  }, 'Please enter a valid URL (starting with https:// or http://)'),
  follow_up_date: z.string().optional().nullable(),
});

export type RecommendationFormData = z.infer<typeof recommendationSchema>;

export const academicRecordSchema = z.object({
  semester: z.coerce.number().min(1, 'Semester must be 1-8').max(8, 'Semester must be 1-8'),
  academic_year: z.string().min(4, 'Academic year required (e.g. 2025-2026)'),
  subject_code: z.string().min(2, 'Subject code required (e.g. 22CS501)'),
  subject_name: z.string().min(2, 'Subject name is required'),
  credits: z.coerce.number().min(1, 'Credits must be at least 1').max(10, 'Maximum credits is 10'),
  internal_marks: z.coerce.number().min(0, 'Internal marks cannot be negative').optional().nullable(),
  external_marks: z.coerce.number().min(0, 'External marks cannot be negative').optional().nullable(),
  maximum_marks: z.coerce.number().min(10, 'Maximum marks must be at least 10').max(200, 'Maximum marks cannot exceed 200'),
  grade: z.string().optional().nullable(),
}).refine((data) => {
  if (data.internal_marks != null && data.external_marks != null) {
    const total = data.internal_marks + data.external_marks;
    return total <= data.maximum_marks;
  }
  return true;
}, {
  message: 'Sum of internal and external marks cannot exceed maximum marks',
  path: ['external_marks'],
});

export type AcademicRecordFormData = z.infer<typeof academicRecordSchema>;

export const mentorNoteSchema = z.object({
  mentee_id: z.string().min(1, 'Select a mentee'),
  title: z.string().min(3, 'Title is required'),
  note_content: z.string().min(5, 'Observation note content is required'),
  subject: z.string().optional().nullable(),
  visibility: z.enum(['private', 'shared']),
});

export type MentorNoteFormData = z.infer<typeof mentorNoteSchema>;
