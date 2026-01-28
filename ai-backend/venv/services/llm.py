import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

genai.configure(api_key="AIzaSyDvxdUve1w-2z-mblBXPS8d3q7QA_55ttg")

model = genai.GenerativeModel(
    model_name="gemini-2.5-flash-lite",
    system_instruction=(
        "Tu es IfagHelper, un assistant universitaire IFAG. "
        "Tu aides les étudiants pour l’orientation, les absences "
        "et les démarches administratives. "
        "Tu es calme, clair, bienveillant et tu n’inventes jamais de données."
    )
)
    
def ask_llm(message: str) -> str:
    response = model.generate_content(
        message,
        generation_config={
            "temperature": 0.3,
            "max_output_tokens": 200
        }
    )

    return response.text