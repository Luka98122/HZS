from flask import Flask, jsonify
from flask_cors import CORS
import time
import datetime

app = Flask(__name__)

# ✅ Enable CORS for /api/* routes
CORS(app, resources={r"/api/*": {"origins": "*"}})

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

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5050)
