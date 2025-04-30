
from nlp_utils import tokenize, build_ngram_model, extract_ngrams, calculate_surprisal

# FastAPI backend for PDF upload and n-gram analysis 

# This server allows user to upload a pdf file, extract its text,
# and prepare it for NLP analysis. 

# import required libraries
from fastapi import FastAPI, UploadFile, File, Form, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from collections import Counter
import fitz # PyMUPDF 

# Initialize FastAPI app
app = FastAPI()

# Add CORS settings to allow frontend (React app) to communicate with backend (FastAPI)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow requests from any origin (for development only; restrict later for production)
    allow_credentials=True,  # Allow cookies / auth headers if needed
    allow_methods=["*"],  # Allow all HTTP methods: GET, POST, etc.
    allow_headers=["*"],  # Allow all headers (like Content-Type, Authorization, etc.)
)


# Initialize global vars
tokens = None
model = None
n_value = None

# define get route
@app.get("/")
async def root(): 
    return {"message": "Backend is live!"}


# Upload route (PDF upload and text attraction)
@app.post("/upload")
async def upload_pdf(file: UploadFile = File(...), n: int = Form(...)):
    """
    - Accepts a PDF and an n-gram size (n) from the client.
    - Extracts the text from the uploaded PDF.
    - Returns a preview of the extracted text along with the n-gram setting
    """

    try:
        global tokens, model, n_value

        # 📥 Read the uploaded file contents into memory
        contents = await file.read()

        #  Open the PDF using PyMuPDF from the in-memory contents
        doc = fitz.open(stream = contents, filetype = "pdf")

        # Extract text from every page 
        text = "" 
        for page in doc: 
            text += page.get_text()
        
        # Use NLP Functions
        tokens = tokenize(text) # Tokenize the text
        model = build_ngram_model(tokens, n) # Build the n-gram model
        n_value = n

        # return a JSON response with 
        return {
            "preview": text[:500],
            "n_value": n,
            "message": "Text extracted successfully!"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

@app.get("/ngrams")

async def get_top_ngrams(top_k: int = Query(10, description = "Number of top n-grams to return")):
    
    """
   Parameters:
    - top_k (int): Number of top n-grams to return (default is 10)

    Returns:
    - JSON object with the most common n-grams and their counts
    """

    # Checks if a document has been uploaded and processed
    if tokens is None or model is None:
        raise HTTPException(status_code=400, detail="No document uploaded yet. Please upload a PDF first.")

    # Use the existing tokens and n_value to extract all n-grams
    ngrams_counter = extract_ngrams(tokens, n_value)

    # Filter out n-grams that contain <s> or </s>
    filtered_ngrams = [(ngram, count) for ngram, count in ngrams_counter.items()
                        if "<s>" not in ngram and "</s>" not in ngram]
    
    # Sort the filtered ngrams by count descending
    filtered_ngrams = sorted(filtered_ngrams, key = lambda x: x[1], reverse = True)

    # Get the top_k most common n-grams
    most_common = filtered_ngrams[:top_k]

    # Return the result as a JSON response
    return{"top_ngrams": most_common}


@app.get("/stats")
async def get_document_stats():
    """
    Returns basic statistics about the uploaded document:
    - Total number of tokens
    - Unique vocabulary size
    - Number of sentences
    - Average sentence length
    """

    # Check if document has been uploaded and processed 
    if tokens is None or model is None:
        raise HTTPException(status_code=400, detail="No document uploaded yet. Please upload a PDF first.")

    # Count total number of tokens (ignoring special sentence tokens <s> and </s>)

    # First token → what we want to keep.
    # for token in tokens → loop over every token.
    # if token not in ("<s>", "</s>") → filter out bad ones.
    total_tokens = len([
        token for token in tokens
        if token not in ("<s>", "</s>")
    ])

    # Count unique tokens (vocabulary size), ignoring special markers
    unique_tokens = len(set(
        token for token in tokens
        if token not in ("<s>", "</s>")
    ))

    # Count number of sentences by counting <s> markers 
    # Each <s> indicates the start of a new sentence 
    num_sentences = tokens.count("<s>")

    # Calculate average sentence length (tokens divided by sentences)
    avg_sentence_length = (
        round(total_tokens/num_sentences, 2)

        # Handle case where no sentences exist
        if num_sentences > 0 
        else None
    )

    # Sentence length distribution

    sentence_lengths = []
    current_len = 0
    for token in tokens:
        if token == "<s>":
            current_len = 0
        elif token == "</s>":
            if current_len > 0:
                sentence_lengths.append(current_len)
        else:
            current_len += 1
    length_distribution = dict(Counter(sentence_lengths))
        

    # Return all calculated statistics in a JSON object
    return{
        "total_tokens": total_tokens,
        "unique_vocab_size": unique_tokens,
        "num_sentences": num_sentences,
        "avg_sentence_length": avg_sentence_length,
        "sentence_length_distribution": length_distribution,
        "lexical_richness": round(unique_tokens / total_tokens, 4) if total_tokens else None


    }

@app.post("/predict", description = "Given (n-1) previous words from the uploaded document, predict the most likely next word.")
# Accepts the user typing a context
async def predict_next_word(context: str = Form(...)):
    """
    Predict the most likely next word given a context (n-1 previous words).

    Parameters:
    - context (str): The context (space-separated words) to base prediction on.

    Returns:
    - JSON object with the most likely next word and its probability 
    """

    # Ensure a document has been uploaded and processed 

    if tokens is None or model is None:
        raise HTTPException(status_code=400, detail="No document uploaded yet. Please upload a PDF first.")

    # Prepares the context (tokenizes and cleans user input)
    context_tokens = context.lower().split() # split into list of tokens 
    context_tokens = context_tokens[-(n_value - 1):] # take only the last n-1 words

    # Turn context into a tuple (because that's how we stored it in the model)
    context_tuple = tuple(context_tokens)

    # Check if context exists
    if context_tuple not in model:
        raise HTTPException(status_code=404, detail="Context not found in model. Try different last words from the uploaded document.")

    # Find the most probable next word 
    next_words = model[context_tuple]
    predicted_word = max(next_words, key = next_words.get) # word with the highest count 
    probability = next_words[predicted_word]/ sum(next_words.values())

    return {
        "predicted_word": predicted_word,
        "probability": round(probability, 4)
    }


@app.post("/surprisal")
async def calculate_surprisal_api(
    context: str = Form(..., description="Provide the last (n-1) words from the document."),
    word: str = Form(..., description="The specific next word to measure surprisal for.")
):
    """
    Calculate the surprisal (unexpectedness) of a word given a context.

    Parameters:
    - context (str): (n-1) previous words (space-separated)
    - word (str): next word to evaluate

    Returns:
    - JSON object with surprisal score (in bits)
    """

    if tokens is None or model is None:
        raise HTTPException(status_code=400, detail="No document uploaded yet.")

    # Process user input
    context_tokens = context.lower().split()
    context_tokens = context_tokens[-(n_value-1):]  # Only last (n-1) words
    context_tuple = tuple(context_tokens)

    # Check if context exists
    if context_tuple not in model:
        raise HTTPException(status_code=404, detail="Context not found in document.")

    # Check if word exists after context
    if word.lower() not in model[context_tuple]:
        raise HTTPException(status_code=404, detail="Word not found following given context.")

    # Calculate Surprisal 
    surprisal_value = calculate_surprisal(model, context_tokens, word.lower())

    return {
        "context": " ".join(context_tokens),
        "word": word.lower(),
        "surprisal_bits": round(surprisal_value, 4)
    }

@app.get("/top-words")
async def get_top_words():
    if tokens is None:
        raise HTTPException(status_code=400, detail="Upload a document first.")

    word_counts = Counter(token for token in tokens if token not in ("<s>", "</s>"))
    return {"top_words": word_counts.most_common(20)}

@app.get("/sentence-starters")
async def get_sentence_starters():
    if tokens is None:
        raise HTTPException(status_code=400, detail="No document uploaded.")

    starters = []
    for i in range(len(tokens) - 1):
        if tokens[i] == "<s>" and tokens[i+1] not in ("</s>", "<s>"):
            starters.append(tokens[i+1].lower())

    counter = Counter(starters)
    return {"top_starters": counter.most_common(10)}