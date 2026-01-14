from datetime import date, datetime, timedelta

from flask import Blueprint, jsonify, request
from models import Exercise, StretchReminder, WaterIntake, WorkoutSession, engine
from routes.auth import get_user_from_session
from sqlmodel import Session, asc, desc, select

workout_bp = Blueprint('workout', __name__)

# Workout session

@workout_bp.route("/workout/start", methods=["POST"])
def start_workout():
    """Start a new workout session"""
    user = get_user_from_session()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    if not user.id:
        return jsonify({"error": "User not found"}), 404

    try:
        with Session(engine) as session:
            workout = WorkoutSession(user_id=user.id)
            session.add(workout)
            session.commit()
            session.refresh(workout)

            return jsonify({
                "session_id": workout.id,
                "start_time": workout.start_time.isoformat()
            }), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@workout_bp.route("/workout/<int:session_id>/exercise", methods=["POST"])
def log_exercise(session_id: int):
    """Log an exercise to a workout session"""
    user = get_user_from_session()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    if not user.id:
        return jsonify({"error": "User not found"}), 404

    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Invalid or missing JSON"}), 400

    exercise_type = data.get("exercise_type")
    reps = data.get("reps")
    duration = data.get("duration")
    calories_burned = data.get("calories_burned")

    if not all([exercise_type, reps is not None, duration is not None, calories_burned is not None]):
        return jsonify({"error": "All fields are required"}), 400

    if not (0 <= reps <= 1000):
        return jsonify({"error": "Reps must be between 0 and 1000"}), 400

    try:
        with Session(engine) as session:
            workout = session.get(WorkoutSession, session_id)
            if not workout or workout.user_id != user.id:
                return jsonify({"error": "Workout session not found"}), 404

            exercise = Exercise(
                session_id=session_id,
                exercise_type=exercise_type,
                reps=reps,
                duration=duration,
                calories_burned=calories_burned
            )
            session.add(exercise)

            workout.total_calories_burned += calories_burned
            session.add(workout)

            session.commit()
            session.refresh(exercise)

            return jsonify({
                "message": "Exercise logged successfully",
                "exercise_id": exercise.id,
                "completed_at": exercise.completed_at.isoformat()
            }), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@workout_bp.route("/workout/<int:session_id>/complete", methods=["POST"])
def complete_workout(session_id: int):
    """Complete a workout session"""
    user = get_user_from_session()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    if not user.id:
        return jsonify({"error": "User not found"}), 404

    try:
        with Session(engine) as session:
            workout = session.get(WorkoutSession, session_id)
            if not workout or workout.user_id != user.id:
                return jsonify({"error": "Workout session not found"}), 404

            workout.end_time = datetime.now()
            workout.total_duration = int((workout.end_time - workout.start_time).total_seconds())

            session.add(workout)
            session.commit()
            session.refresh(workout)

            return jsonify({
                "message": "Workout completed successfully",
                "total_duration": workout.total_duration,
                "total_calories": workout.total_calories_burned
            }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@workout_bp.route("/workout/history", methods=["GET"])
def get_workout_history():
    """Get last 20 workout sessions for the current user"""
    user = get_user_from_session()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    if not user.id:
        return jsonify({"error": "User not found"}), 404

    try:
        with Session(engine) as session:
            workouts = session.exec(
                select(WorkoutSession)
                .where(WorkoutSession.user_id == user.id)
                .order_by(desc(WorkoutSession.start_time))
                .limit(20)
            ).all()

            history = []
            for workout in workouts:
                exercises = session.exec(
                    select(Exercise).where(Exercise.session_id == workout.id)
                ).all()

                history.append({
                    "id": workout.id,
                    "start_time": workout.start_time.isoformat(),
                    "end_time": workout.end_time.isoformat() if workout.end_time else None,
                    "total_duration": workout.total_duration,
                    "total_calories_burned": workout.total_calories_burned,
                    "exercises": [
                        {
                            "id": ex.id,
                            "exercise_type": ex.exercise_type,
                            "reps": ex.reps,
                            "duration": ex.duration,
                            "calories_burned": ex.calories_burned,
                            "completed_at": ex.completed_at.isoformat()
                        }
                        for ex in exercises
                    ]
                })

            return jsonify({"workouts": history}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Water intake

@workout_bp.route("/water", methods=["POST"])
def log_water():
    """Log water intake for a specific date"""
    user = get_user_from_session()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    if not user.id:
        return jsonify({"error": "User not found"}), 404

    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Invalid or missing JSON"}), 400

    glasses = data.get("glasses")
    date_str = data.get("date")

    if glasses is None or not date_str:
        return jsonify({"error": "glasses and date are required"}), 400

    if not (0 <= glasses <= 20):
        return jsonify({"error": "Glasses must be between 0 and 20"}), 400

    try:
        intake_date = datetime.strptime(date_str, "%Y-%m-%d").date()
    except ValueError:
        return jsonify({"error": "Invalid date format. Use YYYY-MM-DD"}), 400

    try:
        with Session(engine) as session:
            # Proveri da li već postoji:
            existing = session.exec(
                select(WaterIntake).where(
                    WaterIntake.user_id == user.id,
                    WaterIntake.date == intake_date
                )
            ).first()

            if existing:
                existing.glasses = glasses
                existing.logged_at = datetime.now()
                session.add(existing)
            else:
                water = WaterIntake(
                    user_id=user.id,
                    glasses=glasses,
                    date=intake_date
                )
                session.add(water)

            session.commit()

            return jsonify({
                "message": "Water intake logged successfully",
                "glasses": glasses,
                "date": date_str
            }), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@workout_bp.route("/water/today", methods=["GET"])
def get_water_today():
    """Get water intake for today"""
    user = get_user_from_session()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    if not user.id:
        return jsonify({"error": "User not found"}), 404

    try:
        with Session(engine) as session:
            today = date.today()
            water = session.exec(
                select(WaterIntake).where(
                    WaterIntake.user_id == user.id,
                    WaterIntake.date == today
                )
            ).first()

            if not water:
                return jsonify({
                    "glasses": 0,
                    "date": today.isoformat()
                }), 200

            return jsonify({
                "glasses": water.glasses,
                "date": water.date.isoformat()
            }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@workout_bp.route("/water/week", methods=["GET"])
def get_water_week():
    """Get water intake for the last 7 days"""
    user = get_user_from_session()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    if not user.id:
        return jsonify({"error": "User not found"}), 404

    try:
        with Session(engine) as session:
            today = date.today()
            week_ago = today - timedelta(days=6)

            water_entries = session.exec(
                select(WaterIntake).where(
                    WaterIntake.user_id == user.id,
                    WaterIntake.date >= week_ago,
                    WaterIntake.date <= today
                ).order_by(asc(WaterIntake.date))
            ).all()

            water_dict = {entry.date: entry.glasses for entry in water_entries}

            # Za svih 7 dana...
            week_data = []
            for i in range(7):
                day = week_ago + timedelta(days=i)
                week_data.append({
                    "date": day.isoformat(),
                    "glasses": water_dict.get(day, 0)
                })

            return jsonify({"week": week_data}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Stretch reminder

@workout_bp.route("/stretch/remind", methods=["POST"])
def create_stretch_reminder():
    """Create a new stretch reminder"""
    user = get_user_from_session()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    if not user.id:
        return jsonify({"error": "User not found"}), 404

    try:
        with Session(engine) as session:
            reminder = StretchReminder(user_id=user.id)
            session.add(reminder)
            session.commit()
            session.refresh(reminder)

            return jsonify({
                "reminder_id": reminder.id,
                "reminded_at": reminder.reminded_at.isoformat()
            }), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@workout_bp.route("/stretch/<int:reminder_id>/complete", methods=["POST"])
def complete_stretch(reminder_id: int):
    """Mark a stretch reminder as completed"""
    user = get_user_from_session()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    if not user.id:
        return jsonify({"error": "User not found"}), 404

    try:
        with Session(engine) as session:
            reminder = session.get(StretchReminder, reminder_id)
            if not reminder or reminder.user_id != user.id:
                return jsonify({"error": "Reminder not found"}), 404

            reminder.completed = True
            reminder.completed_at = datetime.now()
            session.add(reminder)
            session.commit()

            return jsonify({
                "message": "Stretch completed successfully",
                "completed_at": reminder.completed_at.isoformat()
            }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
