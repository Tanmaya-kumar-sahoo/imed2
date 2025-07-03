# OpenRouter API Setup

## IMPORTANT: AI-Only Mode Configuration

This application now operates in **AI-Only mode**. The OpenRouter API key is **required** for the application to function properly. There is no fallback to local database anymore.

## Getting an API Key

1. **Sign up for OpenRouter**
   - Visit [OpenRouter](https://openrouter.ai/)
   - Create an account or sign in
   - Navigate to your account settings

2. **Generate an API Key**
   - Find the API Keys section
   - Create a new API key
   - Copy the key (it starts with "sk-")

## Adding Your API Key

### Option 1: Environment File (Recommended)

1. Create a `.env.local` file in the project root if it doesn't exist
2. Add the following line with your actual API key:
   ```
   OPENAI_API_KEY=sk-your-openrouter-api-key-here
   ```
3. Restart your development server:
   ```
   npm run dev
   ```

### Option 2: Admin Interface

1. Log in as an administrator
2. Navigate to the Admin page (`/admin`)
3. Find the API key settings section
4. Enter your OpenRouter API key
5. Save the settings

## Troubleshooting

If you see the error "Unknown OpenRouter error" or "API key required", it means:

1. You haven't added a valid API key yet
2. The key you added is invalid or expired
3. There's a connectivity issue with OpenRouter

Check your API key and ensure it's correctly formatted. If problems persist, generate a new key from OpenRouter.

## API Usage and Costs

Note that using the OpenRouter API may incur costs depending on your usage. Monitor your usage on the OpenRouter dashboard to avoid unexpected charges. 