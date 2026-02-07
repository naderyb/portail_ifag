import google.generativeai as genai

model = genai.GenerativeModel(model_name="gemini-2.5-flash-lite")

def ask_llm(full_prompt: str) -> str:
    try:
        response = model.generate_content(
            full_prompt,
            generation_config={
                "temperature": 0.3,
                "max_output_tokens": 200
            }
        )
        return response.text
    except Exception as e:
        print(f"❌ Gemini API Error: {e}")
        raise
