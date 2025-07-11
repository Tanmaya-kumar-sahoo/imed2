"use client";

import { Hero } from "@/components/hero";
import { MedicineForm } from "@/components/medicine-form";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { VoiceAssistant } from "@/components/voice-assistant";

// Real API call for patient search
async function fetchPatient(query: { id?: string; name?: string }) {
  const params = new URLSearchParams(query as any).toString();
  const res = await fetch(`/api/patients?${params}`);
  if (!res.ok) return null;
  return await res.json();
}

export default function Home() {
  const [searchValue, setSearchValue] = useState("");
  const [searchType, setSearchType] = useState<"id" | "name">("id");
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSearch = async () => {
    setLoading(true);
    setSelectedPatient(null);
    setNotFound(false);
    setPatients([]);
    const result = await fetchPatient(
      searchType === "id"
        ? { id: searchValue.trim() }
        : { name: searchValue.trim() }
    );
    if (searchType === "id") {
      if (result) {
        setSelectedPatient(result);
      } else {
        setNotFound(true);
      }
    } else {
      if (Array.isArray(result) && result.length > 0) {
        setPatients(result);
      } else {
        setNotFound(true);
      }
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen">
      <Hero />
      <section id="patient-search" className="py-10 bg-background">
        <div className="container">
          <div className="mx-auto max-w-2xl">
            <Card>
              <CardHeader>
                <CardTitle>Patient Search</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-4">
                  <select
                    value={searchType}
                    onChange={e => setSearchType(e.target.value as any)}
                    className="border rounded px-2 py-1"
                    onKeyDown={e => { if (e.key === 'Enter') handleSearch(); }}
                  >
                    <option value="id">Unique No</option>
                    <option value="name">Name</option>
                  </select>
                  <div className="flex items-center flex-1 gap-2">
                    <Input
                      placeholder={searchType === "id" ? "Enter Unique No" : "Enter Name"}
                      value={searchValue}
                      onChange={e => setSearchValue(e.target.value)}
                      className="flex-1"
                      onKeyDown={e => { if (e.key === 'Enter') handleSearch(); }}
                    />
                    {/* Voice Assistant for search input - consistent with medicine form */}
                    <VoiceAssistant 
                      onResult={(field, val) => {
                        if (field === "patient-search") setSearchValue(val);
                      }}
                      currentField={"patient-search"}
                      disabled={loading}
                    />
                  </div>
                  <Button onClick={handleSearch} disabled={loading || !searchValue}>
                    {loading ? "Searching..." : "Search"}
                  </Button>
                </div>
                {/* Show list of patients if searching by name and results found */}
                {patients.length > 0 && (
                  <div className="mt-4">
                    <h3 className="font-semibold mb-2">Matching Patients</h3>
                    <ul className="divide-y divide-gray-200">
                      {patients.map((p: any) => (
                        <li
                          key={p.id}
                          className="py-2 flex items-center justify-between hover:bg-muted rounded px-2"
                        >
                          <div className="flex-1 cursor-pointer" onClick={() => {
                            setSelectedPatient(p);
                            setPatients([]); // Hide the list
                          }}>
                            <b>{p.name}</b> (ID: {p.id})
                            {p.age && <span className="ml-2 text-sm text-muted-foreground">Age: {p.age}</span>}
                            {p.phone && <span className="ml-2 text-sm text-muted-foreground">Phone: {p.phone}</span>}
                          </div>
                          <Button size="sm" variant="outline" onClick={e => { e.stopPropagation(); router.push(`/patients/${p.id}/history`); }}>History</Button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {/* Show selected patient details */}
                {selectedPatient && (
                  <div className="mt-4">
                    <Button onClick={() => { setSelectedPatient(null); setNotFound(false); }} className="mb-4">Back to Search</Button>
                    <Button onClick={() => router.push(`/patients/${selectedPatient.id}/history`)} className="ml-2">History</Button>
                    <h3 className="font-semibold mb-2">Patient Details</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <div><b>Unique No:</b> {selectedPatient.id}</div>
                      <div><b>Name:</b> {selectedPatient.name}</div>
                      <div><b>Age:</b> {selectedPatient.age}</div>
                      <div><b>Phone:</b> {selectedPatient.phone}</div>
                      <div><b>Address:</b> {selectedPatient.address}</div>
                      <div><b>Blood Type:</b> {selectedPatient.bloodType}</div>
                      <div><b>Allergies:</b> {selectedPatient.allergies}</div>
                      <div><b>Chronic Conditions:</b> {selectedPatient.chronicConditions}</div>
                      <div><b>Medications:</b> {selectedPatient.medications}</div>
                    </div>
                  </div>
                )}
                {notFound && (
                  <div className="mt-4">
                    <p>No patient found.</p>
                    <Button className="mt-2" onClick={() => router.push("/patients/create")}>Create New Patient</Button>
                  </div>
                )}
              </CardContent>
              <CardFooter></CardFooter>
            </Card>
          </div>
        </div>
      </section>
      
      <section id="medicine-form" className="py-20 bg-muted/30">
        <div className="container">
          <div className="mx-auto max-w-4xl space-y-6">
            <div className="text-center space-y-2 mb-10">
              <h2 className="text-3xl font-bold tracking-tight">Get Your Medicine Recommendations</h2>
              <p className="text-muted-foreground">
                Fill out the form below to receive AI-powered medicine recommendations based on your symptoms.
              </p>
            </div>
            
            {/* Notice removed since fallback is no longer used */}
            
            <MedicineForm initialPatient={selectedPatient || undefined} readOnly={!!selectedPatient} />
          </div>
        </div>
      </section>
      
      <section className="py-20 bg-background">
        <div className="container">
          <div className="mx-auto max-w-4xl">
            <div className="text-center space-y-2 mb-12">
              <h2 className="text-3xl font-bold tracking-tight">Why Choose IMED?</h2>
              <p className="text-muted-foreground">
                Our platform offers several advantages for your healthcare needs.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center text-center space-y-3 p-6 bg-card rounded-lg shadow">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="24" 
                    height="24" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className="text-primary"
                  >
                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold">Personalized Care</h3>
                <p className="text-muted-foreground">
                  Get medicine recommendations tailored to your specific symptoms and health profile.
                </p>
              </div>

              <div className="flex flex-col items-center text-center space-y-3 p-6 bg-card rounded-lg shadow">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="24" 
                    height="24" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className="text-primary"
                  >
                    <path d="M8 17.9h.9c.9 0 1.7-.8 1.7-1.7v-1.7h1.7c.9 0 1.7-.8 1.7-1.7V11h1.7c.9 0 1.7-.8 1.7-1.7V7" />
                    <path d="M17 2.1h-3.8c-.9 0-1.7.8-1.7 1.7v1.7H9.8c-.9 0-1.7.8-1.7 1.7V9H6.4c-.9 0-1.7.8-1.7 1.7v6.4c0 .9.8 1.7 1.7 1.7h6.9c.9 0 1.7-.8 1.7-1.7v-1.7h1.7c.9 0 1.7-.8 1.7-1.7V11h1.7c.9 0 1.7-.8 1.7-1.7V3.8c0-.9-.8-1.7-1.7-1.7Z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold">Advanced AI</h3>
                <p className="text-muted-foreground">
                  Powered by state-of-the-art AI models trained on medical data to provide accurate recommendations.
                </p>
              </div>
              
              <div className="flex flex-col items-center text-center space-y-3 p-6 bg-card rounded-lg shadow">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="24" 
                    height="24" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className="text-primary"
                  >
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold">Evidence-Based</h3>
                <p className="text-muted-foreground">
                  All recommendations are based on reliable medical information and best practices.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <section className="py-20 bg-primary/5">
        <div className="container">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-3xl font-bold tracking-tight mb-6">Ready to Get Started?</h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Try our AI-powered medicine recommendation system today. It's free, quick, and designed to help you make informed health decisions.
            </p>
            <a href="#medicine-form" className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground px-8 py-3 text-lg font-medium shadow hover:bg-primary/90">
              Get Recommendations
        </a>
          </div>
    </div>
      </section>
    </main>
  );
}
