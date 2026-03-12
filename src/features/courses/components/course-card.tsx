import { CourseAdminCard } from './course-admin-card';
import type { AdminCourse } from '../types/admin-course.types';

interface Props {
  course: AdminCourse;
  index?: number;
}

export function CourseCard({ course, index = 0 }: Props) {
  return <CourseAdminCard course={course} index={index} view='grid' />;
}
