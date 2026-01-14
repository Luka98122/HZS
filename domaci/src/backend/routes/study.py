from datetime import date, datetime, timedelta

from flask import Blueprint, jsonify, request
from models import StudySession, StudyStreak, StudyTask, engine
from routes.auth import get_user_from_session
from sqlmodel import Session, desc, select

study_bp = Blueprint('study', __name__, url_prefix='/api')


# Study session

@study_bp.route("/study/start", methods=["POST"])
def start_study():
    """Start a new study session"""
    user = get_user_from_session()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    if not user.id:
        return jsonify({"error": "User not found"}), 404

    try:
        with Session(engine) as session:
            study = StudySession(user_id=user.id)
            session.add(study)
            session.commit()
            session.refresh(study)

            return jsonify({
                "session_id": study.id,
                "start_time": study.start_time.isoformat()
            }), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@study_bp.route("/study/<int:session_id>/distraction", methods=["POST"])
def log_distraction(session_id: int):
    """Increment distraction counter for a study session"""
    user = get_user_from_session()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    if not user.id:
        return jsonify({"error": "User not found"}), 404

    try:
        with Session(engine) as session:
            study = session.get(StudySession, session_id)
            if not study or study.user_id != user.id:
                return jsonify({"error": "Study session not found"}), 404

            study.distraction_count += 1
            session.add(study)
            session.commit()

            return jsonify({
                "message": "Distraction logged",
                "distraction_count": study.distraction_count
            }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@study_bp.route("/study/<int:session_id>/pomodoro", methods=["POST"])
def log_pomodoro(session_id: int):
    """Increment pomodoro counter for a study session"""
    user = get_user_from_session()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    if not user.id:
        return jsonify({"error": "User not found"}), 404

    try:
        with Session(engine) as session:
            study = session.get(StudySession, session_id)
            if not study or study.user_id != user.id:
                return jsonify({"error": "Study session not found"}), 404

            study.pomodoro_count += 1
            session.add(study)
            session.commit()

            return jsonify({
                "message": "Pomodoro completed",
                "pomodoro_count": study.pomodoro_count
            }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@study_bp.route("/study/<int:session_id>/complete", methods=["POST"])
def complete_study(session_id: int):
    """Complete a study session and update streak"""
    user = get_user_from_session()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    if not user.id:
        return jsonify({"error": "User not found"}), 404

    try:
        with Session(engine) as session:
            study = session.get(StudySession, session_id)
            if not study or study.user_id != user.id:
                return jsonify({"error": "Study session not found"}), 404

            study.end_time = datetime.now()
            study.total_duration = int((study.end_time - study.start_time).total_seconds())
            session.add(study)

            # Apdejtuj streak:
            today = date.today()
            streak = session.exec(
                select(StudyStreak).where(StudyStreak.user_id == user.id)
            ).first()

            if not streak:
                streak = StudyStreak(
                    user_id=user.id,
                    current_streak=1,
                    longest_streak=1,
                    last_study_date=today
                )
            else:
                if streak.last_study_date == today:
                    pass
                elif streak.last_study_date == today - timedelta(days=1):
                    # Učio juče? Onda povećaj streak:
                    streak.current_streak += 1
                    if streak.current_streak > streak.longest_streak:
                        streak.longest_streak = streak.current_streak
                    streak.last_study_date = today
                else:
                    streak.current_streak = 1
                    streak.last_study_date = today

            session.add(streak)
            session.commit()
            session.refresh(study)

            return jsonify({
                "message": "Study session completed",
                "total_duration": study.total_duration,
                "pomodoro_count": study.pomodoro_count,
                "distraction_count": study.distraction_count
            }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@study_bp.route("/study/history", methods=["GET"])
def get_study_history():
    """Get last 20 study sessions for the current user"""
    user = get_user_from_session()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    if not user.id:
        return jsonify({"error": "User not found"}), 404

    try:
        with Session(engine) as session:
            studies = session.exec(
                select(StudySession)
                .where(StudySession.user_id == user.id)
                .order_by(desc(StudySession.start_time))
                .limit(20)
            ).all()

            history = [
                {
                    "id": s.id,
                    "start_time": s.start_time.isoformat(),
                    "end_time": s.end_time.isoformat() if s.end_time else None,
                    "total_duration": s.total_duration,
                    "pomodoro_count": s.pomodoro_count,
                    "distraction_count": s.distraction_count
                }
                for s in studies
            ]

            return jsonify({"sessions": history}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Study task

@study_bp.route("/study/task", methods=["POST"])
def create_task():
    """Create a new study task"""
    user = get_user_from_session()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    if not user.id:
        return jsonify({"error": "User not found"}), 404

    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Invalid or missing JSON"}), 400

    task_name = data.get("task_name")
    estimated_time = data.get("estimated_time")

    if not task_name or estimated_time is None:
        return jsonify({"error": "task_name and estimated_time are required"}), 400

    # Validate task name length
    if len(task_name) > 200:
        return jsonify({"error": "Task name must be 200 characters or less"}), 400

    try:
        with Session(engine) as session:
            task = StudyTask(
                user_id=user.id,
                task_name=task_name,
                estimated_time=estimated_time
            )
            session.add(task)
            session.commit()
            session.refresh(task)

            return jsonify({
                "message": "Task created successfully",
                "task": {
                    "id": task.id,
                    "task_name": task.task_name,
                    "estimated_time": task.estimated_time,
                    "completed": task.completed,
                    "created_at": task.created_at.isoformat()
                }
            }), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@study_bp.route("/study/tasks", methods=["GET"])
def get_tasks():
    """Get all study tasks (pending and completed) for the current user"""
    user = get_user_from_session()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    if not user.id:
        return jsonify({"error": "User not found"}), 404

    try:
        with Session(engine) as session:
            all_tasks = session.exec(
                select(StudyTask)
                .where(StudyTask.user_id == user.id)
                .order_by(desc(StudyTask.created_at))
            ).all()

            pending = []
            completed = []

            for task in all_tasks:
                task_data = {
                    "id": task.id,
                    "task_name": task.task_name,
                    "estimated_time": task.estimated_time,
                    "actual_time": task.actual_time,
                    "completed": task.completed,
                    "created_at": task.created_at.isoformat(),
                    "completed_at": task.completed_at.isoformat() if task.completed_at else None
                }

                if task.completed:
                    completed.append(task_data)
                else:
                    pending.append(task_data)

            return jsonify({
                "pending": pending,
                "completed": completed
            }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@study_bp.route("/study/task/<int:task_id>", methods=["PUT"])
def update_task(task_id: int):
    """Update a study task (mark as completed or update actual time)"""
    user = get_user_from_session()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    if not user.id:
        return jsonify({"error": "User not found"}), 404

    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Invalid or missing JSON"}), 400

    try:
        with Session(engine) as session:
            task = session.get(StudyTask, task_id)
            if not task or task.user_id != user.id:
                return jsonify({"error": "Task not found"}), 404

            if "completed" in data:
                task.completed = data["completed"]
                if task.completed and not task.completed_at:
                    task.completed_at = datetime.now()
                elif not task.completed:
                    task.completed_at = None

            if "actual_time" in data:
                task.actual_time = data["actual_time"]

            session.add(task)
            session.commit()
            session.refresh(task)

            return jsonify({
                "message": "Task updated successfully",
                "task": {
                    "id": task.id,
                    "task_name": task.task_name,
                    "estimated_time": task.estimated_time,
                    "actual_time": task.actual_time,
                    "completed": task.completed,
                    "completed_at": task.completed_at.isoformat() if task.completed_at else None
                }
            }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@study_bp.route("/study/task/<int:task_id>", methods=["DELETE"])
def delete_task(task_id: int):
    """Delete a study task"""
    user = get_user_from_session()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    if not user.id:
        return jsonify({"error": "User not found"}), 404

    try:
        with Session(engine) as session:
            task = session.get(StudyTask, task_id)
            if not task or task.user_id != user.id:
                return jsonify({"error": "Task not found"}), 404

            session.delete(task)
            session.commit()

            return jsonify({"message": "Task deleted successfully"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Study streak

@study_bp.route("/study/streak", methods=["GET"])
def get_streak():
    """Get study streak information for the current user"""
    user = get_user_from_session()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    if not user.id:
        return jsonify({"error": "User not found"}), 404

    try:
        with Session(engine) as session:
            streak = session.exec(
                select(StudyStreak).where(StudyStreak.user_id == user.id)
            ).first()

            if not streak:
                return jsonify({
                    "current_streak": 0,
                    "longest_streak": 0,
                    "last_study_date": None
                }), 200

            return jsonify({
                "current_streak": streak.current_streak,
                "longest_streak": streak.longest_streak,
                "last_study_date": streak.last_study_date.isoformat() if streak.last_study_date else None
            }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
