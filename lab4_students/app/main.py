from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import engine, get_db
from app.models import Base
from app import crud, schemas
from app.redis_client import get_cached_data, set_cached_data, clear_cache 
import json
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="University Management System API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

@app.get("/")
def read_root():
    return {"message": "Ласкаво просимо до університетської системи!"}

@app.post("/students/", response_model=schemas.StudentResponse, status_code=201)
async def create_new_student(student: schemas.StudentCreate, db: AsyncSession = Depends(get_db)):
    return await crud.create_student(db=db, student=student)

@app.get("/students/", response_model=list[schemas.StudentResponse])
async def read_students(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
    return await crud.get_students(db=db, skip=skip, limit=limit)

@app.put("/students/{student_id}", response_model=schemas.StudentResponse)
async def update_existing_student(student_id: int, student_data: schemas.StudentCreate, db: AsyncSession = Depends(get_db)):
    updated_student = await crud.update_student(db=db, student_id=student_id, student_update=student_data)
    if not updated_student:
        raise HTTPException(status_code=404, detail="Student not found")
    return updated_student

@app.delete("/students/{student_id}", status_code=200)
async def delete_existing_student(student_id: int, db: AsyncSession = Depends(get_db)):
    deleted_student = await crud.delete_student(db=db, student_id=student_id)
    if not deleted_student:
        raise HTTPException(status_code=404, detail="Student not found")
    return {"message": f"Студента з ID {student_id} успішно видалено"}

@app.get("/courses/", response_model=list[schemas.CourseResponse])
async def read_courses(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
    cache_key = f"courses:{skip}:{limit}"
    
    cached_courses = get_cached_data(cache_key)
    if cached_courses:
        return cached_courses  
        
    courses = await crud.get_courses(db=db, skip=skip, limit=limit)
    
    courses_data = [schemas.CourseResponse.model_validate(c).model_dump() for c in courses]
    set_cached_data(cache_key, courses_data, expire=60)
    
    return courses

@app.post("/courses/", response_model=schemas.CourseResponse, status_code=201)
async def create_new_course(course: schemas.CourseCreate, db: AsyncSession = Depends(get_db)):
    clear_cache("courses:0:100") 
    return await crud.create_course(db=db, course=course)

@app.put("/courses/{course_id}", response_model=schemas.CourseResponse)
async def update_existing_course(course_id: int, course_data: schemas.CourseCreate, db: AsyncSession = Depends(get_db)):
    clear_cache("courses:0:100") 
    updated = await crud.update_course(db=db, course_id=course_id, course_update=course_data)
    if not updated:
        raise HTTPException(status_code=404, detail="Course not found")
    return updated

@app.delete("/courses/{course_id}", status_code=200)
async def delete_existing_course(course_id: int, db: AsyncSession = Depends(get_db)):
    try:
        clear_cache("courses:0:100")
        deleted = await crud.delete_course(db=db, course_id=course_id)
        if not deleted:
            raise HTTPException(status_code=404, detail="Course not found")
        return {"message": f"Курс з ID {course_id} успішно видалено"}
    except Exception:
        raise HTTPException(status_code=400, detail="Неможливо видалити курс, оскільки за ним вже закріплені оцінки студентів.")

@app.get("/grades/", response_model=list[schemas.GradeResponse])
async def read_grades(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
    cache_key = f"grades:{skip}:{limit}"
    
    cached_grades = get_cached_data(cache_key)
    if cached_grades:
        return cached_grades
        
    grades = await crud.get_grades(db=db, skip=skip, limit=limit)
    
    grades_data = []
    for g in grades:
        dumped = schemas.GradeResponse.model_validate(g).model_dump()
        dumped["created_at"] = dumped["created_at"].isoformat()
        grades_data.append(dumped)
        
    set_cached_data(cache_key, grades_data, expire=60)
    return grades

@app.post("/grades/", response_model=schemas.GradeResponse, status_code=201)
async def create_new_grade(grade: schemas.GradeCreate, db: AsyncSession = Depends(get_db)):
    clear_cache("grades:0:100")
    return await crud.create_grade(db=db, grade=grade)

@app.put("/grades/{grade_id}", response_model=schemas.GradeResponse)
async def update_existing_grade(grade_id: int, grade_data: schemas.GradeCreate, db: AsyncSession = Depends(get_db)):
    clear_cache("grades:0:100")
    updated = await crud.update_grade(db=db, grade_id=grade_id, grade_update=grade_data)
    if not updated:
        raise HTTPException(status_code=404, detail="Grade not found")
    return updated

@app.delete("/grades/{grade_id}", status_code=200)
async def delete_existing_grade(grade_id: int, db: AsyncSession = Depends(get_db)):
    clear_cache("grades:0:100")
    deleted = await crud.delete_grade(db=db, grade_id=grade_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Grade not found")
    return {"message": f"Оцінку з ID {grade_id} успішно видалено"}

@app.post("/teachers/", response_model=schemas.TeacherResponse, status_code=201)
async def create_new_teacher(teacher: schemas.TeacherCreate, db: AsyncSession = Depends(get_db)):
    return await crud.create_teacher(db=db, teacher=teacher)

@app.get("/teachers/", response_model=list[schemas.TeacherResponse])
async def read_teachers(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
    return await crud.get_teachers(db=db, skip=skip, limit=limit)

@app.put("/teachers/{teacher_id}", response_model=schemas.TeacherResponse)
async def update_existing_teacher(teacher_id: int, teacher_data: schemas.TeacherCreate, db: AsyncSession = Depends(get_db)):
    updated = await crud.update_teacher(db=db, teacher_id=teacher_id, teacher_update=teacher_data)
    if not updated:
        raise HTTPException(status_code=404, detail="Teacher not found")
    return updated

@app.delete("/teachers/{teacher_id}", status_code=200)
async def delete_existing_teacher(teacher_id: int, db: AsyncSession = Depends(get_db)):
    try:
        deleted = await crud.delete_teacher(db=db, teacher_id=teacher_id)
        if not deleted:
            raise HTTPException(status_code=404, detail="Teacher not found")
        return {"message": f"Викладача з ID {teacher_id} успішно видалено"}
    except Exception:
        raise HTTPException(status_code=400, detail="Неможливо видалити викладача, оскільки він прив'язаний до існуючих курсів.")

@app.post("/students/{student_id}/graduate", status_code=200)
async def graduate_student(student_id: int, course_id: int, score: int, db: AsyncSession = Depends(get_db)):
    try:
        result = await crud.assign_final_grade_and_archive(db=db, student_id=student_id, course_id=course_id, score=score)
        clear_cache("grades:0:100")
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Транзакцію скасовано: {str(e)}")