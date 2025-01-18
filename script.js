const recordBtn = document.querySelector(".record");
const result = document.querySelector(".result:last-child"); 
const hotText = document.querySelector(".hot-text");
const copyBtn = document.getElementById("copy"); 

let SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition;
let recording = false;
let hotTextContent = ""; 
const MAX_HOT_WORDS = 80; 

function speechToText() {
  try {
    recognition = new SpeechRecognition();
    recognition.lang = "en-US"; // Idioma fijo
    recognition.interimResults = true;

    recordBtn.classList.add("recording");
    recordBtn.querySelector("p").innerHTML = "Listening...";
    recognition.start();

    recognition.onresult = (event) => {
      const speechResult = event.results[0][0].transcript;

      if (event.results[0].isFinal) {
        result.innerHTML += " " + speechResult;

        hotTextContent += " " + speechResult;
        const words = hotTextContent.trim().split(/\s+/); 
        if (words.length > MAX_HOT_WORDS) {
          hotTextContent = words.slice(-MAX_HOT_WORDS).join(" "); 
        }
        hotText.querySelector(".hot-interim").textContent = hotTextContent;

        const interimElement = result.querySelector("p");
        if (interimElement) {
          interimElement.remove();
        }
      } else {
        let interimElement = result.querySelector(".interim");
        if (!interimElement) {
          interimElement = document.createElement("p");
          interimElement.classList.add("interim");
          result.appendChild(interimElement);
        }
        interimElement.innerHTML = " " + speechResult;

        let hotInterimElement = hotText.querySelector(".hot-interim");
        if (!hotInterimElement) {
          hotInterimElement = document.createElement("p");
          hotInterimElement.classList.add("hot-interim");
          hotText.appendChild(hotInterimElement);
        }
        hotInterimElement.innerHTML = " " + speechResult;
      }
    };

    recognition.onspeechend = () => {
      speechToText();
    };

    recognition.onerror = (event) => {
      stopRecording();
      console.error("Error en el reconocimiento de voz:", event.error);
    };
  } catch (error) {
    recording = false;
    console.error("Error al iniciar SpeechRecognition:", error);
  }
}

// Inicia o detiene la grabación
recordBtn.addEventListener("click", () => {
  if (!recording) {
    speechToText();
    recording = true;
  } else {
    stopRecording();
  }
});

function stopRecording() {
  recognition.stop();
  recordBtn.classList.remove("recording");
  recordBtn.querySelector("p").innerHTML = "Start Listening";
  recording = false;
}

// Copiar texto del hot-text
copyBtn.addEventListener("click", () => {
  navigator.clipboard
    .writeText(hotTextContent)
    .then(() => {
      alert("Texto copiado al portapapeles.");
    })
    .catch((err) => {
      console.error("Error al copiar:", err);
    });
});
