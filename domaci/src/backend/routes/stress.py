from datetime import datetime, timedelta

from flask import Blueprint, jsonify, request
from models import MoodCheckin, StressJournal, engine
from routes.auth import get_user_from_session
from sqlmodel import Session, func, select, desc

stress_bp = Blueprint('stress', __name__, url_prefix='/api')

# Mood check-in

@stress_bp.route("/mood", methods=["POST"])
def create_mood_checkin():
    """Create a new mood check-in"""
    user = get_user_from_session()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    if not user.id:
        return jsonify({"error": "User not found"}), 404

    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Invalid or missing JSON"}), 400

    mood_score = data.get("mood_score")
    notes = data.get("notes")

    if mood_score is None:
        return jsonify({"error": "mood_score is required"}), 400

    if not (1 <= mood_score <= 5):
        return jsonify({"error": "mood_score must be between 1 and 5"}), 400

    if notes and len(notes) > 5000:
        return jsonify({"error": "Notes must be 5000 characters or less"}), 400

    try:
        with Session(engine) as session:
            mood = MoodCheckin(
                user_id=user.id,
                mood_score=mood_score,
                notes=notes
            )
            session.add(mood)
            session.commit()
            session.refresh(mood)

            return jsonify({
                "message": "Mood check-in created successfully",
                "mood": {
                    "id": mood.id,
                    "mood_score": mood.mood_score,
                    "notes": mood.notes,
                    "created_at": mood.created_at.isoformat()
                }
            }), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@stress_bp.route("/mood/recent", methods=["GET"])
def get_recent_moods():
    """Get mood check-ins from the last 14 days"""
    user = get_user_from_session()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    if not user.id:
        return jsonify({"error": "User not found"}), 404

    try:
        with Session(engine) as session:
            two_weeks_ago = datetime.now() - timedelta(days=13)

            moods = session.exec(
                select(MoodCheckin)
                .where(
                    MoodCheckin.user_id == user.id,
                    MoodCheckin.created_at >= two_weeks_ago
                )
                .order_by(desc(MoodCheckin.created_at))
            ).all()

            recent = [
                {
                    "id": m.id,
                    "mood_score": m.mood_score,
                    "notes": m.notes,
                    "created_at": m.created_at.isoformat()
                }
                for m in moods
            ]

            return jsonify({"moods": recent}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@stress_bp.route("/mood/average", methods=["GET"])
def get_mood_average():
    """Get average mood score for the last 7 days"""
    user = get_user_from_session()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    if not user.id:
        return jsonify({"error": "User not found"}), 404

    try:
        with Session(engine) as session:
            week_ago = datetime.now() - timedelta(days=6)

            # Izračunaj prosek
            result = session.exec(
                select(func.avg(MoodCheckin.mood_score))
                .where(
                    MoodCheckin.user_id == user.id,
                    MoodCheckin.created_at >= week_ago
                )
            ).first()

            # Resultat je None ako nema moods
            average = float(result) if result else 0.0

            return jsonify({
                "average": round(average, 2),
                "period": "7days"
            }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Stress journal

@stress_bp.route("/journal", methods=["POST"])
def create_journal_entry():
    """Create a new stress journal entry"""
    user = get_user_from_session()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    if not user.id:
        return jsonify({"error": "User not found"}), 404

    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Invalid or missing JSON"}), 400

    entry_text = data.get("entry_text")

    if not entry_text:
        return jsonify({"error": "entry_text is required"}), 400

    if len(entry_text) > 5000:
        return jsonify({"error": "Entry text must be 5000 characters or less"}), 400

    try:
        with Session(engine) as session:
            entry = StressJournal(
                user_id=user.id,
                entry_text=entry_text
            )
            session.add(entry)
            session.commit()
            session.refresh(entry)

            return jsonify({
                "message": "Journal entry created successfully",
                "entry": {
                    "id": entry.id,
                    "entry_text": entry.entry_text,
                    "created_at": entry.created_at.isoformat()
                }
            }), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@stress_bp.route("/journal/recent", methods=["GET"])
def get_recent_journal_entries():
    """Get the last 10 journal entries"""
    user = get_user_from_session()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    if not user.id:
        return jsonify({"error": "User not found"}), 404

    try:
        with Session(engine) as session:
            entries = session.exec(
                select(StressJournal)
                .where(StressJournal.user_id == user.id)
                .order_by(desc(StressJournal.created_at))
                .limit(10)
            ).all()

            recent = [
                {
                    "id": e.id,
                    "entry_text": e.entry_text,
                    "created_at": e.created_at.isoformat()
                }
                for e in entries
            ]

            return jsonify({"entries": recent}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@stress_bp.route("/journal/<int:entry_id>", methods=["GET"])
def get_journal_entry(entry_id: int):
    """Get a specific journal entry"""
    user = get_user_from_session()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    if not user.id:
        return jsonify({"error": "User not found"}), 404

    try:
        with Session(engine) as session:
            entry = session.get(StressJournal, entry_id)
            if not entry or entry.user_id != user.id:
                return jsonify({"error": "Journal entry not found"}), 404

            return jsonify({
                "entry": {
                    "id": entry.id,
                    "entry_text": entry.entry_text,
                    "created_at": entry.created_at.isoformat()
                }
            }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@stress_bp.route("/journal/<int:entry_id>", methods=["DELETE"])
def delete_journal_entry(entry_id: int):
    """Delete a journal entry"""
    user = get_user_from_session()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    if not user.id:
        return jsonify({"error": "User not found"}), 404

    try:
        with Session(engine) as session:
            entry = session.get(StressJournal, entry_id)
            if not entry or entry.user_id != user.id:
                return jsonify({"error": "Journal entry not found"}), 404

            session.delete(entry)
            session.commit()

            return jsonify({"message": "Journal entry deleted successfully"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
