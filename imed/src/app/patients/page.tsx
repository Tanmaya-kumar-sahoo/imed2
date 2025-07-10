"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { useRouter } from "next/navigation";

// Dummy API functions (replace with real API calls)
async function fetchPatient(query: { id?: string; name?: string }) {
  // Replace with real API call
  return null;
}

export default function PatientsPage() {
  const [searchValue, setSearchValue] = useState("");
  const [searchType, setSearchType] = useState<"id" | "name">("id");
  const [patient, setPatient] = useState<any>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSearch = async () => {
    setLoading(true);
    setPatient(null);
    setNotFound(false);
    // Simulate API call
    const result = await fetchPatient(
      searchType === "id"
        ? { id: searchValue.trim() }
        : { name: searchValue.trim() }
    );
    if (result) {
      setPatient(result);
    } else {
      setNotFound(true);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-xl mx-auto py-8">
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
            >
              <option value="id">Unique No</option>
              <option value="name">Name</option>
            </select>
            <Input
              placeholder={searchType === "id" ? "Enter Unique No" : "Enter Name"}
              value={searchValue}
              onChange={e => setSearchValue(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleSearch} disabled={loading || !searchValue}>
              {loading ? "Searching..." : "Search"}
            </Button>
          </div>
          {patient && (
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Patient Details</h3>
              <div className="grid grid-cols-2 gap-2">
                <div><b>Unique No:</b> {patient.id}</div>
                <div><b>Name:</b> {patient.name}</div>
                <div><b>Age:</b> {patient.age}</div>
                <div><b>Phone:</b> {patient.phone}</div>
                <div><b>Email:</b> {patient.email}</div>
                <div><b>Address:</b> {patient.address}</div>
                <div><b>Blood Type:</b> {patient.bloodType}</div>
                <div><b>Allergies:</b> {patient.allergies}</div>
                <div><b>Chronic Conditions:</b> {patient.chronicConditions}</div>
                <div><b>Medications:</b> {patient.medications}</div>
              </div>
              {/* Recommendation button will be added here in the next step */}
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
  );
} 