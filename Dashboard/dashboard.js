const API_URL = "http://localhost:3000/api/generate-results";
const submitButton = document.querySelector('#submit');
const outputText = document.getElementById('myOutput');
const differentialButton = document.querySelector('#differential');
const clinicalButton = document.querySelector('#clinical');
const copyButton = document.querySelector('#copy');
const downloadPdfButton = document.getElementById('downloadPdf');
let selectedMode = '';
let copiedText = '';

function startLoading() {
  submitButton.disabled = true;
  submitButton.innerHTML = `<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Generating...`;
}

function stopLoading() {
  submitButton.disabled = false;
  submitButton.innerHTML = `Generate <i class="bi bi-robot"></i>`;
}

function generateResults() {
  const inputText = document.getElementById('myInput').value;

  let prompt = '';

  if (selectedMode === 'differential') {
    prompt = `Write a detailed Differential diagnosis and include 3 real medical references for: ${inputText}`;
  } else if (selectedMode === 'clinical') {
    prompt = `Write a detailed clinical plan for ${inputText}`;
  } else {
    prompt = inputText;
  }

  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      inputText: prompt
    })
  };

  outputText.textContent = '';
  startLoading();

  fetch(API_URL, requestOptions)
    .then(response => response.json())
    .then(data => {
      if (outputText) {
        const formattedOutput = formatOutput(data.output);
        outputText.innerHTML = '<div contenteditable="true">' + formattedOutput + '</div>';
        copiedText = formattedOutput;

        downloadPdfButton.style.display = 'block';
        copyButton.style.display = 'block';
      }
    })
    .catch(error => {
      console.error(error);
    })
    .finally(() => {
      stopLoading();
    });
}

function formatOutput(output) {
  output = output.replace(/\n/g, "<br>");
  output = output.replace(/\*\*(.*?)\*\*/g, "<span class='text-bold'>$1</span>");
  output = output.replace(/_(.*?)_/g, "<span class='text-italic'>$1</span>");

  return output;
}

submitButton.onclick = generateResults;

differentialButton.addEventListener('click', () => {
  selectedMode = 'differential';
});

clinicalButton.addEventListener('click', () => {
  selectedMode = 'clinical';
});

copyButton.addEventListener('click', () => {
  if (copiedText) {
    navigator.clipboard.writeText(copiedText)
      .then(() => {
        console.log('Text copied!');
      })
      .catch(error => {
        console.error('Error copying text:', error);
      });
  }
});

const myInput = document.getElementById('myInput');

myInput.addEventListener('input', () => {
  downloadPdfButton.style.display = 'none';
  copyButton.style.display = 'none';

  myInput.style.height = 'auto';
  myInput.style.height = `${myInput.scrollHeight}px`;
});

myInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    myInput.value += '\n';
  }
});
