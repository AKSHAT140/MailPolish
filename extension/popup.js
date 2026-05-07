// ===== MailPolish Chrome Extension - Popup Logic =====

const DEFAULT_API_URL = 'http://127.0.0.1:8000';

// DOM Elements
const inputText = document.getElementById('inputText');
const outputArea = document.getElementById('outputArea');
const emptyState = document.getElementById('emptyState');
const recipient = document.getElementById('recipient');
const outputFormat = document.getElementById('outputFormat');
const improveBtn = document.getElementById('improveBtn');
const copyBtn = document.getElementById('copyBtn');
const politeBtn = document.getElementById('politeBtn');
const assertiveBtn = document.getElementById('assertiveBtn');
const shortenBtn = document.getElementById('shortenBtn');
const regenBtn = document.getElementById('regenBtn');
const apiUrlInput = document.getElementById('apiUrl');
const saveSettingsBtn = document.getElementById('saveSettingsBtn');

let currentOutput = '';
let isLoading = false;

// ===== Settings Management =====
function loadSettings() {
  const saved = localStorage.getItem('mailpolish_api_url');
  apiUrlInput.value = saved || DEFAULT_API_URL;
}

function saveSettings() {
  const url = apiUrlInput.value.trim() || DEFAULT_API_URL;
  localStorage.setItem('mailpolish_api_url', url);
  apiUrlInput.value = url;

  saveSettingsBtn.textContent = '✓ Saved';
  saveSettingsBtn.classList.add('saved');
  setTimeout(() => {
    saveSettingsBtn.textContent = 'Save';
    saveSettingsBtn.classList.remove('saved');
  }, 1500);
}

function getApiUrl() {
  return apiUrlInput.value.trim() || DEFAULT_API_URL;
}

// ===== Core Functionality =====
async function handleImprove(modifier = null) {
  const text = inputText.value.trim();
  if (!text || isLoading) return;

  setLoading(true);
  clearOutput();

  try {
    const apiUrl = getApiUrl();
    const response = await fetch(`${apiUrl}/api/refine`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        input_text: text,
        recipient: recipient.value,
        output_format: outputFormat.value,
        tone_modifier: modifier
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed (${response.status})`);
    }

    const data = await response.json();
    currentOutput = data.refined_text;
    showOutput(currentOutput);
    enableQuickActions(true);
  } catch (error) {
    console.error(error);
    showOutput('❌ Error: Failed to connect to the AI service.\n\nMake sure:\n1. Your backend is running (run.bat)\n2. The Backend URL below is correct');
    enableQuickActions(false);
  } finally {
    setLoading(false);
  }
}

function handleCopy() {
  if (!currentOutput) return;

  navigator.clipboard.writeText(currentOutput).then(() => {
    copyBtn.textContent = '✓ Copied';
    copyBtn.classList.add('success');
    setTimeout(() => {
      copyBtn.textContent = '📋 Copy';
      copyBtn.classList.remove('success');
    }, 2000);
  });
}

// ===== UI Helpers =====
function setLoading(loading) {
  isLoading = loading;
  improveBtn.disabled = loading || !inputText.value.trim();

  if (loading) {
    improveBtn.innerHTML = '<div class="spinner"></div>';
    if (emptyState) emptyState.textContent = 'Polishing your message...';
  } else {
    improveBtn.innerHTML = '✨ Improve';
  }
}

function clearOutput() {
  currentOutput = '';
  outputArea.innerHTML = '<div class="empty-state" id="emptyState">Polishing your message...</div>';
}

function showOutput(text) {
  outputArea.textContent = text;
  copyBtn.disabled = false;
}

function enableQuickActions(enable) {
  politeBtn.disabled = !enable;
  assertiveBtn.disabled = !enable;
  shortenBtn.disabled = !enable;
  regenBtn.disabled = !enable;
}

// ===== Event Listeners =====
improveBtn.addEventListener('click', () => handleImprove());
copyBtn.addEventListener('click', handleCopy);
politeBtn.addEventListener('click', () => handleImprove('Make it more polite and gentle'));
assertiveBtn.addEventListener('click', () => handleImprove('Make it more assertive and direct'));
shortenBtn.addEventListener('click', () => handleImprove('Shorten it to be very concise'));
regenBtn.addEventListener('click', () => handleImprove());
saveSettingsBtn.addEventListener('click', saveSettings);

inputText.addEventListener('input', () => {
  improveBtn.disabled = isLoading || !inputText.value.trim();
});

// ===== Initialize =====
loadSettings();
