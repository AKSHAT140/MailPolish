import { useState } from 'react'

function App() {
  const [inputText, setInputText] = useState('')
  const [outputText, setOutputText] = useState('')
  const [recipient, setRecipient] = useState('Colleague')
  const [outputFormat, setOutputFormat] = useState('Rewrite')
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleImprove = async (modifier = null) => {
    if (!inputText.trim()) return

    setIsLoading(true)
    setOutputText('')

    try {
      const response = await fetch('/api/refine', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input_text: inputText,
          recipient,
          output_format: outputFormat,
          tone_modifier: modifier
        })
      })

      if (!response.ok) {
        throw new Error('API request failed')
      }

      const data = await response.json()
      setOutputText(data.refined_text)
    } catch (error) {
      console.error(error)
      setOutputText('Error: Failed to connect to the AI service. Ensure the backend is running and the API key is valid.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = () => {
    if (outputText) {
      navigator.clipboard.writeText(outputText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleRegenerate = () => handleImprove()

  return (
    <div className="app-container animated-enter">
      <header>
        <h1>✨ MAIL POLISH</h1>
        <p>Convert messy or Hinglish thoughts into professional communication.</p>
      </header>

      <div className="main-grid">
        {/* Left Panel - Input */}
        <div className="panel">
          <div className="panel-header">
            <h2>Input</h2>
            <div className="controls">
              <select value={recipient} onChange={(e) => setRecipient(e.target.value)}>
                <option value="Colleague">Colleague</option>
                <option value="Boss">Boss / Manager</option>
                <option value="Client">Client</option>
              </select>
              <select value={outputFormat} onChange={(e) => setOutputFormat(e.target.value)}>
                <option value="Rewrite">Rewrite</option>
                <option value="Full Email">Full Email</option>
              </select>
            </div>
          </div>

          <textarea
            placeholder="Type your rough draft here... (e.g., 'mujhe kal chutti chahiye, boss ko message likh do politely')"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />

          <button
            className="btn-primary"
            onClick={() => handleImprove()}
            disabled={isLoading || !inputText.trim()}
          >
            {isLoading ? <div className="spinner"></div> : '✨ Improve'}
          </button>
        </div>

        {/* Right Panel - Output */}
        <div className="panel">
          <div className="panel-header">
            <h2>Output</h2>
            <button
              className={`copy-btn ${copied ? 'success' : ''}`}
              onClick={handleCopy}
              disabled={!outputText}
            >
              {copied ? '✓ Copied' : '📋 Copy'}
            </button>
          </div>

          <div className="output-area">
            {outputText ? (
              outputText
            ) : (
              <div className="empty-state">
                {isLoading ? 'Polishing your message...' : 'Your professional message will appear here.'}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="quick-actions">
            <button className="btn-secondary" onClick={() => handleImprove("Make it more polite and gentle")} disabled={isLoading || !outputText}>More Polite</button>
            <button className="btn-secondary" onClick={() => handleImprove("Make it more assertive and direct")} disabled={isLoading || !outputText}>More Assertive</button>
            <button className="btn-secondary" onClick={() => handleImprove("Shorten it to be very concise")} disabled={isLoading || !outputText}>Shorten</button>
            <button className="btn-secondary" onClick={handleRegenerate} disabled={isLoading || !outputText}>Regenerate</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
