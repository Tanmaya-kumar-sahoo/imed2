"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Dummy API function (replace with real API call)
async function createPatient(data: any) {
  const res = await fetch('/api/patients', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const result = await res.json();
  if (!res.ok || !result.success) {
    throw new Error(result.error || 'Failed to create patient');
  }
  return result.patient;
}

export default function CreatePatientPage() {
  const [form, setForm] = useState({
    name: "",
    age: "",
    gender: "",
    height: "",
    weight: "",
    phone: "",
    address: "",
    bloodType: "",
    allergies: "",
    chronicConditions: "",
    medications: "",
  });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [createdPatient, setCreatedPatient] = useState<any>(null);
  const [fieldErrors, setFieldErrors] = useState<{ phone?: string }>({});
  const router = useRouter();

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCreate = async () => {
    setCreating(true);
    setError("");
    setFieldErrors({});
    try {
      const newPatient = await createPatient(form);
      setCreatedPatient(newPatient);
    } catch (err: any) {
      setError(err.message);
      // Field-specific error handling
      if (err.message.includes("phone number")) {
        setFieldErrors({ phone: err.message });
      }
    }
    setCreating(false);
  };

  return (
    <div className="max-w-xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Create New Patient</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            <Input name="name" placeholder="Name" value={form.name} onChange={handleFormChange} />
            <Input name="age" placeholder="Age" value={form.age} onChange={handleFormChange} />
            <Select
              name="gender"
              value={form.gender}
              onValueChange={value => setForm({ ...form, gender: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            <Input name="height" placeholder="Height" value={form.height} onChange={handleFormChange} />
            <Input name="weight" placeholder="Weight" value={form.weight} onChange={handleFormChange} />
            <Input
              name="phone"
              placeholder="Phone"
              value={form.phone}
              onChange={handleFormChange}
              className={fieldErrors.phone ? "border-red-500" : ""}
            />
            {fieldErrors.phone && <div className="text-red-500 text-sm">{fieldErrors.phone}</div>}
            <Input name="address" placeholder="Address" value={form.address} onChange={handleFormChange} />
            <Input name="bloodType" placeholder="Blood Type" value={form.bloodType} onChange={handleFormChange} />
            <Input name="allergies" placeholder="Allergies" value={form.allergies} onChange={handleFormChange} />
            <Input name="chronicConditions" placeholder="Chronic Conditions" value={form.chronicConditions} onChange={handleFormChange} />
            <Input name="medications" placeholder="Medications" value={form.medications} onChange={handleFormChange} />
          </div>
          {error && <div className="text-red-500 mt-2">{error}</div>}
        </CardContent>
        <CardFooter>
          <Button className="mt-4" onClick={handleCreate} disabled={creating}>
            {creating ? "Creating..." : "Create Patient"}
          </Button>
        </CardFooter>
      </Card>
      {createdPatient && (
        <div className="mt-4 p-4 bg-green-100 rounded">
          <b>Patient created successfully!</b>
          <br />
          Unique Number (ID): <span className="font-mono">{createdPatient.id}</span>
        </div>
      )}
    </div>
  );
} 