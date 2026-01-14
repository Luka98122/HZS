import datetime
import time

from dotenv import load_dotenv
from flask import Flask, jsonify
from flask_cors import CORS
from models import init_db

# Import all blueprints
from routes.auth import auth_bp
from routes.dashboard import dashboard_bp
from routes.focus import focus_bp
from routes.onboarding import onboarding_bp
from routes.stress import stress_bp
from routes.study import study_bp
from routes.workout import workout_bp

load_dotenv()

app = Flask(__name__)

# Enable CORS for /api/* routes
CORS(
    app,
    resources={r"/api/*": {"origins": ["https://react.hoi5.com"]}},
    supports_credentials=True,
)

# Register blueprints
app.register_blueprint(auth_bp)
app.register_blueprint(onboarding_bp)
app.register_blueprint(workout_bp)
app.register_blueprint(study_bp)
app.register_blueprint(focus_bp)
app.register_blueprint(stress_bp)
app.register_blueprint(dashboard_bp)

# Initialize database tables
init_db()

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
        "message": f"HZS API working. This is the {x} request this session."
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

print(app.url_map)

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5050)
