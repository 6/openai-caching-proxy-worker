# Basic demo usage for openai's python client.
# Run with:
# poetry run python example.py
import os
from dotenv import load_dotenv
import openai

load_dotenv()  # take environment variables from .env.

api_key = os.getenv('OPENAI_API_KEY')
if not api_key:
  print('No OPENAI_API_KEY env var found. Please set one in `.env`')
  exit(1)

openai.api_key = api_key

# Set this to your local instance or Cloudflare Deployment:
openai.api_base = "http://localhost:8787/proxy"

def make_sample_requests():
  print('Making sample requests')
  completion1 = openai.Completion.create(
    model="text-ada-001",
    prompt="write a poem about computers"
  )
  print('Completion 1:')
  print(completion1)

  # Sample prompt but different options (different cache)
  completion2 = openai.Completion.create(
    model="text-ada-001",
    prompt="write a poem about computers",
    max_tokens=50
  )
  print('Completion 2:')
  print(completion2)

# Run sample requests twice.
# First set will not be cached. Second set will return cached results:
make_sample_requests()
make_sample_requests()
