"use client";

import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Volume2 } from "lucide-react";

// Voice recognition interface
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: (event: any) => void;
  onerror: (event: any) => void;
  onstart: (event: any) => void;
  onend: (event: any) => void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

interface VoiceAssistantProps {
  onResult: (field: string, value: string) => void;
  currentField?: string;
  disabled?: boolean;
}

export function VoiceAssistant({ onResult, currentField, disabled = false }: VoiceAssistantProps) {
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        setSpeechSupported(true);
        
        try {
          const recognitionInstance = new SpeechRecognition();
          
          // Configure recognition
          recognitionInstance.continuous = false;
          recognitionInstance.interimResults = false;
          recognitionInstance.lang = 'en-US';
          
          // Handle successful recognition
          recognitionInstance.onresult = (event) => {
            if (event.results.length > 0) {
              const transcript = event.results[0][0].transcript.trim();
              console.log('Speech recognized:', transcript);
              
              if (transcript && currentField) {
                handleSpeechResult(transcript, currentField);
              }
            }
          };
          
          // Handle errors
          recognitionInstance.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            
            let errorMessage = 'Speech recognition error. Please try again.';
            
            switch (event.error) {
              case 'network':
                errorMessage = 'Network error. Please check your connection and try again.';
                break;
              case 'not-allowed':
                errorMessage = 'Microphone access denied. Please allow microphone access and try again.';
                break;
              case 'no-speech':
                errorMessage = 'No speech detected. Please speak clearly and try again.';
                break;
              case 'audio-capture':
                errorMessage = 'Microphone not found. Please check your microphone and try again.';
                break;
              case 'service-not-allowed':
                errorMessage = 'Speech recognition service not available. Please try again later.';
                break;
            }
            
            toast.error(errorMessage);
            setIsListening(false);
          };
          
          // Handle start
          recognitionInstance.onstart = () => {
            console.log('Speech recognition started');
            setIsListening(true);
            
            // Set a timeout to stop recognition after 10 seconds
            timeoutRef.current = setTimeout(() => {
              if (recognitionInstance) {
                recognitionInstance.stop();
                toast.warning('Listening timeout. Please try again.');
              }
            }, 10000);
          };
          
          // Handle end
          recognitionInstance.onend = () => {
            console.log('Speech recognition ended');
            setIsListening(false);
            
            if (timeoutRef.current) {
              clearTimeout(timeoutRef.current);
              timeoutRef.current = null;
            }
          };
          
          setRecognition(recognitionInstance);
          setIsInitialized(true);
          
        } catch (error) {
          console.error('Failed to initialize speech recognition:', error);
          setSpeechSupported(false);
          toast.error('Speech recognition is not supported in this browser.');
        }
      } else {
        setSpeechSupported(false);
        console.log('Speech recognition not supported');
      }
    }

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [currentField]);

  // Handle speech recognition result
  const handleSpeechResult = (transcript: string, fieldName: string) => {
    const cleanedTranscript = transcript.toLowerCase().trim();
    console.log(`Voice Assistant: Processing "${transcript}" for field "${fieldName}"`);
    
    try {
      switch (fieldName) {
        case 'symptoms':
          // For symptoms, use the transcript as-is (but cleaned)
          onResult(fieldName, transcript.trim());
          toast.success('Symptoms recorded via voice');
          console.log(`Voice Assistant: Set symptoms to "${transcript.trim()}"`);
          break;
          
        case 'age':
          // Extract age from speech
          const ageValue = extractAge(cleanedTranscript);
          if (ageValue) {
            onResult(fieldName, ageValue);
            toast.success('Age recorded via voice');
            console.log(`Voice Assistant: Set age to "${ageValue}"`);
          } else {
            console.log(`Voice Assistant: Could not extract age from "${cleanedTranscript}"`);
            toast.error('Could not understand age. Please say a number between 1 and 120.');
          }
          break;
          
        case 'gender':
          // Extract gender from speech
          const genderValue = extractGender(cleanedTranscript);
          if (genderValue) {
            onResult(fieldName, genderValue);
            toast.success('Gender recorded via voice');
            console.log(`Voice Assistant: Set gender to "${genderValue}"`);
          } else {
            console.log(`Voice Assistant: Could not extract gender from "${cleanedTranscript}"`);
            toast.error('Could not understand gender. Please say "male", "female", "non-binary", or "other".');
          }
          break;
          
        case 'conditions':
          // For conditions, use the transcript as-is
          onResult(fieldName, transcript.trim());
          toast.success('Medical conditions recorded via voice');
          console.log(`Voice Assistant: Set conditions to "${transcript.trim()}"`);
          break;
          
        case 'severity':
          // Extract severity from speech
          const severityValue = extractSeverity(cleanedTranscript);
          if (severityValue) {
            onResult(fieldName, severityValue);
            toast.success('Severity recorded via voice');
            console.log(`Voice Assistant: Set severity to "${severityValue}"`);
          } else {
            console.log(`Voice Assistant: Could not extract severity from "${cleanedTranscript}"`);
            toast.error('Could not understand severity. Please say "normal", "mild", or "severe".');
          }
          break;
          
        default:
          console.log(`Voice Assistant: Unknown field "${fieldName}"`);
          toast.error('Unknown field for voice input');
      }
    } catch (error) {
      console.error('Voice Assistant: Error processing speech result:', error);
      toast.error('Error processing voice input. Please try again.');
    }
  };

  // Extract age from speech
  const extractAge = (text: string): string | null => {
    // Look for direct numbers first
    const numberMatch = text.match(/\b(\d{1,3})\b/);
    if (numberMatch) {
      const age = parseInt(numberMatch[1]);
      if (age >= 1 && age <= 120) {
        return age.toString();
      }
    }
    
    // Look for word numbers
    const wordNumbers: { [key: string]: string } = {
      'one': '1', 'two': '2', 'three': '3', 'four': '4', 'five': '5',
      'six': '6', 'seven': '7', 'eight': '8', 'nine': '9', 'ten': '10',
      'eleven': '11', 'twelve': '12', 'thirteen': '13', 'fourteen': '14', 'fifteen': '15',
      'sixteen': '16', 'seventeen': '17', 'eighteen': '18', 'nineteen': '19', 'twenty': '20',
      'thirty': '30', 'forty': '40', 'fifty': '50', 'sixty': '60', 'seventy': '70', 
      'eighty': '80', 'ninety': '90'
    };
    
    for (const [word, number] of Object.entries(wordNumbers)) {
      if (text.includes(word)) {
        return number;
      }
    }
    
    return null;
  };

  // Extract gender from speech
  const extractGender = (text: string): string | null => {
    // More robust gender extraction with better pattern matching
    const cleanText = text.toLowerCase().trim();
    
    // Check for male (but not female)
    if ((cleanText.includes('male') && !cleanText.includes('female')) || 
        cleanText.includes('man') || cleanText.includes('boy') || 
        cleanText.includes('gentleman') || cleanText === 'm') {
      return 'male';
    }
    
    // Check for female
    if (cleanText.includes('female') || cleanText.includes('woman') || 
        cleanText.includes('girl') || cleanText.includes('lady') || 
        cleanText === 'f') {
      return 'female';
    }
    
    // Check for non-binary variations
    if (cleanText.includes('non-binary') || cleanText.includes('nonbinary') || 
        cleanText.includes('non binary') || cleanText.includes('enby') ||
        cleanText.includes('nb')) {
      return 'non-binary';
    }
    
    // Check for other
    if (cleanText.includes('other') || cleanText.includes('prefer not to say') ||
        cleanText.includes('rather not say')) {
      return 'other';
    }
    
    return null;
  };

  // Extract severity from speech
  const extractSeverity = (text: string): string | null => {
    const cleanText = text.toLowerCase().trim();
    
    // Check for severe/serious variations
    if (cleanText.includes('severe') || cleanText.includes('serious') || 
        cleanText.includes('bad') || cleanText.includes('intense') ||
        cleanText.includes('terrible') || cleanText.includes('awful') ||
        cleanText.includes('extreme') || cleanText.includes('unbearable') ||
        cleanText.includes('very bad') || cleanText.includes('really bad')) {
      return 'severe';
    }
    
    // Check for normal/mild variations
    if (cleanText.includes('normal') || cleanText.includes('mild') || 
        cleanText.includes('regular') || cleanText.includes('moderate') ||
        cleanText.includes('okay') || cleanText.includes('manageable') ||
        cleanText.includes('bearable') || cleanText.includes('not severe') ||
        cleanText.includes('not bad') || cleanText.includes('tolerable')) {
      return 'normal';
    }
    
    return null;
  };

  // Start voice recognition
  const startListening = () => {
    if (!recognition || !speechSupported || !isInitialized || disabled) {
      if (!speechSupported) {
        toast.error('Speech recognition is not supported in this browser. Please use Chrome, Safari, or Edge.');
      } else if (!currentField) {
        toast.error('Please select a field to use voice input.');
      }
      return;
    }

    try {
      setIsListening(true);
      recognition.start();
      
      // Provide field-specific guidance
      const fieldInstructions: { [key: string]: string } = {
        symptoms: 'Describe your symptoms clearly (e.g., "I have a headache and fever")',
        age: 'Say your age as a number (e.g., "25" or "twenty five")',
        gender: 'Say "male", "female", "non-binary", or "other"',
        conditions: 'Describe any medical conditions or allergies you have',
        severity: 'Say "normal" or "severe"'
      };
      
      const instruction = fieldInstructions[currentField || ''] || 'Speak clearly';
      toast.info(`Listening for ${currentField}... ${instruction}`, {
        duration: 5000,
      });
      
    } catch (error) {
      console.error('Error starting recognition:', error);
      toast.error('Failed to start speech recognition. Please try again.');
      setIsListening(false);
    }
  };

  // Stop voice recognition
  const stopListening = () => {
    if (recognition && isListening) {
      recognition.stop();
    }
  };

  if (!speechSupported) {
    return null; // Don't render anything if not supported
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={isListening ? stopListening : startListening}
        disabled={disabled || !currentField || !isInitialized}
        className={`${isListening ? 'bg-red-50 border-red-200 text-red-700' : 'bg-blue-50 border-blue-200 text-blue-700'}`}
      >
        {isListening ? (
          <>
            <MicOff className="h-4 w-4 mr-1" />
            Stop
          </>
        ) : (
          <>
            <Mic className="h-4 w-4 mr-1" />
            Voice
          </>
        )}
      </Button>
      
      {isListening && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Volume2 className="h-3 w-3 animate-pulse" />
          Listening...
        </div>
      )}
    </div>
  );
}

export function SingleVoiceAssistant({ onResult, disabled = false }: { onResult: (fields: { symptoms?: string, age?: string, gender?: string, conditions?: string, severity?: string }) => void, disabled?: boolean }) {
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        setSpeechSupported(true);
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'en-US';
        recognitionRef.current.onresult = (event) => {
          if (event.results.length > 0) {
            const transcript = event.results[0][0].transcript.trim();
            const fields = parseAllFields(transcript);
            onResult(fields);
          }
        };
        recognitionRef.current.onerror = () => setIsListening(false);
        recognitionRef.current.onend = () => setIsListening(false);
      }
    }
  }, [onResult]);

  function parseAllFields(transcript: string) {
    // Simple NLP: look for keywords and numbers
    const fields: any = {};
    const lower = transcript.toLowerCase();
    // Symptoms: everything before 'age' or 'years old' or 'gender'
    const ageMatch = lower.match(/(\d{1,3})\s*(years? old|year old|yo|age)?/);
    if (ageMatch) fields.age = ageMatch[1];
    if (lower.includes('male')) fields.gender = 'male';
    else if (lower.includes('female')) fields.gender = 'female';
    else if (lower.includes('non-binary')) fields.gender = 'non-binary';
    else if (lower.includes('other')) fields.gender = 'other';
    if (lower.includes('severe')) fields.severity = 'severe';
    else if (lower.includes('normal')) fields.severity = 'normal';
    // Conditions: after 'condition' or 'diagnosed with'
    const condMatch = lower.match(/condition[s]? (.+?)(,|\.|$)/);
    if (condMatch) fields.conditions = condMatch[1].trim();
    // Symptoms: everything before age/gender/condition
    let symptoms = transcript;
    if (ageMatch) symptoms = symptoms.split(ageMatch[0])[0];
    if (symptoms) fields.symptoms = symptoms.trim();
    return fields;
  }

  const startListening = () => {
    if (recognitionRef.current && speechSupported && !disabled) {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  return (
    <Button type="button" onClick={startListening} disabled={!speechSupported || disabled || isListening} className="ml-2">
      {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />} Speak All Details
    </Button>
  );
} 