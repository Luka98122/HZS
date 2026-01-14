
from flask import Blueprint, jsonify, request
from models import OnboardingData, engine
from routes.auth import get_user_from_session
from sqlmodel import Session, select

onboarding_bp = Blueprint('onboarding', __name__)


@onboarding_bp.route("/onboarding", methods=["POST"])
def submit_onboarding():
    """Submit onboarding quiz data and generate recommendations"""
    user = get_user_from_session()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    if not user.id:
        return jsonify({"error": "User not found"}), 404

    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Invalid or missing JSON"}), 400

    categories = data.get("categories", [])
    physical_goals = data.get("physical_goals", {})
    study_goals = data.get("study_goals", {})
    focus_goals = data.get("focus_goals", {})
    stress_goals = data.get("stress_goals", {})

    # TODO: Ovo je samo PLACEHOLDER za sada. Prevesti na srpski.
    recommendations = []
    if "physical" in categories:
        recommendations.append("Start with 3 workout sessions per week and track your water intake daily.")
    if "study" in categories:
        recommendations.append("Use the Pomodoro technique: 25 minutes of focused work, 5 minute breaks.")
    if "focus" in categories:
        recommendations.append("Practice breathing exercises for 5 minutes each morning.")
    if "stress" in categories:
        recommendations.append("Check in with your mood daily and journal when feeling overwhelmed.")

    recommendations_text = " ".join(recommendations)

    try:
        with Session(engine) as session:
            existing = session.exec(
                select(OnboardingData).where(OnboardingData.user_id == user.id)
            ).first()

            if existing:
                existing.categories = categories
                existing.physical_goals = physical_goals
                existing.study_goals = study_goals
                existing.focus_goals = focus_goals
                existing.stress_goals = stress_goals
                existing.recommendations = recommendations_text
                session.add(existing)
            else:
                onboarding = OnboardingData(
                    user_id=user.id,
                    categories=categories,
                    physical_goals=physical_goals,
                    study_goals=study_goals,
                    focus_goals=focus_goals,
                    stress_goals=stress_goals,
                    recommendations=recommendations_text
                )
                session.add(onboarding)

            session.commit()

            return jsonify({
                "message": "Onboarding completed successfully",
                "recommendations": recommendations_text
            }), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@onboarding_bp.route("/onboarding", methods=["GET"])
def get_onboarding():
    """Get saved onboarding data for the current user"""
    user = get_user_from_session()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    if not user.id:
        return jsonify({"error": "User not found"}), 404

    try:
        with Session(engine) as session:
            onboarding = session.exec(
                select(OnboardingData).where(OnboardingData.user_id == user.id)
            ).first()

            if not onboarding:
                return jsonify({"error": "No onboarding data found"}), 404

            return jsonify({
                "categories": onboarding.categories,
                "physical_goals": onboarding.physical_goals,
                "study_goals": onboarding.study_goals,
                "focus_goals": onboarding.focus_goals,
                "stress_goals": onboarding.stress_goals,
                "recommendations": onboarding.recommendations,
                "completed_at": onboarding.completed_at.isoformat()
            }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
