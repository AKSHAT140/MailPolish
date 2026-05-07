import os
from google import genai
from groq import Groq

SYSTEM_PROMPT = """You are ToneFix, an expert AI communication assistant. Your job is to convert messy, emotional, or Hinglish input into professional, constructive communication.

Constraints:
- Eliminate any accidental rudeness, anger, or confusion.
- Keep the core intent (request, complaint, feedback) but make it highly professional and constructive.
- If the input is in Hindi or Hinglish, translate and refine it into professional English.
- Output ONLY the refined text or email. Do not include introductory phrases like "Here is the rewritten text:"."""


def _build_prompt(text: str, recipient: str, output_format: str, tone_modifier: str = None) -> str:
    prompt = f"""
Input Text: "{text}"
Recipient: {recipient}
Output Format: {output_format}
"""
    if output_format.lower() == "full email":
        prompt += "\n- Since the output format is 'Full Email', structure it properly with a Subject line, Greeting, Body, and Closing."

    if tone_modifier:
        prompt += f"\n- Additional Instruction: {tone_modifier}"

    return prompt


def _try_groq(prompt: str) -> str:
    """Try Groq API (fast inference, generous free tier)."""
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise ValueError("GROQ_API_KEY not set")

    client = Groq(api_key=api_key)
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": prompt}
        ],
        temperature=0.7,
        max_tokens=1024,
    )
    return response.choices[0].message.content.strip()


def _try_gemini(prompt: str) -> str:
    """Try Google Gemini API as fallback."""
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY not set")

    client = genai.Client(api_key=api_key)
    full_prompt = SYSTEM_PROMPT + "\n\n" + prompt

    models_to_try = ['gemini-2.0-flash', 'gemini-2.5-flash', 'gemini-2.0-flash-lite']

    last_error = None
    for model_name in models_to_try:
        try:
            response = client.models.generate_content(
                model=model_name,
                contents=full_prompt
            )
            return response.text.strip()
        except Exception as e:
            last_error = e
            print(f"  Gemini model {model_name} failed: {e}")
            continue

    raise Exception(f"All Gemini models failed. Last error: {last_error}")


def generate_professional_text(text: str, recipient: str, output_format: str, tone_modifier: str = None) -> str:
    prompt = _build_prompt(text, recipient, output_format, tone_modifier)

    # Provider chain: Groq first (faster), then Gemini as fallback
    providers = [
        ("Groq", _try_groq),
        ("Gemini", _try_gemini),
    ]

    last_error = None
    for provider_name, provider_fn in providers:
        try:
            print(f"Trying {provider_name}...")
            result = provider_fn(prompt)
            print(f"[OK] {provider_name} succeeded")
            return result
        except Exception as e:
            last_error = e
            print(f"[FAIL] {provider_name} failed: {e}")
            continue

    return f"Error: All AI providers failed. Last error: {str(last_error)}"
