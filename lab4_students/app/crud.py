from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app import models, schemas
from fastapi import HTTPException

async def create_student(db: AsyncSession, student: schemas.StudentCreate):
    db_student = models.Student(**student.model_dump())
    db.add(db_student)
    await db.commit()
    await db.refresh(db_student)
    return db_student

async def get_students(db: AsyncSession, skip: int = 0, limit: int = 100):
    result = await db.execute(select(models.Student).offset(skip).limit(limit))
    return result.scalars().all()

async def update_student(db: AsyncSession, student_id: int, student_update: schemas.StudentCreate):
    query = select(models.Student).where(models.Student.id == student_id)
    result = await db.execute(query)
    db_student = result.scalar_one_or_none()
    
    if not db_student:
        return None
        
    for key, value in student_update.model_dump().items():
        setattr(db_student, key, value)
        
    await db.commit()
    await db.refresh(db_student)
    return db_student

async def delete_student(db: AsyncSession, student_id: int):
    query = select(models.Student).where(models.Student.id == student_id)
    result = await db.execute(query)
    db_student = result.scalar_one_or_none()
    
    if not db_student:
        return None
        
    await db.delete(db_student)
    await db.commit()
    return db_student

async def create_course(db: AsyncSession, course: schemas.CourseCreate):
    db_course = models.Course(**course.model_dump())
    db.add(db_course)
    await db.commit()
    await db.refresh(db_course)
    return db_course

async def get_courses(db: AsyncSession, skip: int = 0, limit: int = 100):
    result = await db.execute(select(models.Course).offset(skip).limit(limit))
    return result.scalars().all()

async def update_course(db: AsyncSession, course_id: int, course_update: schemas.CourseCreate):
    query = select(models.Course).where(models.Course.id == course_id)
    result = await db.execute(query)
    db_course = result.scalar_one_or_none()
    if not db_course:
        return None
    for key, value in course_update.model_dump().items():
        setattr(db_course, key, value)
    await db.commit()
    await db.refresh(db_course)
    return db_course

async def delete_course(db: AsyncSession, course_id: int):
    query = select(models.Course).where(models.Course.id == course_id)
    result = await db.execute(query)
    db_course = result.scalar_one_or_none()
    if not db_course:
        return None
    await db.delete(db_course)
    await db.commit()
    return db_course

async def create_grade(db: AsyncSession, grade: schemas.GradeCreate):
    db_grade = models.Grade(**grade.model_dump())
    db.add(db_grade)
    await db.commit()
    await db.refresh(db_grade)
    return db_grade

async def get_grades(db: AsyncSession, skip: int = 0, limit: int = 100):
    result = await db.execute(select(models.Grade).offset(skip).limit(limit))
    return result.scalars().all()

async def update_grade(db: AsyncSession, grade_id: int, grade_update: schemas.GradeCreate):
    query = select(models.Grade).where(models.Grade.id == grade_id)
    result = await db.execute(query)
    db_grade = result.scalar_one_or_none()
    if not db_grade:
        return None
    for key, value in grade_update.model_dump().items():
        setattr(db_grade, key, value)
    await db.commit()
    await db.refresh(db_grade)
    return db_grade

async def delete_grade(db: AsyncSession, grade_id: int):
    query = select(models.Grade).where(models.Grade.id == grade_id)
    result = await db.execute(query)
    db_grade = result.scalar_one_or_none()
    if not db_grade:
        return None
    await db.delete(db_grade)
    await db.commit()
    return db_grade


async def create_teacher(db: AsyncSession, teacher: schemas.TeacherCreate):
    db_teacher = models.Teacher(**teacher.model_dump())
    db.add(db_teacher)
    await db.commit()
    await db.refresh(db_teacher)
    return db_teacher

async def get_teachers(db: AsyncSession, skip: int = 0, limit: int = 100):
    result = await db.execute(select(models.Teacher).offset(skip).limit(limit))
    return result.scalars().all()

async def update_teacher(db: AsyncSession, teacher_id: int, teacher_update: schemas.TeacherCreate):
    query = select(models.Teacher).where(models.Teacher.id == teacher_id)
    result = await db.execute(query)
    db_teacher = result.scalar_one_or_none()
    if not db_teacher:
        return None
    for key, value in teacher_update.model_dump().items():
        setattr(db_teacher, key, value)
    await db.commit()
    await db.refresh(db_teacher)
    return db_teacher

async def delete_teacher(db: AsyncSession, teacher_id: int):
    query = select(models.Teacher).where(models.Teacher.id == teacher_id)
    result = await db.execute(query)
    db_teacher = result.scalar_one_or_none()
    if not db_teacher:
        return None
    await db.delete(db_teacher)
    await db.commit()
    return db_teacher

# --- РІВЕНЬ 4: ТРАНЗАКЦІЙНІСТЬ (Атомарне виставлення оцінки та випуск студента) ---
async def assign_final_grade_and_archive(db: AsyncSession, student_id: int, course_id: int, score: int):
    """
    виставляє фінальну оцінку та змінює назву групи студента на 'GRADUATED'.
    Якщо виставлення оцінки впаде (наприклад, score > 100 через CheckConstraint),
    то група студента НЕ зміниться. Дані залишаться цілісними.
    """
    async with db.begin():
        new_grade = models.Grade(student_id=student_id, course_id=course_id, score=score)
        db.add(new_grade)
        
        query = select(models.Student).where(models.Student.id == student_id)
        result = await db.execute(query)
        student = result.scalar_one_or_none()
        
        if not student:
            raise HTTPException(status_code=404, detail="Student not found")
            
        student.group_name = "GRADUATED" 
        
        return {"student_id": student_id, "final_score": score, "status": "Archived & Graduated"}