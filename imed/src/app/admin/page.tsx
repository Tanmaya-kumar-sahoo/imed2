"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ChangeEvent } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

export default function AdminPage() {
  const { data: session, status } = useSession();
  
  // Redirect to sign-in only in production if the user isn't an admin
  if (
    process.env.NODE_ENV === "production" &&
    status !== "loading" &&
    (!session || session.user?.role !== "admin")
  ) {
    redirect("/auth/signin");
  }
  
  const [settings, setSettings] = useState({
    model: "mistralai/mistral-7b-instruct:free",
    temperature: "0.7",
    topP: "0.95",
    maxTokens: "500",
    promptTemplate: `You are an AI medical assistant providing medicine recommendations based on symptoms. Your task is to analyze the symptoms and provide appropriate medicine recommendations.

Patient Information:
- Symptoms: {{symptoms}}
- Age: {{age}}
- Gender: {{gender}}
- Pre-existing conditions: {{preExistingConditions}}
- Severity: {{severity}}

Please provide a comprehensive response with the following sections:
1. Possible Condition: Identify the most likely condition based on the symptoms.
2. Recommended Medicines: List 2-4 appropriate medications (both prescription and over-the-counter), including:
   - Medicine name (generic and brand names)
   - Whether prescription is required
   - Brief description of how it helps
3. Doctor Visit Recommendation: Advise whether and when the patient should see a doctor.
4. Additional Advice: Provide lifestyle recommendations, preventive measures, and specific considerations based on their profile.

Important guidelines:
1. Be direct and practical with your advice
2. For severe symptoms, always recommend consulting a healthcare professional
3. Clearly mark which medicines require prescriptions
4. If you detect potential emergency conditions (like heart attack, stroke, etc.), emphasize seeking immediate medical attention
5. Consider the patient's age, gender, and pre-existing conditions in your recommendations
6. Provide evidence-based advice that is helpful for the specific condition
`,
  });

  const [apiKey, setApiKey] = useState("");
  const [saving, setSaving] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);

  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem("aiSettings");
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error("Error parsing saved settings:", error);
      }
    }

    const savedApiKey = localStorage.getItem("openaiApiKey");
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Test API connection
  const testConnection = async () => {
    if (!apiKey) {
      toast.error("Please enter an API key first");
      return;
    }

    setTestingConnection(true);
    
    try {
      const response = await fetch("/api/test-openai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          apiKey: apiKey,
          model: settings.model,
        }),
      });

      if (response.ok) {
        toast.success("✅ API connection successful!");
      } else {
        const errorData = await response.text();
        toast.error(`❌ API connection failed: ${errorData}`);
      }
    } catch (error) {
      console.error("Connection test error:", error);
      toast.error("❌ Network error. Please check your connection.");
    } finally {
      setTestingConnection(false);
    }
  };

  const handleSave = () => {
    setSaving(true);
    
    try {
      // Validate settings
      const temp = parseFloat(settings.temperature);
      const topP = parseFloat(settings.topP);
      const maxTokens = parseInt(settings.maxTokens);

      if (temp < 0 || temp > 1) {
        toast.error("Temperature must be between 0 and 1");
        setSaving(false);
        return;
      }

      if (topP < 0 || topP > 1) {
        toast.error("Top P must be between 0 and 1");
        setSaving(false);
        return;
      }

      if (maxTokens < 50 || maxTokens > 2000) {
        toast.error("Max tokens must be between 50 and 2000");
        setSaving(false);
        return;
      }

      // Save settings to localStorage
      localStorage.setItem("aiSettings", JSON.stringify(settings));
      
      // Save API key separately
      if (apiKey) {
        localStorage.setItem("openaiApiKey", apiKey);
      } else {
        localStorage.removeItem("openaiApiKey");
      }
      
      setTimeout(() => {
        toast.success("✅ AI settings saved successfully");
        setSaving(false);
      }, 500);
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("❌ Failed to save settings");
      setSaving(false);
    }
  };

  const handleReset = () => {
    setSettings({
      model: "mistralai/mistral-7b-instruct:free",
      temperature: "0.7",
      topP: "0.95",
      maxTokens: "500",
      promptTemplate: `You are an AI medical assistant providing medicine recommendations based on symptoms. Your task is to analyze the symptoms and provide appropriate medicine recommendations.

Patient Information:
- Symptoms: {{symptoms}}
- Age: {{age}}
- Gender: {{gender}}
- Pre-existing conditions: {{preExistingConditions}}
- Severity: {{severity}}

Please provide a comprehensive response with the following sections:
1. Possible Condition: Identify the most likely condition based on the symptoms.
2. Recommended Medicines: List 2-4 appropriate medications (both prescription and over-the-counter), including:
   - Medicine name (generic and brand names)
   - Whether prescription is required
   - Brief description of how it helps
3. Doctor Visit Recommendation: Advise whether and when the patient should see a doctor.
4. Additional Advice: Provide lifestyle recommendations, preventive measures, and specific considerations based on their profile.

Important guidelines:
1. Be direct and practical with your advice
2. For severe symptoms, always recommend consulting a healthcare professional
3. Clearly mark which medicines require prescriptions
4. If you detect potential emergency conditions (like heart attack, stroke, etc.), emphasize seeking immediate medical attention
5. Consider the patient's age, gender, and pre-existing conditions in your recommendations
6. Provide evidence-based advice that is helpful for the specific condition
`,
    });
    setApiKey("");
    localStorage.removeItem("aiSettings");
    localStorage.removeItem("openaiApiKey");
    toast.info("🔄 Settings reset to default values");
  };

  // Show loading state while checking authentication
  if (status === "loading") {
    return (
      <div className="container py-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">🛠️ AI Configuration Panel</h1>
        <p className="text-muted-foreground">
          Welcome, <strong>{session?.user?.name}</strong>! Customize how the AI generates medicine recommendations.
        </p>
        <div className="mt-2 inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
          👑 Admin Access
        </div>
      </div>
      
      <div className="grid gap-6">
        <Card className="border-blue-200 bg-blue-50/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🔑 API Configuration
              {apiKey && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                  ✓ Connected
                </span>
              )}
            </CardTitle>
            <CardDescription>
              Connect to the OpenAI API to enable AI-enhanced recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">
                  OpenAI API Key
                </label>
                <div className="flex gap-2">
                  <Input
                    type="password"
                    placeholder="sk-..."
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="flex-1"
                  />
                  <Button 
                    variant="outline" 
                    onClick={testConnection}
                    disabled={testingConnection || !apiKey}
                  >
                    {testingConnection ? "Testing..." : "Test"}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Get your API key from <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">platform.openai.com/api-keys</a>
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">
                  AI Model
                </label>
                <Input
                  name="model"
                  placeholder="Model name"
                  value={settings.model}
                  onChange={handleChange}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Recommended: gpt-3.5-turbo (fast), gpt-4o (better), gpt-4-turbo (best)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>⚙️ Generation Parameters</CardTitle>
            <CardDescription>
              Fine-tune how the AI generates responses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">
                  Temperature ({settings.temperature})
                </label>
                <Input
                  name="temperature"
                  type="number"
                  min="0"
                  max="1"
                  step="0.1"
                  placeholder="0.7"
                  value={settings.temperature}
                  onChange={handleChange}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  0 = consistent, 1 = creative
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">
                  Top P ({settings.topP})
                </label>
                <Input
                  name="topP"
                  type="number"
                  min="0"
                  max="1"
                  step="0.05"
                  placeholder="0.95"
                  value={settings.topP}
                  onChange={handleChange}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Controls response diversity
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">
                  Max Tokens ({settings.maxTokens})
                </label>
                <Input
                  name="maxTokens"
                  type="number"
                  min="50"
                  max="2000"
                  step="50"
                  placeholder="500"
                  value={settings.maxTokens}
                  onChange={handleChange}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Response length limit
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>💬 Prompt Template</CardTitle>
            <CardDescription>
              Customize how the AI is instructed to generate recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div>
              <Textarea
                name="promptTemplate"
                placeholder="Enter your custom prompt template"
                className="min-h-[300px] font-mono text-sm"
                value={settings.promptTemplate}
                onChange={handleChange}
              />
              <div className="mt-2 p-3 bg-gray-50 rounded-md">
                <p className="text-xs font-medium text-gray-700 mb-1">Available placeholders:</p>
                <div className="flex flex-wrap gap-2">
                  {["{{symptoms}}", "{{age}}", "{{gender}}", "{{preExistingConditions}}", "{{severity}}"].map((placeholder) => (
                    <code key={placeholder} className="text-xs bg-gray-200 px-2 py-1 rounded">
                      {placeholder}
                    </code>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={handleReset}>
              🔄 Reset to Default
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "💾 Saving..." : "💾 Save Settings"}
            </Button>
          </CardFooter>
        </Card>
        
        <Card className="border-yellow-200 bg-yellow-50/30">
          <CardHeader>
            <CardTitle>📊 System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${apiKey ? 'bg-green-500' : 'bg-red-500'}`}></span>
                <span>API Key: {apiKey ? 'Connected' : 'Not Set'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                <span>Model: {settings.model}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                <span>Admin: {session?.user?.email}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-md">
        <h3 className="font-medium text-blue-800 mb-2">💡 Usage Guidelines</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Settings are saved in your browser and apply immediately</li>
          <li>• Test your API connection before using AI features</li>
          <li>• Lower temperature for more consistent medical advice</li>
          <li>• Higher max tokens for more detailed responses</li>
          <li>• Use placeholders in prompt templates for dynamic content</li>
        </ul>
      </div>
    </div>
  );
} 