"use client";

import React, {
	useState,
	useRef,
	type ChangeEvent,
	type FormEvent,
} from "react";
import "../styles/VoiceCloner.css";

export default function VoiceCloner() {
	const [text, setText] = useState<string>("");
	const [referenceAudio, setReferenceAudio] = useState<File | null>(null);
	const [language, setLanguage] = useState<string>("tr");
	const [outputAudio, setOutputAudio] = useState<string | null>(null);
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string>("");
	const fileInputRef = useRef<HTMLInputElement>(null);
	const audioRef = useRef<HTMLAudioElement>(null);

	const handleAudioChange = (e: ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			setReferenceAudio(file);
		}
	};

	const handleLanguageChange = (e: ChangeEvent<HTMLSelectElement>) => {
		setLanguage(e.target.value);
	};

	const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		if (!text) {
			setError("Please enter the text.");
			return;
		}

		if (!referenceAudio) {
			setError("Please select a reference audio file.");
			return;
		}

		setLoading(true);
		setError("");

		const formData = new FormData();
		formData.append("audio", referenceAudio);
		formData.append("text", text);
		formData.append("language", language);

		try {
			const response = await fetch("http://localhost:5000/api/tts", {
				method: "POST",
				body: formData,
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(
					data.error || "An error occurred while generating audio.",
				);
			}

			// Get the audio file using the returned ID
			setOutputAudio(`http://localhost:5000/api/audio/${data.file_id}`);
		} catch (err: unknown) {
			if (err instanceof Error) {
				setError(err.message);
			} else {
				setError("An unknown error occurred.");
			}
		} finally {
			setLoading(false);
		}
	};

	const playAudio = () => {
		if (audioRef.current) {
			audioRef.current.play();
		}
	};

	return (
		<div className="App">
			<header className="App-header">
				<h1>Voice Cloning Application</h1>
				<p>Upload a voice sample and clone your text with the same voice</p>
			</header>

			<main className="App-main">
				<form onSubmit={handleSubmit} className="tts-form">
					<div className="form-group">
						<label htmlFor="referenceAudio">Reference Audio File:</label>
						<input
							type="file"
							id="referenceAudio"
							accept="audio/*"
							onChange={handleAudioChange}
							ref={fileInputRef}
							className="file-input"
						/>
						<small>
							Upload a clean 5-10 second recording of the person&apos;s voice
						</small>
					</div>

					<div className="form-group">
						<label htmlFor="language">Language:</label>
						<select
							id="language"
							value={language}
							onChange={handleLanguageChange}
							className="language-select"
						>
							<option value="tr">Turkish</option>
							<option value="en">English</option>
						</select>
					</div>

					<div className="form-group">
						<label htmlFor="text">Text to Synthesize:</label>
						<textarea
							id="text"
							value={text}
							onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
								setText(e.target.value)
							}
							rows={5}
							placeholder="Enter the text you want to synthesize..."
							className="text-input"
						/>
					</div>

					<button type="submit" className="submit-button" disabled={loading}>
						{loading ? "Generating Audio..." : "Generate Audio"}
					</button>
				</form>

				{error && <div className="error-message">{error}</div>}

				{outputAudio && (
					<div className="result-section">
						<h2>Generated Audio:</h2>
						<audio
							ref={audioRef}
							src={outputAudio}
							controls
							className="audio-player"
						>
							<track kind="captions" />
						</audio>
						<button type="button" onClick={playAudio} className="play-button">
							Play
						</button>
						<a href={outputAudio} download className="download-button">
							Download Audio File
						</a>
					</div>
				)}
			</main>

			<footer className="App-footer">
				<p>
					Note: Please use voice cloning technology within ethical guidelines.
				</p>
			</footer>
		</div>
	);
}
