from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

class StudentBase(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    group_name: str

class StudentCreate(StudentBase):
    pass

class StudentResponse(StudentBase):
    id: int

    class Config:
        from_attributes = True

class CourseBase(BaseModel):
    title: str
    description: Optional[str] = None
    teacher_id: int

class CourseCreate(CourseBase):
    pass

class CourseResponse(CourseBase):
    id: int

    class Config:
        from_attributes = True

class GradeBase(BaseModel):
    student_id: int
    course_id: int
    score: int

class GradeCreate(GradeBase):
    pass

class GradeResponse(GradeBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class TeacherBase(BaseModel):
    first_name: str
    last_name: str
    department: str

class TeacherCreate(TeacherBase):
    pass

class TeacherResponse(TeacherBase):
    id: int

    class Config:
        from_attributes = True