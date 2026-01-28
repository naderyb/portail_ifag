from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from schemas import ChatRequest, ChatResponse
from services.llm import ask_llm
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv
from typing import Any, cast
from pathlib import Path

load_dotenv(Path(__file__).resolve().parent / ".env")

DB_URL = os.getenv("DATABASE_URL")

app = FastAPI()

# Allow your Next.js frontend
origins = [
    os.getenv("url_frontend_localhost"),
    os.getenv("url_frontend_production")
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",        # Next.js local
        "http://127.0.0.1:8000",        # sometimes used
        "https://ifagation.vercel.app", # your deployed frontend
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def extract_module_from_message(message: str) -> str | None:
    msg = message.lower()

    keywords = [
        "sécurité informatique",
        "cloud computing",
        "gestion de projet",
        "systèmes distribués",
        "développement web",
        "langue anglaise",
        "compilation"
    ]

    for module in keywords:
        if module in msg:
            return module

    return None


def fetch_note_for_module(user_message: str) -> str:
    module = extract_module_from_message(user_message)
    print("🧠 Extracted module:", module)

    if not module:
        return "Le module n'est pas précisé."

    try:
        print("DATABASE_URL loaded as:", DB_URL)
        print("🔌 Connecting to DB with:", DB_URL)

        conn = psycopg2.connect(DB_URL, cursor_factory=RealDictCursor)
        cursor = conn.cursor()

        print("📦 Executing query for module:", module)

        query = """
            SELECT module_name, grade, coefficient
            FROM public.notes
            WHERE lower(module_name) = lower(%s)
            LIMIT 1;
        """

        cursor.execute(query, (module,))
        row = cast(dict[str, Any] | None, cursor.fetchone())
        print("📊 DB row:", row)

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
        print("ERREUR DB:", e)
        return "Erreur lors de la récupération de la note."


@app.post("/chat", response_model=ChatResponse)
def chat(req: ChatRequest):
    try:
        # 1️⃣ Fetch relevant info from DB
        db_summary = fetch_note_for_module(req.message)

        # 2️⃣ Merge with user prompt for context
        full_prompt = (
            "Tu es IfagHelper, un assistant universitaire IFAG.\n"
            "Réponds en utilisant les informations suivantes de la base si possible:\n"
            f"{db_summary}\n\n"
            f"Utilisateur: {req.message}\nBot:"
        )

        # 3️⃣ Call LLM
        print("LLM KEY:", os.getenv("GOOGLE_API_KEY"))
        reply = ask_llm(full_prompt)
        return {"reply": reply}

    except Exception as e:
        print("ERREUR IA:", e)
        return {"reply": "Le service IA est temporairement indisponible."}
