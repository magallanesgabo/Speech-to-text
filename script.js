const recordBtn = document.querySelector(".record");
const result = document.querySelector(".result:last-child"); // Full text container
const hotText = document.querySelector(".hot-text"); // Hot-text container
const copyBtn = document.getElementById("copy"); // Copy button
const downloadBtn = document.querySelector(".download"); // Download button

let SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition;
let recording = false;

// Initialize and handle speech recognition
function speechToText() {
  try {
    recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = true;

    recordBtn.classList.add("recording");
    recordBtn.querySelector("p").innerHTML = "Listening...";
    recognition.start();

    recognition.onresult = (event) => {
      const speechResult = event.results[0][0].transcript;

      if (event.results[0].isFinal) {
        // Append the final text to the full text container
        result.innerHTML += " " + speechResult;

        // Append the final text to the hot text container
        hotText.innerHTML += " " + speechResult;

        // Remove provisional text elements if they exist
        const interimElementResult = result.querySelector("p");
        const interimElementHot = hotText.querySelector("p");

        if (interimElementResult) interimElementResult.remove();
        if (interimElementHot) interimElementHot.remove();

        // Enable the download button
        downloadBtn.disabled = false;
      } else {
        // Update provisional text in the result container
        let interimElementResult = result.querySelector(".interim");
        if (!interimElementResult) {
          interimElementResult = document.createElement("p");
          interimElementResult.classList.add("interim");
          result.appendChild(interimElementResult);
        }
        interimElementResult.innerHTML = " " + speechResult;

        // Update provisional text in the hot text container (identical behavior)
        let interimElementHot = hotText.querySelector(".hot-interim");
        if (!interimElementHot) {
          interimElementHot = document.createElement("p");
          interimElementHot.classList.add("hot-interim");
          hotText.appendChild(interimElementHot);
        }
        interimElementHot.innerHTML = " " + speechResult;
      }
    };

    recognition.onspeechend = () => {
      speechToText();
    };

    recognition.onerror = (event) => {
      stopRecording();
      console.error("Speech recognition error:", event.error);
    };
  } catch (error) {
    recording = false;
    console.error("Error initializing SpeechRecognition:", error);
  }
}

// Start or stop recording
recordBtn.addEventListener("click", () => {
  if (!recording) {
    speechToText();
    recording = true;
  } else {
    stopRecording();
  }
});

// Stop recording
function stopRecording() {
  recognition.stop();
  recordBtn.classList.remove("recording");
  recordBtn.querySelector("p").innerHTML = "Start Listening";
  recording = false;
}

// Copy hot-text content and clear it
copyBtn.addEventListener("click", () => {
  const hotTextContent = hotText.innerText; // Get consolidated text from hot-text
  navigator.clipboard
    .writeText(hotTextContent)
    .then(() => {
      alert("Text copied to clipboard.");
      hotText.innerHTML = ""; // Clear visible hot-text
    })
    .catch((err) => {
      console.error("Error copying text:", err);
    });
});

// Download full text content
downloadBtn.addEventListener("click", () => {
  const text = result.innerText; // Get full text from result
  const filename = "speech.txt";

  const element = document.createElement("a");
  element.setAttribute(
    "href",
    "data:text/plain;charset=utf-8," + encodeURIComponent(text)
  );
  element.setAttribute("download", filename);
  element.style.display = "none";
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
});
