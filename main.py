from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from nlp_utils import (
    build_ngram_model,
    predict_next_word,
    calculate_surprisal,
    extract_text_from_pdf,
    compute_stats,
    get_top_words,
    get_sentence_starters
)

app = FastAPI()

# ✅ Allow frontend requests from other domains like Vercel
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # You can change this to your actual frontend URL for better security
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables to hold models and processed data
model = {}
preview_text = ""
stats = {}

# Endpoint to handle PDF upload and n-gram processing
@app.post("/upload")
async def upload(file: UploadFile = File(...), n: int = Form(...)):
    try:
        content = await file.read()
        global model, preview_text, stats

        preview_text = extract_text_from_pdf(content)[:1000]  # Preview the first 1000 chars
        model = build_ngram_model(preview_text, n)
        stats = compute_stats(preview_text)

        return {"preview": preview_text}
    except Exception as e:
        print("Upload Error:", str(e))
        return JSONResponse(status_code=500, content={"error": "Upload failed."})

# Endpoint to get document stats
@app.get("/stats")
def get_stats():
    if not stats:
        return JSONResponse(status_code=400, content={"error": "No stats available. Upload a PDF first."})
    return stats

# Endpoint to get most frequent words
@app.get("/top-words")
def top_words():
    return {"top_words": get_top_words(preview_text)}

# Endpoint to get most frequent sentence starters
@app.get("/sentence-starters")
def sentence_starters():
    return {"top_starters": get_sentence_starters(preview_text)}

# Endpoint to predict next word given context
@app.post("/predict")
async def predict(context: str = Form(...)):
    if not model:
        return JSONResponse(status_code=400, content={"error": "Model not ready. Upload a PDF first."})
    try:
        predicted_word, probability = predict_next_word(model, context)
        return {
            "predicted_word": predicted_word,
            "probability": probability
        }
    except Exception as e:
        print("Prediction Error:", str(e))
        return JSONResponse(status_code=500, content={"error": "Prediction failed."})

# Endpoint to calculate surprisal of a given word in a given context
@app.post("/surprisal")
async def surprisal(context: str = Form(...), word: str = Form(...)):
    if not model:
        return JSONResponse(status_code=400, content={"error": "Model not ready. Upload a PDF first."})
    try:
        surprisal_bits = calculate_surprisal(model, context, word)
        return {
            "surprisal_bits": surprisal_bits
        }
    except Exception as e:
        print("Surprisal Error:", str(e))
        return JSONResponse(status_code=500, content={"error": "Surprisal calculation failed."})
