from flask import Flask, jsonify, request, make_response
from flask_cors import CORS
import time
import datetime
import mysql.connector
from mysql.connector import Error
import uuid
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__)

# ✅ Enable CORS for /api/* routes
CORS(
    app,
    resources={r"/api/*": {"origins": ["https://react.hoi5.com"]}},
    supports_credentials=True,
)

# --------------------
# Database connection
# --------------------
def get_db_connection():
    try:
        return mysql.connector.connect(
            host=os.getenv("DB_HOST", "127.0.0.1"),
            user=os.getenv("DB_USER"),
            password=os.getenv("DB_PASSWORD"),
            database=os.getenv("DB_NAME"),
            connection_timeout=int(os.getenv("DB_TIMEOUT", 5)),
        )
    except Error as e:
        print("❌ MySQL connection failed")
        print("Error type:", type(e))
        print("Error args:", e.args)
        raise

# --------------------
# Session helper
# --------------------
def create_session(user_id):
    """Create a new session for a user and return the session UUID and expiration datetime."""
    session_uuid = str(uuid.uuid4())
    created_at = datetime.datetime.now()
    expires_at = created_at + datetime.timedelta(days=90)  # 3 months
    is_valid = True

    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        query = """
        INSERT INTO sessions (session_uuid, user_id, created_at, expires_at, is_valid)
        VALUES (%s, %s, %s, %s, %s)
        """
        cursor.execute(query, (session_uuid, user_id, created_at, expires_at, is_valid))
        conn.commit()
        return session_uuid, expires_at
    except Error as e:
        print("Error creating session:", e)
        return None, None
    finally:
        if cursor is not None:
            cursor.close()
        if conn is not None and conn.is_connected():
            conn.close()

# --------------------
# Health / Time endpoints
# --------------------
x = 0

@app.route("/health", methods=["GET"])
def health():
    global x
    x += 1
    return jsonify({
        "status": "ok",
        "message": f"HZS API working. This is the {x}th request this session."
    }), 200

@app.route("/time", methods=["GET"])
def time_rn():
    global x
    x += 1
    return jsonify({
        "status": "ok",
        "text": f"The time right now is {time.time()}",
        "future": f"Five seconds into the future is {time.time() + 5}",
        "date": str(datetime.datetime.now())
    }), 200

# --------------------
# Register endpoint
# --------------------
@app.route("/register", methods=["POST"])
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
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # Insert user
        query = """
        INSERT INTO users (username, email, full_name, password_hash)
        VALUES (%s, %s, %s, %s)
        """
        cursor.execute(query, (username, email, full_name, password_hash))
        conn.commit()
        user_id = cursor.lastrowid

        # Create session
        session_uuid, expires_at = create_session(user_id)
        if not session_uuid:
            return jsonify({"error": "Failed to create session"}), 500

        # Set cookie in response
        response = make_response(jsonify({
            "message": "User registered successfully",
            "user": {"id": user_id, "username": username, "email": email, "full_name": full_name}
        }), 201)
        response.set_cookie(
            "sessid",
            session_uuid,
            expires=expires_at,
            httponly=True,
            samesite="None",
            secure=True,
            domain=".hoi5.com",
            path="/",
        )
        return response

    except Error as e:
        return jsonify({"error": str(e)}), 400

    finally:
        if cursor is not None:
            cursor.close()
        if conn is not None and conn.is_connected():
            conn.close()

# --------------------
# Login endpoint
# --------------------
@app.route("/login", methods=["POST"])
def login():
    data = request.get_json(silent=True)

    if not data:
        return jsonify({"error": "Invalid or missing JSON"}), 400

    email = data.get("email")
    password_hash = data.get("password_hash")

    if not email or not password_hash:
        return jsonify({"error": "email and password_hash are required"}), 400

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        query = """
        SELECT id, username, email, full_name
        FROM users
        WHERE email = %s AND password_hash = %s
        """
        cursor.execute(query, (email, password_hash))
        user = cursor.fetchone()

        if not user:
            return jsonify({"error": "Invalid email or password"}), 401

        # Create session
        session_uuid, expires_at = create_session(user["id"])
        if not session_uuid:
            return jsonify({"error": "Failed to create session"}), 500

        # Set cookie
        response = make_response(jsonify({
            "message": "Login successful",
            "user": user
        }), 200)
        response.set_cookie(
            "sessid",
            session_uuid,
            expires=expires_at,
            httponly=True,
            samesite="None",
            secure=True,
            domain=".hoi5.com",
            path="/",
        )
        return response

    except Error as e:
        return jsonify({"error": str(e)}), 500

    finally:
        if cursor is not None:
            cursor.close()
        if conn is not None and conn.is_connected():
            conn.close()

# --------------------
# Logout endpoint
# --------------------
@app.route("/logout", methods=["POST"])
def logout():
    response = make_response(jsonify({"message": "Logout successful"}), 200)
    response.set_cookie(
        "sessid",
        "",
        expires=0,
        httponly=True,
        samesite="None",
        secure=True,
        domain=".hoi5.com",
        path="/"
    )
    return response

# --------------------
# Account Helpers
# --------------------
def get_user_from_session():
    """Retrieves the user based on the sessid cookie."""
    sessid = request.cookies.get("sessid")
    if not sessid:
        return None

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # Check session validity
        query = """
        SELECT user_id, expires_at, is_valid
        FROM sessions
        WHERE session_uuid = %s
        """
        cursor.execute(query, (sessid,))
        session = cursor.fetchone()

        if not session or not session["is_valid"]:
            return None

        # Check expiration (naive datetime check, ensure db returns datetime object)
        if session["expires_at"] < datetime.datetime.now():
            return None

        # Fetch user details
        user_query = "SELECT id, username, email, full_name, password_hash FROM users WHERE id = %s"
        cursor.execute(user_query, (session["user_id"],))
        user = cursor.fetchone()
        
        return user

    except Error as e:
        print("Error fetching user from session:", e)
        return None
    finally:
        if 'cursor' in locals() and cursor:
            cursor.close()
        if 'conn' in locals() and conn and conn.is_connected():
            conn.close()

# --------------------
# Account Endpoints
# --------------------
@app.route("/account", methods=["GET"])
def get_account():
    user = get_user_from_session()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401
    
    # Don't send password_hash back
    user_response = {
        "id": user["id"],
        "username": user["username"],
        "email": user["email"],
        "full_name": user["full_name"]
    }
    return jsonify({"user": user_response}), 200

@app.route("/account", methods=["PUT"])
def update_account():
    user = get_user_from_session()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Invalid JSON"}), 400

    # Fields allowed to update
    username = data.get("username", user["username"])
    email = data.get("email", user["email"])
    full_name = data.get("full_name", user["full_name"])
    password = data.get("password") # Plain text (not implemented hashing here? User sends hash?)
    # Wait, the register endpoint expects `password_hash`. 
    # Let's assume the frontend sends `password_hash` if they want to change password, 
    # OR we handle hashing here. 
    # Looking at register endpoint: `password_hash = data.get("password_hash")`.
    # So the frontend seems to be sending a hash? Or the variable name is just `password_hash` but it receives plain text?
    # Security-wise, commonly backend hashes. But if variable is `password_hash`, maybe frontend does it?
    # Let's stick to what register does. It takes `password_hash`.

    new_password_hash = data.get("password_hash")
    
    password_hash_to_store = new_password_hash if new_password_hash else user["password_hash"]

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        query = """
        UPDATE users
        SET username = %s, email = %s, full_name = %s, password_hash = %s
        WHERE id = %s
        """
        cursor.execute(query, (username, email, full_name, password_hash_to_store, user["id"]))
        conn.commit()

        return jsonify({
            "message": "Account updated successfully",
            "user": {
                "id": user["id"],
                "username": username,
                "email": email,
                "full_name": full_name
            }
        }), 200

    except Error as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if 'cursor' in locals() and cursor:
            cursor.close()
        if 'conn' in locals() and conn and conn.is_connected():
            conn.close()

@app.route("/account", methods=["DELETE"])
def delete_account():
    user = get_user_from_session()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Delete sessions first (optional if cascade exists, but safe)
        cursor.execute("DELETE FROM sessions WHERE user_id = %s", (user["id"],))
        
        # Delete user
        cursor.execute("DELETE FROM users WHERE id = %s", (user["id"],))
        conn.commit()

        response = make_response(jsonify({"message": "Account deleted successfully"}), 200)
        # Clear cookie
        response.set_cookie("sessid", "", expires=0, httponly=True, samesite="None", secure=True, domain=".hoi5.com", path="/")
        return response

    except Error as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if 'cursor' in locals() and cursor:
            cursor.close()
        if 'conn' in locals() and conn and conn.is_connected():
            conn.close()

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5050)
