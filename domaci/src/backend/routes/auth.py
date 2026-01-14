import os
import uuid
from datetime import datetime, timedelta
from typing import Optional

from flask import Blueprint, jsonify, make_response, request
from models import SessionDB, User, engine
from sqlmodel import Session, select

is_production = os.getenv("ENV") != "development"

auth_bp = Blueprint('auth', __name__)


# ==================== Helper Functions ====================

def create_session(user_id: int) -> tuple[Optional[str], Optional[datetime]]:
    """Create a new session for a user and return the session UUID and expiration datetime."""
    session_uuid = str(uuid.uuid4())
    created_at = datetime.now()
    expires_at = created_at + timedelta(days=90)  # 3 months

    try:
        with Session(engine) as session:
            db_session = SessionDB(
                session_uuid=session_uuid,
                user_id=user_id,
                created_at=created_at,
                expires_at=expires_at,
                is_valid=True
            )
            session.add(db_session)
            session.commit()
            return session_uuid, expires_at
    except Exception as e:
        print("Error creating session:", e)
        return None, None


def get_user_from_session() -> Optional[User]:
    """Retrieves the user based on the sessid cookie."""
    sessid = request.cookies.get("sessid")
    if not sessid:
        return None

    try:
        with Session(engine) as session:
            # Check session validity
            db_session = session.exec(
                select(SessionDB).where(SessionDB.session_uuid == sessid)
            ).first()

            if not db_session or not db_session.is_valid:
                return None

            # Check expiration
            if db_session.expires_at < datetime.now():
                return None

            # Fetch user details
            user = session.get(User, db_session.user_id)
            return user

    except Exception as e:
        print("Error fetching user from session:", e)
        return None


# ==================== Routes ====================

@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json(silent=True)

    if not data:
        return jsonify({"error": "Invalid or missing JSON"}), 400

    username = data.get("username")
    email = data.get("email")
    full_name = data.get("full_name")
    password_hash = data.get("password_hash")

    if not all([username, email, full_name, password_hash]):
        return jsonify({"error": "All fields are required"}), 400

    try:
        with Session(engine) as session:
            # Check if email already exists
            existing_user = session.exec(
                select(User).where(User.email == email)
            ).first()

            if existing_user:
                return jsonify({"error": "Email already registered"}), 400

            # Create new user
            new_user = User(
                username=username,
                email=email,
                full_name=full_name,
                password_hash=password_hash
            )
            session.add(new_user)
            session.commit()
            session.refresh(new_user)

            if not new_user.id:
                return jsonify({"error": "User not found"}), 404
            user_id = new_user.id

        # Create session
        session_uuid, expires_at = create_session(user_id)
        if not session_uuid:
            return jsonify({"error": "Failed to create session"}), 500

        # Set cookie in response
        response = make_response(jsonify({
            "message": "User registered successfully",
            "user": {
                "id": user_id,
                "username": username,
                "email": email,
                "full_name": full_name
            }
        }), 201)
        response.set_cookie(
            "sessid",
            session_uuid,
            expires=expires_at,
            httponly=True,
            samesite="None" if is_production else "Lax",
            secure=is_production,
            domain=".hoi5.com" if is_production else None,
            path="/",
        )
        return response

    except Exception as e:
        return jsonify({"error": str(e)}), 400


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json(silent=True)

    if not data:
        return jsonify({"error": "Invalid or missing JSON"}), 400

    email = data.get("email")
    password_hash = data.get("password_hash")

    if not email or not password_hash:
        return jsonify({"error": "email and password_hash are required"}), 400

    try:
        with Session(engine) as session:
            # Find user by email and password
            user = session.exec(
                select(User).where(
                    User.email == email,
                    User.password_hash == password_hash
                )
            ).first()

            if not user:
                return jsonify({"error": "Invalid email or password"}), 401

            if not user.id:
                return jsonify({"error": "User not found"}), 404

            # Create session
            session_uuid, expires_at = create_session(user.id)
            if not session_uuid:
                return jsonify({"error": "Failed to create session"}), 500

            # Set cookie
            response = make_response(jsonify({
                "message": "Login successful",
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "full_name": user.full_name
                }
            }), 200)
            response.set_cookie(
                "sessid",
                session_uuid,
                expires=expires_at,
                httponly=True,
                samesite="None" if is_production else "Lax",
                secure=is_production,
                domain=".hoi5.com" if is_production else None,
                path="/",
            )
            return response

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@auth_bp.route("/logout", methods=["POST"])
def logout():
    sessid = request.cookies.get("sessid")

    # Invalidate session in database if it exists
    if sessid:
        try:
            with Session(engine) as session:
                db_session = session.exec(
                    select(SessionDB).where(SessionDB.session_uuid == sessid)
                ).first()

                if db_session:
                    db_session.is_valid = False
                    session.add(db_session)
                    session.commit()
        except Exception as e:
            print("Error invalidating session:", e)

    # Clear cookie
    response = make_response(jsonify({"message": "Logout successful"}), 200)
    response.set_cookie(
        "sessid",
        "",
        expires=0,
        httponly=True,
        samesite="None" if is_production else "Lax",
        secure=is_production,
        domain=".hoi5.com" if is_production else None,
        path="/"
    )
    return response


@auth_bp.route("/account", methods=["GET"])
def get_account():
    user = get_user_from_session()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    # Don't send password_hash back
    user_response = {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "full_name": user.full_name
    }
    return jsonify({"user": user_response}), 200


@auth_bp.route("/account", methods=["PUT"])
def update_account():
    user = get_user_from_session()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    if not user.id:
        return jsonify({"error": "User not found"}), 404

    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Invalid JSON"}), 400

    try:
        with Session(engine) as session:
            # Get fresh user object from this session
            db_user = session.get(User, user.id)
            if not db_user:
                return jsonify({"error": "User not found"}), 404

            # Update fields if provided
            if "username" in data:
                db_user.username = data["username"]
            if "email" in data:
                db_user.email = data["email"]
            if "full_name" in data:
                db_user.full_name = data["full_name"]
            if "password_hash" in data:
                db_user.password_hash = data["password_hash"]

            session.add(db_user)
            session.commit()
            session.refresh(db_user)

            return jsonify({
                "message": "Account updated successfully",
                "user": {
                    "id": db_user.id,
                    "username": db_user.username,
                    "email": db_user.email,
                    "full_name": db_user.full_name
                }
            }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@auth_bp.route("/account", methods=["DELETE"])
def delete_account():
    user = get_user_from_session()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    if not user.id:
        return jsonify({"error": "User not found"}), 404

    try:
        with Session(engine) as session:
            # Delete sessions first
            sessions_to_delete = session.exec(
                select(SessionDB).where(SessionDB.user_id == user.id)
            ).all()
            for sess in sessions_to_delete:
                session.delete(sess)

            # Delete user
            db_user = session.get(User, user.id)
            if db_user:
                session.delete(db_user)

            session.commit()

        # Clear cookie
        response = make_response(jsonify({"message": "Account deleted successfully"}), 200)
        response.set_cookie(
            "sessid",
            "",
            expires=0,
            httponly=True,
            samesite="None" if is_production else "Lax",
            secure=is_production,
            domain=".hoi5.com" if is_production else None,
            path="/"
        )
        return response

    except Exception as e:
        return jsonify({"error": str(e)}), 500
