# app.py (Backend using Flask)
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
import uuid
from TTS.api import TTS
import torch
import logging

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create upload directories if they don't exist
UPLOAD_FOLDER = 'uploads'
OUTPUT_FOLDER = 'outputs'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(OUTPUT_FOLDER, exist_ok=True)

# Load TTS model (choose the appropriate Turkish model)
try:
    # Try to load YourTTS model with Turkish support
    model = TTS(model_name="tts_models/multilingual/multi-dataset/your_tts", progress_bar=False)
    logger.info("Loaded YourTTS model successfully")
except Exception as e:
    logger.error(f"Failed to load YourTTS model: {e}")
    # Fallback to a simpler model if available
    try:
        model = TTS(model_name="tts_models/tr/common-voice/glow-tts", progress_bar=False)
        logger.info("Loaded fallback Turkish TTS model")
    except Exception as e2:
        logger.error(f"Failed to load fallback model: {e2}")
        model = None

@app.route('/api/tts', methods=['POST'])
def generate_tts():
    if not model:
        return jsonify({"error": "TTS model failed to load"}), 500
    
    if 'audio' not in request.files:
        return jsonify({"error": "No audio file provided"}), 400
        
    # Get parameters
    audio_file = request.files['audio']
    text = request.form.get('text', '')
    language = request.form.get('language', 'tr')
    
    if not text:
        return jsonify({"error": "No text provided"}), 400
    
    # Save uploaded reference audio file
    unique_id = str(uuid.uuid4())
    audio_path = os.path.join(UPLOAD_FOLDER, f"{unique_id}.wav")
    audio_file.save(audio_path)
    
    # Output path
    output_path = os.path.join(OUTPUT_FOLDER, f"{unique_id}_output.wav")
    
    try:
        # Generate speech using the reference voice
        logger.info(f"Generating speech for: {text[:50]}...")
        wav = model.tts(text=text, speaker_wav=audio_path, language=language)
        model.synthesizer.save_wav(wav, output_path)
        
        return jsonify({
            "success": True,
            "file_id": unique_id,
            "message": "Speech generated successfully"
        })
    except Exception as e:
        logger.error(f"Error generating speech: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/audio/<file_id>', methods=['GET'])
def get_audio(file_id):
    output_path = os.path.join(OUTPUT_FOLDER, f"{file_id}_output.wav")
    if not os.path.exists(output_path):
        return jsonify({"error": "Audio file not found"}), 404
    
    return send_file(output_path, mimetype="audio/wav")

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "healthy",
        "model_loaded": model is not None
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
