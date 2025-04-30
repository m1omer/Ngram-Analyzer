
import re 
from collections import defaultdict, Counter 
import math 

# Tokenize text into sentences and words
def tokenize(text):

    # Splits at spaces following ., !, or ? punctuation
    # Returns a list where each element is a full sentence 
    sentences = re.split(r'(?<!\w\.\w.)(?<![A-Z][a-z]\.)(?<=\.|\?|!)\s', text)
    
    # List of strings
    # Basically every entry is a token (word or marker)
    tokens = []

    for sentence in sentences: 
        tokens.append('<s>') # start of sentence token

        # Lower cases and pulls out clean words from the, 
        # element (sentence) in sentence and appends the tokens to tokens[]
        tokens.extend(re.findall(r'\b\w+\b', sentence.lower()))

        tokens. append('</s>') # end of sentence token
    return tokens 


# extract n-grams and count occurrences 
def extract_ngrams(tokens, n):

    # Generates an n-gram iterator (zip object)
    # Creates n shifted views of the tokens
    # Zips them vertically to form n-gram tuples
    ngrams = zip(*[tokens[i:] for i in range(n)])

    # Loops over each n-gram tuple and joins the words with a space
    # Builds a list of n-gram strings 
    # Returns each n-gram string with how many times it occurs
    return Counter([" ".join(ngram) for ngram in ngrams])


def build_ngram_model(tokens, n):

    # Creates nested default dictionaries (account for unseen words)
    # Outer dictionary maps context (n-1 words) ➔ inner dictionary
    # Inner dictionary maps next word ➔ frequency count
    # lambda ensures that a new inner dictionary is created automatically when context is unseen
    model = defaultdict(lambda: defaultdict(int))

    # Iterate over the tokens but stop before running out of words
    # n-1 tokens are used for context, 1 token is used for the next-word prediction
    for i in range(len(tokens)- (n-1)):
        # Context: n-1 previous words
        # slicing so go up to i+n-1 but not including
        ngram = tuple(tokens[i:i+n-1])

        # Word following the context 
        next_word = tokens[i+n-1]

        #Count ho often next_word appears after context
        model[ngram][next_word] += 1

    return model

def calculate_surprisal(model, context, word):
    
    # Turn context into a tuple (in case it isn't already)
    context = tuple(context)

    # If context and word exist in model
    if context in model and word in model[context]:

        # How many times context was followed by word 
        word_count = model[context][word]

        # How many total times context occurred
        total_count = sum(model[context].values())

        # Conditional probability P(next_word | context)
        probability = word_count/total_count

        # Surprisal = -log2(probability)
        # Negative sign because log2(probability) is negative for p < 1, and we want positive surprisal
        suprisal = -math.log2(probability)

    else: 
        # If context or word not seen before, surprisal is infinite 
        suprisal = -float('inf')

    return suprisal

