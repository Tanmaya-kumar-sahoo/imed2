"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { VoiceAssistant } from "@/components/voice-assistant";
import { Select as BasicSelect } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import React from "react";

// Add Medicine type for AI output
interface Medicine {
  name: string;
  prescription?: boolean;
  description?: string;
  dose?: string;
  quantity?: number | string;
}

export function MedicineForm({ initialPatient, readOnly: initialReadOnly = false }: { initialPatient?: any, readOnly?: boolean }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [emergencyDetected, setEmergencyDetected] = useState(false);
  const [usingAI, setUsingAI] = useState(true);
  const [aiSettings, setAiSettings] = useState<any>(null);
  const [currentVoiceField, setCurrentVoiceField] = useState<string>("");
  const [readOnly, setReadOnly] = useState(initialReadOnly);
  const showLegacyFields = false;

  // Health profile (replacing patient presets)
  const [healthProfile, setHealthProfile] = useState<any>(null);
  const [showHealthProfileDialog, setShowHealthProfileDialog] = useState(false);
  const [editingHealthProfile, setEditingHealthProfile] = useState({
    height: "",
    weight: "",
    blood_type: "",
    allergies: "",
    chronic_conditions: "",
    medications: ""
  });

  const form = useForm({
    defaultValues: {
      symptoms: "",
      age: "",
      gender: "",
      conditions: "",
      severity: "normal",
    },
    resolver: async (values) => {
      // Validate symptoms field
      const errors: Record<string, { message: string }> = {};
      
      if (!validateSymptoms(values.symptoms)) {
        errors.symptoms = { message: "Please provide more detailed symptoms" };
      }
      
      return {
        values,
        errors,
      };
    }
  });

  // Handle voice assistant results
  const handleVoiceResult = (field: string, value: string) => {
    console.log(`Medicine Form: Received voice result for field "${field}" with value "${value}"`);
    
    switch (field) {
      case 'symptoms':
        form.setValue('symptoms', value);
        console.log(`Medicine Form: Set symptoms field to "${value}"`);
        break;
      case 'age':
        form.setValue('age', value);
        console.log(`Medicine Form: Set age field to "${value}"`);
        break;
      case 'gender':
        form.setValue('gender', value);
        console.log(`Medicine Form: Set gender field to "${value}"`);
        break;
      case 'conditions':
        form.setValue('conditions', value);
        console.log(`Medicine Form: Set conditions field to "${value}"`);
        break;
      case 'severity':
        form.setValue('severity', value);
        console.log(`Medicine Form: Set severity field to "${value}"`);
        break;
      default:
        console.log(`Medicine Form: Unknown field "${field}" received`);
    }
    setCurrentVoiceField(""); // Clear the current field after setting value
  };

  // Check for potential emergency conditions
  const checkForEmergency = (value: string) => {
    const emergencyKeywords = [
      "heart attack", "chest pain", "stroke", "can't breathe", "cannot breathe",
      "severe allergic reaction", "anaphylaxis", "unconscious", "unresponsive",
      "seizure", "overdose", "suicide", "bleeding heavily", "gunshot", "stab",
      "cancer", "tumor", "brain tumor", "meningitis", "pulmonary embolism",
      "appendicitis", "sepsis", "blood poisoning", "blood clot"
    ];
    
    for (const keyword of emergencyKeywords) {
      if (value.toLowerCase().includes(keyword)) {
        return true;
      }
    }
    return false;
  };

  // Client-side validation for symptoms
  const validateSymptoms = (value: string) => {
    if (!value.trim()) {
      return "Please enter your symptoms";
    }
    
    if (value.trim().length < 5) {
      return "Please provide more detailed symptoms";
    }
    
    // Check for gibberish or random characters
    const randomCharPattern = /^[a-z]{1,3}[0-9]*$/i;
    if (randomCharPattern.test(value.replace(/\s/g, ''))) {
      return "Please enter valid symptoms, not random characters";
    }
    
    // Check for common conversational phrases that aren't symptoms
    const conversationalPhrases = [
      "hey", "hello", "hi ", "how are you", "what are you", "what is this", 
      "test", "testing", "just testing", "asdf", "qwerty", "upto"
    ];
    
    for (const phrase of conversationalPhrases) {
      if (value.toLowerCase().includes(phrase)) {
        return "Please describe your medical symptoms, not conversational phrases";
      }
    }
    
    // Check for common medical terms
    const medicalTerms = [
      "pain", "ache", "sore", "hurt", "fever", "cough", "cold", "flu", 
      "headache", "nausea", "vomit", "dizzy", "tired", "fatigue", "sick",
      "throat", "nose", "eye", "ear", "stomach", "back", "chest", "head",
      "skin", "rash", "itch", "swelling", "breath", "breathing", "sneeze",
      "runny", "congestion", "diarrhea", "constipation", "blood", "pressure",
      "heart", "attack", "stroke", "diabetes", "asthma", "allergic"
    ];
    
    // Require at least one medical term
    let hasMedicalTerm = false;
    for (const term of medicalTerms) {
      if (value.toLowerCase().includes(term)) {
        hasMedicalTerm = true;
        break;
      }
    }
    
    if (!hasMedicalTerm) {
      return "Please include specific symptoms (e.g., headache, fever, cough)";
    }
    
    return true;
  };

  // Load AI settings from localStorage
  const { data: session, status } = useSession();
  const isGuest = status === "unauthenticated";
  const isAdmin = session?.user?.email === "koushikchodraju008@gmail.com";
  
  useEffect(() => {
    try {
      // Load AI settings
      const savedSettings = localStorage.getItem("aiSettings");
      const apiKey = localStorage.getItem("openaiApiKey");
      
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        // Add API key to settings if available
        if (apiKey) {
          setAiSettings({
            ...parsedSettings,
            apiKey,
            temperature: parseFloat(parsedSettings.temperature),
            topP: parseFloat(parsedSettings.topP),
            maxTokens: parseInt(parsedSettings.maxTokens),
          });
          console.log("AI settings and API key loaded from localStorage");
        } else {
          setAiSettings({
            ...parsedSettings,
            temperature: parseFloat(parsedSettings.temperature),
            topP: parseFloat(parsedSettings.topP),
            maxTokens: parseInt(parsedSettings.maxTokens),
          });
          console.log("AI settings loaded from localStorage, but no API key found");
        }
      }
    } catch (error) {
      console.error("Error loading AI settings:", error);
    }
  }, []);

  // Check for emergency when symptoms change
  useEffect(() => {
    const symptoms = form.watch("symptoms");
    if (symptoms && symptoms.length > 5) {
      const isEmergency = checkForEmergency(symptoms);
      setEmergencyDetected(isEmergency);
      
      if (isEmergency) {
        toast.warning("⚠️ This may be a serious medical condition. Please contact a hospital or emergency services if you need immediate help.", {
          duration: 10000,
        });
        
        // Always use AI, even for emergency conditions
        setUsingAI(true);
      } else {
        setUsingAI(true);
      }
    }
  }, [form.watch("symptoms")]);

  // Load presets (only for logged-in users)
  useEffect(() => {
    if (isGuest) return;
    (async () => {
      try {
        const res = await fetch("/api/patient-presets");
        if (res.ok) {
          const data = await res.json();
          setHealthProfile(data);
          
          // Auto-populate form with health profile data if available
          if (data && data.chronic_conditions) {
            // Extract age and gender from legacy format if stored in chronic_conditions
            const match = data.chronic_conditions.match(/Age: (\d+), Gender: (male|female|other)/);
            if (match) {
              form.setValue("age", match[1]);
              form.setValue("gender", match[2]);
            }
            
            // Use other health profile fields for conditions
            const conditions = [
              data.allergies && `Allergies: ${data.allergies}`,
              data.chronic_conditions && `Chronic conditions: ${data.chronic_conditions}`,
              data.medications && `Current medications: ${data.medications}`
            ].filter(Boolean).join(". ");
            
            if (conditions) {
              form.setValue("conditions", conditions);
            }
          }
        }
      } catch (e) {
        console.error("Failed to load health profile", e);
      }
    })();
  }, [isGuest, form]);

  // Pre-fill form with patient data if provided
  useEffect(() => {
    if (initialPatient) {
      form.setValue("age", initialPatient.age ? String(initialPatient.age) : "");
      form.setValue("conditions", initialPatient.chronicConditions || "");
      form.setValue("severity", "normal");
      // You can add more fields as needed
    }
  }, [initialPatient]);

  // Safe error handler function to avoid undefined/null issues
  const safeErrorHandler = (error: any): string => {
    // Default error message
    let message = "An error occurred while processing your request";
    
    // Handle various error formats defensively
    if (error) {
      // If error is a string
      if (typeof error === 'string') {
        return error;
      }
      
      // If error is an Error object
      if (error instanceof Error) {
        return error.message || message;
      }
      
      // If error is an object with an error field
      if (typeof error === 'object') {
        if (error.error) {
          if (typeof error.error === 'string') {
            return error.error;
          } else if (typeof error.error === 'object' && error.error.message) {
            return error.error.message;
          }
        }
        
        // If error has a message field
        if (error.message && typeof error.message === 'string') {
          return error.message;
        }
      }
    }
    
    // Return default message if nothing else worked
    return message;
  };

  // Handle form submission
  const handleSubmit = async (e: any) => {
    if (e && typeof e.preventDefault === 'function') {
    e.preventDefault();
    }
    setLoading(true);
    setError("");
    setResult("");
    
    try {
      // Format the prompt with clear labels
      const symptoms = form.getValues("symptoms");
      const age = form.getValues("age");
      const gender = form.getValues("gender");
      const conditions = form.getValues("conditions");
      const severity = form.getValues("severity");
      // Add health profile fields from profileFields state
      const bloodType = profileFields.bloodType || initialPatient?.bloodType || '';
      const allergies = profileFields.allergies || initialPatient?.allergies || '';
      const chronicConditions = profileFields.chronicConditions || initialPatient?.chronicConditions || '';
      const medications = profileFields.medications || initialPatient?.medications || '';
      
      const promptText = `
Symptoms: ${symptoms}
Age: ${age}
Gender: ${gender}
Blood type: ${bloodType}
Allergies: ${allergies}
Chronic conditions: ${chronicConditions}
Medications: ${medications}
Pre-existing conditions: ${conditions}
Severity: ${severity}`;
      
      console.log("Submitting form with prompt:", promptText);
      
      // Use OpenRouter/AI for recommendations
      setUsingAI(true);
      const response = await fetch('/api/medicine', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: promptText,
          age: age,
          gender: gender,
          bloodType: bloodType,
          allergies: allergies,
          chronicConditions: chronicConditions,
          medications: medications,
          aiSettings: localStorage.getItem("openaiApiKey") ? { apiKey: localStorage.getItem("openaiApiKey") } : null,
          forceAI: true // Always use AI even for emergency conditions
        }),
      });
      
      // Get content type to determine how to process the response
      const contentType = response.headers.get("content-type");
      
      // Process the response based on content type
      if (contentType && contentType.includes("application/json")) {
        // Handle JSON response
        const jsonData = await response.json();
        
        if (!response.ok) {
          // Simple approach that avoids using replace() entirely
          let errorMessage = "AI service error";
          
          // Simplify error handling to avoid any undefined issues
          if (jsonData && typeof jsonData === 'object') {
            errorMessage = safeErrorHandler(jsonData);
          }
          
          throw new Error(errorMessage);
        }
        
        // If we got valid JSON but no error, convert to string for display
        setResult(typeof jsonData === 'string' ? jsonData : JSON.stringify(jsonData));
      } else {
        // Handle text response
        const textData = await response.text();
        
        if (!response.ok) {
          throw new Error(`Error ${response.status}: Request failed`);
        }
        
        setResult(textData);
      }
      
      // Scroll to recommendations
      setTimeout(() => {
        document.getElementById("recommendations-section")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
      
    } catch (err) {
      console.error('Error getting recommendations:', err);
      
      // Format the error message to be more user-friendly
      let errorMsg = safeErrorHandler(err);
      
      // Replace any technical error message with a user-friendly one
      if (errorMsg.includes('properties of undefined') || 
          errorMsg.includes('replace') || 
          errorMsg.includes('undefined') ||
          errorMsg.includes('null')) {
        errorMsg = 'AI service configuration error. Please check your API key.';
      }
      
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Helper to robustly extract JSON from AI result
  function robustParseAIResult(resultText: string): any | null {
    // Try direct JSON parse
    try {
      return JSON.parse(resultText);
    } catch {}
    // Try to extract JSON object from within text
    const objMatch = resultText.match(/\{[\s\S]*"Medicines JSON"[\s\S]*\}/);
    if (objMatch) {
      try {
        return JSON.parse(objMatch[0]);
      } catch {}
    }
    return null;
  }

  // Use robust parser
  const parsedResult = result ? robustParseAIResult(result) : null;

  // Local state for editable medicines list
  const [editableMeds, setEditableMeds] = useState<Medicine[]>([]);

  // When parsedResult changes, initialize editableMeds
  useEffect(() => {
    const newMeds = parsedResult && parsedResult["Medicines JSON"] && Array.isArray(parsedResult["Medicines JSON"])
      ? parsedResult["Medicines JSON"]
      : [];
    if (JSON.stringify(newMeds) !== JSON.stringify(editableMeds)) {
      setEditableMeds(newMeds);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result]);

  // Handlers for editing/removing medicines
  const handleMedChange = (idx: number, newMed: Medicine) => {
    setEditableMeds((meds) => meds.map((m, i) => (i === idx ? newMed : m)));
  };
  const handleRemove = (idx: number) => {
    setEditableMeds((meds) => meds.filter((_, i) => i !== idx));
  };

  const handleAddMedicine = () => {
    setEditableMeds((meds) => [
      ...meds,
      { name: '', dose: '', quantity: '', description: '', prescription: false }
    ]);
  };

  const handleVerifyRecommendation = async () => {
    try {
      // Ensure patientId is the integer from initialPatient
      const patientId = typeof initialPatient?.id === 'string' ? parseInt(initialPatient.id, 10) : initialPatient?.id;
      const res = await fetch('/api/verify-recommendation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          medicines: editableMeds,
          patient: { ...healthProfile, id: patientId },
          patientId, // explicitly pass patientId as integer
          symptoms: form.getValues('symptoms'),
          severity: form.getValues('severity'),
          recommendedMedicines: JSON.stringify(editableMeds),
          recommendation: parsedResult,
        }),
      });
      if (res.ok) {
        toast.success('Recommendation verified and saved!');
      } else {
        toast.error('Failed to verify recommendation.');
      }
    } catch (err) {
      toast.error('Error verifying recommendation.');
    }
  };

  const [editingProfile, setEditingProfile] = useState(false);
  const [profileFields, setProfileFields] = useState({
    height: initialPatient?.height || '',
    weight: initialPatient?.weight || '',
    bloodType: initialPatient?.bloodType || '',
    allergies: initialPatient?.allergies || '',
    chronicConditions: initialPatient?.chronicConditions || '',
    medications: initialPatient?.medications || '',
    age: initialPatient?.age || '',
    gender: initialPatient?.gender || '',
  });

  useEffect(() => {
    if (initialPatient) {
      setProfileFields({
        height: initialPatient.height || '',
        weight: initialPatient.weight || '',
        bloodType: initialPatient.bloodType || '',
        allergies: initialPatient.allergies || '',
        chronicConditions: initialPatient.chronicConditions || '',
        medications: initialPatient.medications || '',
        age: initialPatient.age || '',
        gender: initialPatient.gender || '',
      });
    }
  }, [initialPatient]);

  const handleProfileSave = async () => {
    if (!initialPatient?.id) return;
    const res = await fetch(`/api/patients/${initialPatient.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profileFields),
    });
    const result = await res.json();
    if (result.success) {
      setEditingProfile(false);
      setReadOnly(true);
      // Optionally update parent state if needed
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Get Medicine Recommendations</CardTitle>
          <CardDescription>
            Tell us about your symptoms to get medicine recommendations.
          </CardDescription>
          <div className="flex items-center mt-2 text-xs text-muted-foreground">
            <div className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 text-white">
                <path d="M10.75 2.75a.75.75 0 00-1.5 0v8.614L6.295 8.235a.75.75 0 10-1.09 1.03l4.25 4.5a.75.75 0 001.09 0l4.25-4.5a.75.75 0 00-1.09-1.03l-2.955 3.129V2.75z" />
              </svg>
            </div>
            <span>
              {aiSettings?.apiKey 
                ? "Powered by AI Medical Assistant" 
                : "Powered by Medical Database"}
              {aiSettings?.apiKey && " ✓"}
            </span>
            {!isGuest && isAdmin && (
              <a href="/admin" className="ml-auto text-blue-500 hover:underline">Customize AI</a>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {!aiSettings?.apiKey && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md text-blue-800">
              <p className="font-medium">Voice Assistant Available!</p>
              <p className="text-sm">Click the voice buttons next to each field to use speech input. Works best in Chrome, Safari, or Edge browsers.</p>
            </div>
          )}
          {isGuest && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="font-medium">You&apos;re using Guest Mode</p>
              <p className="text-sm">Sign in to access more features. <a href="/auth/signin" className="text-blue-500 underline">Sign in now</a></p>
            </div>
          )}
          {emergencyDetected && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-800">
              <p className="font-bold">⚠️ Potential Serious Medical Condition Detected</p>
              <p className="text-sm">If you are experiencing a medical emergency, please contact your local hospital or emergency services immediately.</p>
            </div>
          )}
          {initialPatient && (
            <Card className="mb-4">
                  <CardHeader>
                    <CardTitle>Health Profile</CardTitle>
                <CardDescription>Manage your health information for better recommendations</CardDescription>
                  </CardHeader>
              <CardContent>
                <div className="p-4 bg-blue-50 rounded">
                  <div className="flex justify-between mb-2">
                    <span>Height: {profileFields.height || '—'}</span>
                    <span>Weight: {profileFields.weight || '—'}</span>
                      </div>
                  <div>Blood Type: {profileFields.bloodType || '—'}</div>
                  <div>Allergies: {profileFields.allergies || 'none'}</div>
                  <div>Chronic Conditions: {profileFields.chronicConditions || 'none'}</div>
                  <div>Medications: {profileFields.medications || 'none'}</div>
                  <div>Age: {profileFields.age || '—'}</div>
                  <div>Gender: {profileFields.gender || '—'}</div>
                          </div>
                <Button className="mt-4" onClick={() => setEditingProfile(true)} type="button">Edit Profile</Button>
                <Dialog open={editingProfile} onOpenChange={setEditingProfile}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Edit Health Profile</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="flex gap-4">
                        <div className="flex-1">
                          <label className="block text-sm font-medium mb-1">Height</label>
                          <Input value={profileFields.height} onChange={e => setProfileFields(f => ({ ...f, height: e.target.value }))} />
                        </div>
                        <div className="flex-1">
                          <label className="block text-sm font-medium mb-1">Weight</label>
                          <Input value={profileFields.weight} onChange={e => setProfileFields(f => ({ ...f, weight: e.target.value }))} />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Blood Type</label>
                        <Input value={profileFields.bloodType} onChange={e => setProfileFields(f => ({ ...f, bloodType: e.target.value }))} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Allergies</label>
                        <Input value={profileFields.allergies} onChange={e => setProfileFields(f => ({ ...f, allergies: e.target.value }))} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Chronic Conditions</label>
                        <Input value={profileFields.chronicConditions} onChange={e => setProfileFields(f => ({ ...f, chronicConditions: e.target.value }))} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Medications</label>
                        <Input value={profileFields.medications} onChange={e => setProfileFields(f => ({ ...f, medications: e.target.value }))} />
                      </div>
                      <div className="flex gap-4">
                        <div className="flex-1">
                          <label className="block text-sm font-medium mb-1">Age</label>
                          <Input value={profileFields.age || ''} onChange={e => setProfileFields(f => ({ ...f, age: e.target.value }))} onKeyDown={e => { if (e.key === 'Enter') handleProfileSave(); }} />
                        </div>
                        <div className="flex-1">
                          <label className="block text-sm font-medium mb-1">Gender</label>
                          <Select value={profileFields.gender || ''} onValueChange={val => setProfileFields(f => ({ ...f, gender: val }))}>
                            <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="male">Male</SelectItem>
                                <SelectItem value="female">Female</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                    </div>
                      </div>
                    </div>
                    <DialogFooter className="mt-4 flex gap-2">
                      <Button variant="outline" onClick={() => setEditingProfile(false)} type="button">Cancel</Button>
                      <Button onClick={handleProfileSave} type="button">Save</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                  </CardContent>
                </Card>
              )}
          {readOnly && !initialPatient && (
            <Button className="mb-4" onClick={() => setReadOnly(false)} type="button">Edit</Button>
          )}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              {/* Patient Card (only for logged-in users) */}
              {/* Symptoms field moved below Patient card for better UX */}
              <FormField
                control={form.control}
                name="symptoms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center justify-between">
                      <span>Symptoms <span className="text-destructive">*</span></span>
                      <VoiceAssistant onResult={handleVoiceResult} currentField={currentVoiceField==='symptoms'?'symptoms':undefined} disabled={loading}/>
                    </FormLabel>
                    <FormControl>
                      <Textarea placeholder="Describe your symptoms in detail" className="min-h-32" {...field} required onFocus={()=>setCurrentVoiceField('symptoms')} readOnly={readOnly} onKeyDown={e => { if (e.key === 'Enter') form.handleSubmit(handleSubmit)(e); }}/>
                    </FormControl>
                    <FormDescription>
                      <span>Please describe all the symptoms you are experiencing in detail.</span>
                    </FormDescription>
                    {error && <p className="text-sm font-medium text-destructive">{error}</p>}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="conditions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center justify-between">
                      <span>Pre-existing Conditions</span>
                      <VoiceAssistant 
                        onResult={handleVoiceResult}
                        currentField={currentVoiceField === 'conditions' ? 'conditions' : undefined}
                        disabled={loading}
                      />
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Any pre-existing health conditions, allergies, or medications"
                        {...field}
                        onFocus={() => setCurrentVoiceField('conditions')}
                        readOnly={readOnly}
                        onKeyDown={e => { if (e.key === 'Enter') form.handleSubmit(handleSubmit)(e); }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="severity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center justify-between">
                      <span>Condition Severity</span>
                      <VoiceAssistant 
                        onResult={handleVoiceResult}
                        currentField={currentVoiceField === 'severity' ? 'severity' : undefined}
                        disabled={loading}
                      />
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} /* readOnly={readOnly} */>
                      <FormControl>
                        <SelectTrigger onFocus={() => setCurrentVoiceField('severity')} onKeyDown={e => { if (e.key === 'Enter') form.handleSubmit(handleSubmit)(e); }}>
                          <SelectValue placeholder="Select severity" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="severe">Severe</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Indicate how severe your symptoms are.
                      <span className="text-blue-600 ml-2">
                        💬 Use voice button to say &quot;normal&quot; or &quot;severe&quot;
                      </span>
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={readOnly || loading}>
                {loading ? "Processing..." : "Get Recommendations"}
              </Button>
              
              {emergencyDetected && (
                <p className="text-center text-sm text-red-600 mt-2">
                  ⚠️ For serious medical conditions, please seek immediate medical attention instead of using this tool.
                </p>
              )}
              
              <div className="text-xs text-center text-muted-foreground mt-2">
                {usingAI ? 
                  "Your recommendations will include AI-enhanced personalized advice" : 
                  "For emergency conditions, only verified medical database information will be used"
                }
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card id="recommendations-section">
        <CardHeader>
          <CardTitle>Recommendations</CardTitle>
          <CardDescription>
            AI-generated medicine recommendations based on your information
            <span className="block text-xs mt-1 opacity-75">Recommendations are not stored and come directly from AI</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="min-h-80">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : parsedResult && editableMeds.length > 0 ? (
              <div>
                {parsedResult["Possible Condition"] && (
                  <div style={{ marginBottom: 16, fontWeight: 'bold', fontSize: '1.1rem' }}>
                    Possible Condition: <span style={{ fontWeight: 'normal' }}>{parsedResult["Possible Condition"]}</span>
                  </div>
                )}
                <h3 className="font-semibold text-lg mb-2">Medicines & Quantity</h3>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 16 }}>
                    <thead>
                      <tr style={{ background: '#f3f4f6' }}>
                        <th style={{ padding: 8, border: '1px solid #e5e7eb' }}>Name</th>
                        <th style={{ padding: 8, border: '1px solid #e5e7eb' }}>Dose</th>
                        <th style={{ padding: 8, border: '1px solid #e5e7eb' }}>Quantity</th>
                        <th style={{ padding: 8, border: '1px solid #e5e7eb' }}>Description</th>
                        <th style={{ padding: 8, border: '1px solid #e5e7eb' }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {editableMeds.map((med, idx) => (
                        <tr key={idx}>
                          <td style={{ padding: 8, border: '1px solid #e5e7eb' }}>
                            <input
                              type="text"
                              value={med.name}
                              onChange={e => handleMedChange(idx, { ...med, name: e.target.value })}
                              placeholder="Name"
                              style={{ width: '100%' }}
                            />
                          </td>
                          <td style={{ padding: 8, border: '1px solid #e5e7eb' }}>
                            <input
                              type="text"
                              value={med.dose || ''}
                              onChange={e => handleMedChange(idx, { ...med, dose: e.target.value })}
                              placeholder="Dose"
                              style={{ width: '100%' }}
                            />
                          </td>
                          <td style={{ padding: 8, border: '1px solid #e5e7eb' }}>
                            <input
                              type="text"
                              value={med.quantity || ''}
                              onChange={e => handleMedChange(idx, { ...med, quantity: e.target.value })}
                              placeholder="Quantity"
                              style={{ width: '100%' }}
                            />
                          </td>
                          <td style={{ padding: 8, border: '1px solid #e5e7eb' }}>
                            <input
                              type="text"
                              value={med.description || ''}
                              onChange={e => handleMedChange(idx, { ...med, description: e.target.value })}
                              placeholder="Description"
                              style={{ width: '100%' }}
                            />
                          </td>
                          <td style={{ padding: 8, border: '1px solid #e5e7eb', textAlign: 'center' }}>
                            <button onClick={() => handleRemove(idx)} style={{ color: 'red', fontSize: 20, border: 'none', background: 'none', cursor: 'pointer' }}>❌</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button
                  type="button"
                  onClick={handleAddMedicine}
                  style={{
                    background: '#2563eb', color: 'white', padding: '8px 16px', borderRadius: 4, border: 'none', cursor: 'pointer', fontWeight: 500
                  }}
                >
                  + Add Medicine
                </button>
                <button
                  type="button"
                  onClick={handleVerifyRecommendation}
                  style={{
                    background: '#22c55e', color: 'white', padding: '8px 16px', borderRadius: 4, border: 'none', cursor: 'pointer', fontWeight: 500, marginLeft: 8
                  }}
                >
                  ✓ Verify
                </button>
              </div>
            ) : !parsedResult && result ? (
              <div className="text-red-600 text-center my-4">
                Sorry, we couldn't process the recommendations. Please try again or rephrase your symptoms.
              </div>
            ) : (
              <div className="text-center text-muted-foreground h-64 flex flex-col items-center justify-center">
                <p>Enter your symptoms to get medicine recommendations.</p>
                <div className="mt-4 p-4 border rounded-md bg-muted/20 text-left max-w-md mx-auto">
                  <p className="text-sm font-medium mb-2">Example of good symptom descriptions:</p>
                  <ul className="text-sm list-disc pl-5 space-y-1">
                    <li>&quot;I have a throbbing headache, fever of 101°F, and a sore throat for the past 2 days.&quot;</li>
                    <li>&quot;Experiencing stomach pain, nausea, and vomiting after eating.&quot;</li>
                    <li>&quot;Runny nose, sneezing, and itchy eyes that get worse when I&apos;m outside.&quot;</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="border-t pt-4 text-xs text-muted-foreground">
          <p>
            IMPORTANT: IMED provides general information only and should not replace professional medical advice. Always consult with qualified healthcare providers regarding health concerns.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}