import os
from datetime import date, datetime
from typing import Optional

from dotenv import load_dotenv
from sqlalchemy import JSON, TEXT
from sqlmodel import Column, Field, SQLModel, create_engine

load_dotenv()

DATABASE_URL = f"mysql+pymysql://{os.getenv('DB_USER')}:{os.getenv('DB_PASSWORD')}@{os.getenv('DB_HOST')}/{os.getenv('DB_NAME')}"

engine = create_engine(DATABASE_URL, echo=False)


# ==================== Core Tables ====================

class User(SQLModel, table=True):
    __tablename__ = "users" # type: ignore

    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(max_length=255)
    email: str = Field(max_length=255, unique=True)
    full_name: str = Field(max_length=255)
    password_hash: str = Field(max_length=255)
    created_at: datetime = Field(default_factory=datetime.now)


class SessionDB(SQLModel, table=True):
    __tablename__ = "sessions" # type: ignore

    session_uuid: str = Field(primary_key=True, max_length=255)
    user_id: int = Field(foreign_key="users.id")
    created_at: datetime = Field(default_factory=datetime.now)
    expires_at: datetime
    is_valid: bool = Field(default=True)


# ==================== Onboarding ====================

class OnboardingData(SQLModel, table=True):
    __tablename__ = "onboarding_data" # type: ignore

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", unique=True)
    categories: Optional[dict] = Field(default=None, sa_column=Column(JSON))
    physical_goals: Optional[dict] = Field(default=None, sa_column=Column(JSON))
    study_goals: Optional[dict] = Field(default=None, sa_column=Column(JSON))
    focus_goals: Optional[dict] = Field(default=None, sa_column=Column(JSON))
    stress_goals: Optional[dict] = Field(default=None, sa_column=Column(JSON))
    recommendations: Optional[str] = Field(default=None, sa_column=Column(TEXT))
    completed_at: datetime = Field(default_factory=datetime.now)


# ==================== Physical Health ====================

class WorkoutSession(SQLModel, table=True):
    __tablename__ = "workout_sessions" # type: ignore

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id")
    start_time: datetime = Field(default_factory=datetime.now)
    end_time: Optional[datetime] = None
    total_duration: int = Field(default=0)  # u sekundama
    total_calories_burned: float = Field(default=0.0)


class Exercise(SQLModel, table=True):
    __tablename__ = "exercises" # type: ignore

    id: Optional[int] = Field(default=None, primary_key=True)
    session_id: int = Field(foreign_key="workout_sessions.id")
    exercise_type: str = Field(max_length=255)  # pushup, squat, plank
    reps: int
    duration: int  # u sekundama
    calories_burned: float
    completed_at: datetime = Field(default_factory=datetime.now)


class WaterIntake(SQLModel, table=True):
    __tablename__ = "water_intake" # type: ignore

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id")
    glasses: int
    date: date
    logged_at: datetime = Field(default_factory=datetime.now)


class StretchReminder(SQLModel, table=True):
    __tablename__ = "stretch_reminders" # type: ignore

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id")
    reminded_at: datetime = Field(default_factory=datetime.now)
    completed: bool = Field(default=False)
    completed_at: Optional[datetime] = None


# ==================== Study Mode ====================

class StudySession(SQLModel, table=True):
    __tablename__ = "study_sessions" # type: ignore

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id")
    start_time: datetime = Field(default_factory=datetime.now)
    end_time: Optional[datetime] = None
    total_duration: int = Field(default=0)  # u sekundama
    pomodoro_count: int = Field(default=0)
    distraction_count: int = Field(default=0)


class StudyTask(SQLModel, table=True):
    __tablename__ = "study_tasks" # type: ignore

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id")
    session_id: Optional[int] = Field(default=None, foreign_key="study_sessions.id")
    task_name: str = Field(max_length=200)
    estimated_time: int  # u minutama
    actual_time: Optional[int] = None  # u minutama
    completed: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.now)
    completed_at: Optional[datetime] = None


class StudyStreak(SQLModel, table=True):
    __tablename__ = "study_streaks" # type: ignore

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", unique=True)
    current_streak: int = Field(default=0)
    longest_streak: int = Field(default=0)
    last_study_date: Optional[date] = None


# ==================== Focus Mode ====================

class FocusSession(SQLModel, table=True):
    __tablename__ = "focus_sessions" # type: ignore

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id")
    session_type: str = Field(max_length=255)
    duration: int  # u sekundama
    breathing_pattern: Optional[dict] = Field(default=None, sa_column=Column(JSON))
    ambient_sound: Optional[str] = Field(default=None, max_length=255)
    completed_at: datetime = Field(default_factory=datetime.now)


class GratitudeEntry(SQLModel, table=True):
    __tablename__ = "gratitude_entries" # type: ignore

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id")
    entry_text: str = Field(sa_column=Column(TEXT))
    created_at: datetime = Field(default_factory=datetime.now)
    date: date


# Stress

class MoodCheckin(SQLModel, table=True):
    __tablename__ = "mood_checkins" # type: ignore

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id")
    mood_score: int  # 1-5
    notes: Optional[str] = Field(default=None, sa_column=Column(TEXT))
    created_at: datetime = Field(default_factory=datetime.now)


class StressJournal(SQLModel, table=True):
    __tablename__ = "stress_journal" # type: ignore

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id")
    entry_text: str = Field(sa_column=Column(TEXT))
    created_at: datetime = Field(default_factory=datetime.now)

def init_db():
    """Create all tables in the database"""
    SQLModel.metadata.create_all(engine)
