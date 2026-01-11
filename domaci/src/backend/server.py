from flask import Flask, jsonify
import time
import datetime
app = Flask(__name__)

# Za sad deployed na
# https://complaisant-debby-semiarchitecturally.ngrok-free.dev/

@app.route("/health", methods=["GET"])
def health():
    return jsonify(status="ok"), 200

@app.route("/time", methods=["GET"])
def time_rn():
    time_rn = time.time()
    time_later = time.time()+5
    date_rn = datetime.datetime.now()
    result = {
        "text" : f"The time right now is {time_rn}.",
        "Future" : f"Five seconds into the future is {time_later}",
        "Date" : f"The date is: {date_rn}",
        "status" : "ok"
    }
    return jsonify(result), 200 # HTTP code 200 = OKs

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
