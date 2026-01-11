from flask import Flask, jsonify
import time
import datetime
app = Flask(__name__)

# Za sad deployed na
# https://complaisant-debby-semiarchitecturally.ngrok-free.dev/
x = 0
@app.route("/api/health", methods=["GET"])
def health():
    global x
    x+=1
    result = {
        "status" : "ok",
        "message" : f"HZS API working. This is the {x}th request this session.",  
    }
    return jsonify(result), 200

@app.route("/api/time", methods=["GET"])
def time_rn():
    global x
    x+=1
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
