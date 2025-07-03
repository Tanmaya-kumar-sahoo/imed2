"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ApiTestPage() {
  const [apiKey, setApiKey] = useState('');
  const [testResult, setTestResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [savedKey, setSavedKey] = useState('');

  // Load saved API key from localStorage
  useEffect(() => {
    const storedKey = localStorage.getItem('openaiApiKey');
    if (storedKey) {
      setApiKey(storedKey);
      setSavedKey(storedKey);
    }
  }, []);

  // Save API key to localStorage
  const saveApiKey = () => {
    localStorage.setItem('openaiApiKey', apiKey);
    setSavedKey(apiKey);
    alert('API key saved to browser storage');
  };

  // Test the API connection
  const testApiConnection = async () => {
    setLoading(true);
    setTestResult(null);
    
    try {
      const key = apiKey || undefined;
      const queryParams = key ? `?key=${encodeURIComponent(key)}` : '';
      const response = await fetch(`/api/test-openai${queryParams}`);
      const data = await response.json();
      setTestResult(data);
    } catch (error) {
      console.error('API test error:', error);
      setTestResult({
        success: false,
        message: 'Failed to execute API test',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">OpenRouter API Connection Test</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>API Key Configuration</CardTitle>
            <CardDescription>
              Enter your OpenRouter API key to test the connection
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="api-key">OpenRouter API Key</Label>
                <Input 
                  id="api-key"
                  type="password"
                  placeholder="sk-or-..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
                <p className="text-xs text-gray-500">
                  Your API key is only stored in your browser's local storage.
                </p>
              </div>
              
              <div className="flex space-x-2">
                <Button onClick={saveApiKey} variant="outline">
                  Save Key
                </Button>
                <Button onClick={testApiConnection} disabled={loading}>
                  {loading ? 'Testing...' : 'Test Connection'}
                </Button>
              </div>
              
              {savedKey && (
                <p className="text-sm text-green-600">
                  ✓ API key is saved in browser storage
                </p>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
            <CardDescription>
              Connection test results will appear here
            </CardDescription>
          </CardHeader>
          <CardContent>
            {testResult ? (
              <div className="space-y-4">
                <div className={`p-3 rounded-md ${testResult.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                  <p className="font-medium">
                    {testResult.success ? '✓ Connection Successful' : '✗ Connection Failed'}
                  </p>
                  <p className="text-sm">{testResult.message}</p>
                </div>
                
                {testResult.error && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
                    <p className="font-medium">Error Details:</p>
                    <p className="text-sm break-all">{testResult.error}</p>
                  </div>
                )}
                
                {testResult.success && (
                  <div>
                    <p className="font-medium">Response:</p>
                    <p className="text-sm mt-1 p-2 bg-gray-50 rounded border">{testResult.response}</p>
                    {testResult.modelUsed && (
                      <p className="text-xs text-gray-500 mt-2">Model used: {testResult.modelUsed}</p>
                    )}
                  </div>
                )}
                
                <div className="pt-4 border-t">
                  <p className="text-xs text-gray-500">
                    {testResult.success 
                      ? 'Your API key is working correctly. You can now use the medicine recommendation form.'
                      : 'Please check your API key and try again. Make sure you have a valid OpenRouter API key.'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p>No test performed yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Troubleshooting Guide</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">Common Issues:</h3>
                <ul className="list-disc pl-5 space-y-1 mt-2 text-sm">
                  <li>Make sure your API key starts with <code>sk-or-</code> for OpenRouter</li>
                  <li>Check that your OpenRouter account has sufficient credits</li>
                  <li>Verify that the API key hasn't expired or been revoked</li>
                  <li>Ensure your internet connection is stable</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-medium">Next Steps:</h3>
                <ul className="list-disc pl-5 space-y-1 mt-2 text-sm">
                  <li>After a successful test, try using the medicine recommendation form</li>
                  <li>If you continue to have issues, check the browser console for more detailed error information</li>
                  <li>Try regenerating your API key in your OpenRouter account</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 