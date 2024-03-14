import React, { useEffect, useRef, useState } from "react";
import Dropzone from "dropzone";
import "dropzone/dist/dropzone.css";
import { BiRefresh } from "react-icons/bi";

function App() {
	const dropzoneRef = useRef();
	const canvasRef = useRef();
	const [contrast, setContrast] = useState(1);
	const [originalImage, setOriginalImage] = useState(null);
	const [brightness, setBrightness] = useState(0);

	useEffect(() => {
		let dropzoneInstance = new Dropzone(dropzoneRef.current, {
			url: "/upload", // endpoint, gdzie pliki będą wysyłane
			previewTemplate: "<img />",
			autoProcessQueue: false, // nie przesyłaj plików automatycznie
			maxFiles: 1, // Maksymalna liczba plików
		});

		dropzoneInstance.on("addedfile", function (file) {
			// Utwórz podgląd pliku po dodaniu
			var reader = new FileReader();
			reader.onload = function (event) {
				var imgElement = dropzoneInstance.previewsContainer.lastChild;
				imgElement.src = event.target.result;
				setOriginalImage(event.target.result); // Zapisz oryginalny obraz
			};
			reader.readAsDataURL(file);
		});

		dropzoneInstance.on("maxfilesexceeded", function (file) {
			// Usuń poprzedni plik, gdy dodawany jest nowy plik
			dropzoneInstance.removeAllFiles(true);
			dropzoneInstance.addFile(file);
		});

		return function cleanup() {
			dropzoneInstance.destroy();
		};
	}, []);
	const convertToGrayscale = (method) => {
		const canvas = canvasRef.current;
		const ctx = canvas.getContext("2d");
		const imgElement = dropzoneRef.current.querySelector("img");
		const img = new Image();
		img.src = imgElement.src;

		img.onload = function () {
			canvas.width = img.width;
			canvas.height = img.height;
			ctx.drawImage(img, 0, 0, img.width, img.height);

			const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
			const data = imageData.data;

			for (let i = 0; i < data.length; i += 4) {
				let grayscale;
				switch (method) {
					case "red":
						grayscale = data[i];
						break;
					case "green":
						grayscale = data[i + 1];
						break;
					case "blue":
						grayscale = data[i + 2];
						break;
					case "average":
						grayscale = (data[i] + data[i + 1] + data[i + 2]) / 3;
						break;
					case "yuv":
						grayscale =
							0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
						break;
					default:
						grayscale = (data[i] + data[i + 1] + data[i + 2]) / 3;
				}

				data[i] = grayscale;
				data[i + 1] = grayscale;
				data[i + 2] = grayscale;
			}

			ctx.putImageData(imageData, 0, 0);
		};
	};

	const moveImageToLeft = () => {
		const canvas = canvasRef.current;
		const ctx = canvas.getContext("2d");
		const imgData = canvas.toDataURL();

		// Usuń obecny obraz z dropzone
		const imgElement = dropzoneRef.current.querySelector("img");
		if (imgElement) imgElement.remove();

		// Dodaj nowy obraz do dropzone
		const newImg = document.createElement("img");
		newImg.src = imgData;
		dropzoneRef.current.appendChild(newImg);

		// Wyczyść canvas
		ctx.clearRect(0, 0, canvas.width, canvas.height);
	};

	const loadImageOntoCanvas = (imageSrc) => {
		const img = new Image();
		img.src = imageSrc;
		img.onload = () => {
			const canvas = canvasRef.current;
			const ctx = canvas.getContext("2d");
			canvas.width = img.width;
			canvas.height = img.height;
			ctx.drawImage(img, 0, 0, img.width, img.height);
		};
	};

	const changeBrightness = () => {
		const canvas = canvasRef.current;
		const ctx = canvas.getContext("2d");
		const img = new Image();
		img.src = originalImage; // Użyj oryginalnego obrazu

		img.onload = function () {
			canvas.width = img.width;
			canvas.height = img.height;
			ctx.drawImage(img, 0, 0, img.width, img.height);

			const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
			const data = imageData.data;

			for (let i = 0; i < data.length; i += 4) {
				data[i] = Math.max(0, Math.min(255, data[i] + brightness));
				data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + brightness));
				data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + brightness));
			}

			ctx.putImageData(imageData, 0, 0);
		};
	};

	const changeContrast = () => {
		const canvas = canvasRef.current;
		const ctx = canvas.getContext("2d");
		const img = new Image();
		img.src = originalImage; // Użyj oryginalnego obrazu

		img.onload = function () {
			canvas.width = img.width;
			canvas.height = img.height;
			ctx.drawImage(img, 0, 0, img.width, img.height);

			const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
			const data = imageData.data;

			for (let i = 0; i < data.length; i += 4) {
				data[i] = Math.max(0, Math.min(255, data[i] * contrast));
				data[i + 1] = Math.max(0, Math.min(255, data[i + 1] * contrast));
				data[i + 2] = Math.max(0, Math.min(255, data[i + 2] * contrast));
			}

			ctx.putImageData(imageData, 0, 0);
		};
	};
	const negateImage = () => {
		const canvas = canvasRef.current;
		const ctx = canvas.getContext("2d");
		const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
		const data = imageData.data;

		for (let i = 0; i < data.length; i += 4) {
			data[i] = 255 - data[i];
			data[i + 1] = 255 - data[i + 1];
			data[i + 2] = 255 - data[i + 2];
		}

		ctx.putImageData(imageData, 0, 0);
	};

	const changeBrightnessRange = () => {
		const canvas = canvasRef.current;
		const ctx = canvas.getContext("2d");
		const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
		const data = imageData.data;

		let min = 255;
		let max = 0;

		for (let i = 0; i < data.length; i += 4) {
			min = Math.min(min, data[i], data[i + 1], data[i + 2]);
			max = Math.max(max, data[i], data[i + 1], data[i + 2]);
		}

		for (let i = 0; i < data.length; i += 4) {
			data[i] = ((data[i] - min) / (max - min)) * 255;
			data[i + 1] = ((data[i + 1] - min) / (max - min)) * 255;
			data[i + 2] = ((data[i + 2] - min) / (max - min)) * 255;
		}

		ctx.putImageData(imageData, 0, 0);
	};
	const downloadImage = () => {
		const canvas = canvasRef.current;
		const imageURI = canvas
			.toDataURL("image/png")
			.replace("image/png", "image/octet-stream");
		let link = document.createElement("a");
		link.download = "processed_image.png";
		link.href = imageURI;
		link.click();
	};
	const handleBrightnessChange = (e) => {
		let value = e.target.value;

		value = Number(value);
		if (value < -255) value = -255;
		if (value > 255) value = 255;
		setBrightness(value);
	};
	const handleContrastChange = (e) => {
		let value = Number(e.target.value);
		if (value < 0) value = 0;
		if (value > 255) value = 255;
		setContrast(value);
	};

	return (
		<main>
			<h1>Photo Editor</h1>
			<div className="converter-container">
				<div ref={dropzoneRef} className="dropzone">
					<div className="dz-message">
						<p>drag and drop or click to upload</p>
					</div>
				</div>
				<div className="column-button-container">
					<button className="swap-button" onClick={moveImageToLeft}>
						<BiRefresh />
					</button>
					<button onClick={downloadImage}>Download Image</button>
				</div>

				<canvas ref={canvasRef}></canvas>
			</div>
			<div className="button-container-row">
				<button onClick={() => convertToGrayscale("average")}>
					Convert to Grayscale (Average)
				</button>
				<button onClick={() => convertToGrayscale("red")}>
					Convert to Grayscale (Red)
				</button>
				<button onClick={() => convertToGrayscale("green")}>
					Convert to Grayscale (Green)
				</button>
				<button onClick={() => convertToGrayscale("blue")}>
					Convert to Grayscale (Blue)
				</button>
				<button onClick={() => convertToGrayscale("yuv")}>
					Convert to Grayscale (YUV)
				</button>
			</div>
			<div className="button-container-row">
				<input
					type="number"
					value={brightness}
					onChange={handleBrightnessChange}
				/>
				<button onClick={changeBrightness}>
					Change Brightness <br /> (-255/255)
				</button>

				<input
					type="number"
					step="0.1"
					id="contrast"
					value={contrast}
					onChange={handleContrastChange}
				/>
				<button onClick={changeContrast}>
					Change Contrast <br /> (0/255)
				</button>
			</div>
			<div className="button-container-row">
				<button
					onClick={async () => {
						setBrightness(0);
						await new Promise((resolve) => setTimeout(resolve, 10));
						changeBrightness();
						await new Promise((resolve) => setTimeout(resolve, 15));
						negateImage();
					}}>
					Negate Image
				</button>
				<button
				<button
				onClick={async () => {
					setBrightness(0);
					await new Promise((resolve) => setTimeout(resolve, 10));
					changeBrightness();
					await new Promise((resolve) => setTimeout(resolve, 15));
					changeBrightnessRange();
				}}>
					Change Brightness Range
				</button>
			</div>
			<span className="author">Made by Eryk Majewski</span>
		</main>
	);
}

export default App;
