from datetime import date, datetime, timedelta

from flask import Blueprint, jsonify
from models import (
    FocusSession,
    MoodCheckin,
    StudySession,
    StudyStreak,
    WaterIntake,
    WorkoutSession,
    engine,
)
from routes.auth import get_user_from_session
from sqlmodel import Session, func, select

dashboard_bp = Blueprint('dashboard', __name__, url_prefix='/api')

@dashboard_bp.route("/stats/overview", methods=["GET"])
def get_stats_overview():
    """Get aggregated stats for the dashboard"""
    user = get_user_from_session()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    if not user.id:
        return jsonify({"error": "User not found"}), 404

    try:
        with Session(engine) as session:
            today = date.today()
            week_ago = today - timedelta(days=6)
            week_ago_datetime = datetime.now() - timedelta(days=6)

            workouts_this_week = session.exec(
            	select(func.count()).select_from(WorkoutSession)
                .where(
                    WorkoutSession.user_id == user.id,
                    WorkoutSession.start_time >= week_ago_datetime
                )
            ).first() or 0

            study_duration = session.exec(
                select(func.sum(StudySession.total_duration))
                .where(
                    StudySession.user_id == user.id,
                    StudySession.start_time >= week_ago_datetime
                )
            ).first() or 0
            study_hours_this_week = round(study_duration / 3600, 2) if study_duration else 0.0

            streak = session.exec(
                select(StudyStreak).where(StudyStreak.user_id == user.id)
            ).first()
            current_study_streak = streak.current_streak if streak else 0

            avg_mood = session.exec(
                select(func.avg(MoodCheckin.mood_score))
                .where(
                    MoodCheckin.user_id == user.id,
                    MoodCheckin.created_at >= week_ago_datetime
                )
            ).first()
            avg_mood_7days = round(float(avg_mood), 2) if avg_mood else 0.0

            water_entries = session.exec(
                select(WaterIntake)
                .where(
                    WaterIntake.user_id == user.id,
                    WaterIntake.date >= week_ago,
                    WaterIntake.date <= today
                )
            ).all()

            total_glasses = sum(entry.glasses for entry in water_entries)
            water_avg_7days = round(total_glasses / 7, 2)

            focus_sessions_this_week = session.exec(
            	select(func.count()).select_from(FocusSession)
                .where(
                    FocusSession.user_id == user.id,
                    FocusSession.completed_at >= week_ago_datetime
                )
            ).first() or 0

            total_calories = session.exec(
                select(func.sum(WorkoutSession.total_calories_burned))
                .where(
                    WorkoutSession.user_id == user.id,
                    WorkoutSession.start_time >= week_ago_datetime
                )
            ).first() or 0
            total_calories_burned_week = round(float(total_calories), 2) if total_calories else 0.0

            return jsonify({
                "workouts_this_week": int(workouts_this_week),
                "study_hours_this_week": study_hours_this_week,
                "current_study_streak": current_study_streak,
                "avg_mood_7days": avg_mood_7days,
                "water_avg_7days": water_avg_7days,
                "focus_sessions_this_week": int(focus_sessions_this_week),
                "total_calories_burned_week": total_calories_burned_week
            }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
