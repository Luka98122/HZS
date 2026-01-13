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

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5050)
