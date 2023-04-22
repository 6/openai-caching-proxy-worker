require 'dotenv/load'
require 'openai'

# As api verision is hard-coded in proxy, we need to set it here to empty string
OpenAI.configuration.api_version = ""
# Set this to your local instance or Cloudflare deployment:
OpenAI.configuration.uri_base = "http://localhost:8787/proxy"
OpenAI.configuration.access_token = ENV.fetch('OPENAI_API_KEY')

client = OpenAI::Client.new

response = client.completions(
  parameters: {
      model: "text-davinci-001",
      prompt: "Once upon a time",
      max_tokens: 5
  })
puts response["choices"].map { |c| c["text"] }