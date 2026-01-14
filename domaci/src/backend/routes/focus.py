from datetime import date, datetime, timedelta

from flask import Blueprint, jsonify, request
from models import FocusSession, GratitudeEntry, engine
from routes.auth import get_user_from_session
from sqlmodel import Session, desc, select

focus_bp = Blueprint('focus', __name__, url_prefix='/api')

@focus_bp.route("/focus/session", methods=["POST"])
def create_focus_session():
    """Create a new focus session (breathing, meditation, or ambient)"""
    user = get_user_from_session()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    if not user.id:
        return jsonify({"error": "User not found"}), 404

    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Invalid or missing JSON"}), 400

    session_type = data.get("session_type")
    duration = data.get("duration")
    breathing_pattern = data.get("breathing_pattern")
    ambient_sound = data.get("ambient_sound")

    if not session_type or duration is None:
        return jsonify({"error": "session_type and duration are required"}), 400

    valid_types = ["breathing", "meditation", "ambient"]
    if session_type not in valid_types:
        return jsonify({"error": f"session_type must be one of {valid_types}"}), 400

    try:
        with Session(engine) as session:
            focus = FocusSession(
                user_id=user.id,
                session_type=session_type,
                duration=duration,
                breathing_pattern=breathing_pattern,
                ambient_sound=ambient_sound
            )
            session.add(focus)
            session.commit()
            session.refresh(focus)

            return jsonify({
                "message": "Focus session created successfully",
                "session": {
                    "id": focus.id,
                    "session_type": focus.session_type,
                    "duration": focus.duration,
                    "completed_at": focus.completed_at.isoformat()
                }
            }), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@focus_bp.route("/focus/history", methods=["GET"])
def get_focus_history():
    """Get last 20 focus sessions for the current user"""
    user = get_user_from_session()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    if not user.id:
        return jsonify({"error": "User not found"}), 404

    try:
        with Session(engine) as session:
            sessions = session.exec(
                select(FocusSession)
                .where(FocusSession.user_id == user.id)
                .order_by(desc(FocusSession.completed_at))
                .limit(20)
            ).all()

            history = [
                {
                    "id": s.id,
                    "session_type": s.session_type,
                    "duration": s.duration,
                    "breathing_pattern": s.breathing_pattern,
                    "ambient_sound": s.ambient_sound,
                    "completed_at": s.completed_at.isoformat()
                }
                for s in sessions
            ]

            return jsonify({"sessions": history}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Gratitude journal

@focus_bp.route("/gratitude", methods=["POST"])
def create_gratitude_entry():
    """Create a new gratitude journal entry"""
    user = get_user_from_session()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    if not user.id:
        return jsonify({"error": "User not found"}), 404

    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Invalid or missing JSON"}), 400

    entry_text = data.get("entry_text")
    date_str = data.get("date")

    if not entry_text or not date_str:
        return jsonify({"error": "entry_text and date are required"}), 400

    if len(entry_text) > 5000:
        return jsonify({"error": "Entry text must be 5000 characters or less"}), 400

    try:
        entry_date = datetime.strptime(date_str, "%Y-%m-%d").date()
    except ValueError:
        return jsonify({"error": "Invalid date format. Use YYYY-MM-DD"}), 400

    try:
        with Session(engine) as session:
            entry = GratitudeEntry(
                user_id=user.id,
                entry_text=entry_text,
                date=entry_date
            )
            session.add(entry)
            session.commit()
            session.refresh(entry)

            return jsonify({
                "message": "Gratitude entry created successfully",
                "entry": {
                    "id": entry.id,
                    "entry_text": entry.entry_text,
                    "date": entry.date.isoformat(),
                    "created_at": entry.created_at.isoformat()
                }
            }), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@focus_bp.route("/gratitude/recent", methods=["GET"])
def get_recent_gratitude():
    """Get gratitude entries from the last 7 days"""
    user = get_user_from_session()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    if not user.id:
        return jsonify({"error": "User not found"}), 404

    try:
        with Session(engine) as session:
            week_ago = date.today() - timedelta(days=6)

            entries = session.exec(
                select(GratitudeEntry)
                .where(
                    GratitudeEntry.user_id == user.id,
                    GratitudeEntry.date >= week_ago
                )
                .order_by(desc(GratitudeEntry.date))
            ).all()

            recent = [
                {
                    "id": e.id,
                    "entry_text": e.entry_text,
                    "date": e.date.isoformat(),
                    "created_at": e.created_at.isoformat()
                }
                for e in entries
            ]

            return jsonify({"entries": recent}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
