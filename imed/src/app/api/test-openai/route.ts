import { NextRequest } from 'next/server';

const DEFAULT_OPENROUTER_KEY = process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY || "";

export async function GET(req: NextRequest) {
  try {
    // Parse API key from query parameter or use default
    const url = new URL(req.url);
    const apiKey = url.searchParams.get('key') || DEFAULT_OPENROUTER_KEY;
    
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "No API key provided" }), { 
        status: 401, 
        headers: { "Content-Type": "application/json" } 
      });
    }
    
    // Simple test message
    const testMessage = "Hello, this is a test of the OpenRouter API connection. Please respond with 'Connection successful!'";
    
    // Make test request to OpenRouter
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "IMED API Test",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        model: "openai/gpt-3.5-turbo",
        messages: [{ role: "user", content: testMessage }],
        temperature: 0.7,
        max_tokens: 100
      })
    });
    
    // Parse response
    if (!res.ok) {
      const errorText = await res.text();
      console.error("OpenRouter test failed:", errorText);
      
      try {
        // Try to parse as JSON
        const errorJson = JSON.parse(errorText);
        return new Response(JSON.stringify({ 
          success: false,
          status: res.status,
          error: errorJson && errorJson.error 
            ? (typeof errorJson.error === 'string' 
                ? errorJson.error 
                : (errorJson.error.message || JSON.stringify(errorJson.error)))
            : "Unknown error",
          message: "OpenRouter test failed"
        }), { status: 500, headers: { "Content-Type": "application/json" } });
      } catch {
        // Return raw error
        return new Response(JSON.stringify({ 
          success: false,
          status: res.status,
          error: typeof errorText === 'string' ? errorText : "Unknown error", 
          message: "OpenRouter test failed" 
        }), { status: 500, headers: { "Content-Type": "application/json" } });
      }
    }
    
    // Handle successful response
    const data = await res.json();
    const content = data.choices?.[0]?.message?.content || "";
    
    return new Response(JSON.stringify({ 
      success: true,
      message: "OpenRouter connection successful",
      response: content,
      modelUsed: data.model
    }), { status: 200, headers: { "Content-Type": "application/json" } });
    
  } catch (err: any) {
    console.error("Test OpenRouter error:", err);
    return new Response(JSON.stringify({ 
      success: false,
      error: err.message || "Internal server error",
      message: "Failed to connect to OpenRouter API" 
    }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}

export async function POST(req: Request) {
  try {
    const { apiKey, model } = await req.json();
    const key = apiKey || DEFAULT_OPENROUTER_KEY;
    if (!key) {
      return new Response(JSON.stringify({ error: "No API key provided" }), { status: 401, headers: {"Content-Type":"application/json"}});
    }
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${key}`,
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "IMED API Test"
      },
      body: JSON.stringify({
        model: model || "mistralai/mistral-7b-instruct:free",
        messages: [{ role: "user", content: "Say OK" }],
        temperature: 0.2,
        max_tokens: 5
      })
    });
    if(!res.ok){
      const txt = await res.text();
      console.error("OpenRouter test failed", res.status, txt);
      return new Response(JSON.stringify({ success:false, status: res.status, error: txt || "Unknown error" }), { status: 500, headers:{"Content-Type":"application/json"}});
    }
    return new Response(JSON.stringify({ success:true }), { status:200, headers:{"Content-Type":"application/json"}});
  } catch(e:any){
    return new Response(JSON.stringify({ success:false, error:e.message || "Internal error" }), { status:500, headers:{"Content-Type":"application/json"}});
  }
} 