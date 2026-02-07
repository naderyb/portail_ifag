from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from schemas import ChatRequest, ChatResponse
from services.llm import ask_llm

import os
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv
from pathlib import Path
from typing import Any, cast

from google.generativeai.client import configure  # ✅ Pylance-safe

# ─────────────────────────────────────────────
# 1️⃣ Load environment variables
# ─────────────────────────────────────────────
ENV_PATH = Path(__file__).resolve().parent / ".env"
load_dotenv(ENV_PATH)

# ─────────────────────────────────────────────
# 2️⃣ Configure Gemini (NO warning)
# ─────────────────────────────────────────────
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
assert GOOGLE_API_KEY, "❌ GOOGLE_API_KEY not found"

configure(api_key=GOOGLE_API_KEY)
print("✅ Gemini configured")

# ─────────────────────────────────────────────
# 3️⃣ Database
# ─────────────────────────────────────────────
DB_URL = os.getenv("DATABASE_URL")
assert DB_URL, "❌ DATABASE_URL not found"

# ─────────────────────────────────────────────
# 4️⃣ FastAPI app
# ─────────────────────────────────────────────
app = FastAPI()

# ─────────────────────────────────────────────
# 5️⃣ CORS
# ─────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:8000",
        "https://ifagation.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─────────────────────────────────────────────
# 6️⃣ Helpers
# ─────────────────────────────────────────────
def extract_module_from_message(message: str) -> str | None:
    msg = message.lower()

    modules = [
        "sécurité informatique",
        "cloud computing",
        "gestion de projet",
        "systèmes distribués",
        "développement web",
        "langue anglaise",
        "compilation",
    ]

    for module in modules:
        if module in msg:
            return module

    return None


def fetch_note_for_module(user_message: str) -> str:
    module = extract_module_from_message(user_message)
    print("🧠 Module:", module)

    if not module:
        return "Le module n'est pas précisé."

    try:
        conn = psycopg2.connect(DB_URL, cursor_factory=RealDictCursor)
        cursor = conn.cursor()

        cursor.execute(
            """
            SELECT module_name, grade, coefficient
            FROM public.notes
            WHERE lower(module_name) = lower(%s)
            LIMIT 1;
            """,
            (module,),
        )

        row = cast(dict[str, Any] | None, cursor.fetchone())

        cursor.close()
        conn.close()

        if not row:
            return f"Aucune note trouvée pour {module}."

        return (
            f"Note trouvée :\n"
            f"- Module : {row['module_name']}\n"
            f"- Note : {row['grade']}/20\n"
            f"- Coefficient : {row['coefficient']}"
        )

    except Exception as e:
        print("❌ DB ERROR:", e)
        return "Erreur lors de la récupération de la note."

# ─────────────────────────────────────────────
# 7️⃣ Chat endpoint
# ─────────────────────────────────────────────
@app.post("/chat", response_model=ChatResponse)
def chat(req: ChatRequest):
    try:
        db_summary = fetch_note_for_module(req.message)

        full_prompt = (
            f"tu es IfagHelper, assistant universitaire de l’IFAG.\n"
            f"Informations de la base de données:\n{db_summary}\n\n"
            f"Question de l'étudiant: {req.message}\n\n"
            f"Réponds de manière claire et concise en utilisant les informations ci-dessus si pertinentes."
        )

        reply = ask_llm(full_prompt)
        return {"reply": reply}

    except Exception as e:
        print("❌ IA ERROR:", e)
        return {"reply": "Le service IA est temporairement indisponible."}
