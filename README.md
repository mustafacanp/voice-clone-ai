# Voice Clone AI

A web application that clones voices using AI technology. Upload a voice sample and generate new speech with the same voice characteristics.

## Features

- Voice cloning from audio samples
- Support for multiple languages (English and Turkish)
- Real-time audio generation
- Easy-to-use web interface
- Download generated audio files

## Tech Stack

- Frontend: Next.js, TypeScript, React
- Backend: Python, Flask
- AI: TTS (Text-to-Speech) models

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.8+
- pip

### Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd voice-clone-ai
```

2. Setup Frontend:
```bash
cd frontend
npm install
npm run dev
```

3. Setup Backend:
```bash
cd backend
pip install -r requirements.txt
python app.py
```

4. Open `http://localhost:3000` in your browser

## Usage

1. Upload a voice sample (5-10 seconds of clear speech)
2. Select the target language
3. Enter the text you want to synthesize
4. Click "Generate Audio" and wait for processing
5. Play or download the generated audio

## License

MIT

## Note

Please use voice cloning technology responsibly and within ethical guidelines.
