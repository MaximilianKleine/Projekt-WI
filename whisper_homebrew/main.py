import io
import whisper
import torch
import numpy as np
from flask import Flask, request, jsonify
from pydub import AudioSegment

app = Flask(__name__)

device = "cuda" if torch.cuda.is_available() else "cpu"
print(f"Lade Whisper-Modell auf: {device}")

transcription_model = whisper.load_model("large", device = device)

@app.route("/transcribe", methods=["POST"])
def transcribe():
    if "file" not in request.files:
        return jsonify({"status": "error", "message": "Keine Datei im Request gefunden"}), 400

    audio_file = request.files["file"]
    try:
        audio = AudioSegment.from_file(io.BytesIO(audio_file.read()), format="mp3")
        audio = audio.set_frame_rate(16000).set_channels(1)
        audio_data = np.frombuffer(audio.raw_data, dtype=np.int16)
        audio_ndarray = audio_data.astype(np.float32) / 32768.0

        use_fp16 = True if device == "cuda" else False
        result = transcription_model.transcribe(audio=audio_ndarray, fp16=use_fp16)

        return jsonify({
            "status": "success",
            "text": result["text"].strip()
        })

    # TODO: actually do exception handling
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route("/test", methods=["GET"])
def test():
    return "i am a teapot", 418

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=65000)
