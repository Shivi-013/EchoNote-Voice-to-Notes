const { jsPDF } = window.jspdf;

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (!SpeechRecognition) {
  alert("Speech Recognition is not supported in this browser. Use Chrome.");
} else {
  const recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;

  const noteBox = document.getElementById('note-box');
  const summaryBox = document.getElementById('summary-box');
  const startBtn = document.getElementById('start-btn');
  const stopBtn = document.getElementById('stop-btn');
  const summarizeBtn = document.getElementById('summarize-btn');
  const downloadBtn = document.getElementById('download-btn');
  const status = document.getElementById('status');
  const languageSelect = document.getElementById('language-select');

  let finalText = '';

  recognition.onresult = (event) => {
    let interimText = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        finalText += transcript + '\n';
      } else {
        interimText += transcript;
      }
    }
    noteBox.innerText = `Transcript:\n${finalText}${interimText}`;
  };

  startBtn.onclick = () => {
    recognition.lang = languageSelect.value;
    finalText = '';
    noteBox.innerText = "Transcript:\n";
    summaryBox.innerText = "Summary:\n";
    recognition.start();
    status.innerText = "Listening...";
  };

  stopBtn.onclick = () => {
    recognition.stop();
    status.innerText = "Stopped.";
  };

  summarizeBtn.onclick = async () => {
    status.innerText = "Summarizing with AI...";
    try {
      const summary = await getSummaryFromAI(finalText);
      summaryBox.innerText = `Summary:\n${summary}`;
      status.innerText = "Summarized successfully.";
    } catch (e) {
      summaryBox.innerText = "Summary:\n[Failed to summarize]";
      status.innerText = "Summarization failed.";
    }
  };

  downloadBtn.onclick = () => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("EchoNote AI - Voice Notes", 10, 10);
    doc.text("Transcript:", 10, 20);
    doc.text(finalText, 10, 30);
    doc.text("Summary:", 10, 60);
    doc.text(summaryBox.innerText.replace("Summary:\n", ""), 10, 70);
    doc.save("EchoNote_AI_Notes.pdf");
  };
  const testText = "The Mars rover was built by students to explore terrain and conduct scientific experiments. It has multiple sensors and cameras, and the robotic arm can collect samples.";

summarizeText(testText).then(console.log).catch(console.error);


  // Hugging Face summarization function
  async function getSummaryFromAI(text) {
    const API_URL = "https://api-inference.huggingface.co/models/facebook/bart-large-cnn";
    const HUGGING_FACE_API_KEY = ""; 
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${HUGGING_FACE_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ inputs: text })
    });

    const result = await response.json();

    if (result.error) {
      throw new Error("Hugging Face Error: " + result.error);
    }

    return result[0].summary_text;
  }
}
