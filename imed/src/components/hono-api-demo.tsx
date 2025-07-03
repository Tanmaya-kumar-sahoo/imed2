'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Medicine {
  id: string;
  name: string;
  description: string;
  dosage?: string;
  sideEffects?: string;
  warnings?: string;
  interactions?: string;
}

export function HonoApiDemo() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newMedicine, setNewMedicine] = useState<Partial<Medicine>>({
    name: '',
    description: '',
    dosage: '',
    sideEffects: '',
  });

  // Function to fetch medicines
  const fetchMedicines = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/hono/medicines');
      
      if (!response.ok) {
        throw new Error(`Error fetching medicines: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Handle empty data case
      if (!data.medicines || data.medicines.length === 0) {
        setMedicines([]);
        setError("No medicines found in database. The database might be empty or not properly connected.");
        return;
      }
      
      setMedicines(data.medicines || []);
    } catch (err) {
      console.error('Failed to fetch medicines:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch medicines. The database might not be properly connected.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch medicines on component mount
  useEffect(() => {
    fetchMedicines();
  }, []);

  // Handle input change for new medicine form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewMedicine(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Basic validation
      if (!newMedicine.name || !newMedicine.description) {
        throw new Error('Name and description are required');
      }
      
      const response = await fetch('/api/hono/medicines', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newMedicine),
      });
      
      if (!response.ok) {
        throw new Error(`Error creating medicine: ${response.status}`);
      }
      
      // Reset form and refresh medicines
      setNewMedicine({
        name: '',
        description: '',
        dosage: '',
        sideEffects: '',
      });
      
      await fetchMedicines();
    } catch (err) {
      console.error('Failed to create medicine:', err);
      setError(err instanceof Error ? err.message : 'Failed to create medicine');
    } finally {
      setLoading(false);
    }
  };

  // Handle medicine deletion
  const handleDelete = async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/hono/medicines/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`Error deleting medicine: ${response.status}`);
      }
      
      // Refresh medicines list
      await fetchMedicines();
    } catch (err) {
      console.error('Failed to delete medicine:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete medicine');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Hono API with Turso and Drizzle</h1>
      
      <Tabs defaultValue="list" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list">Medicines List</TabsTrigger>
          <TabsTrigger value="add">Add Medicine</TabsTrigger>
        </TabsList>
        
        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle>Medicines</CardTitle>
              <CardDescription>List of all medicines in the database</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-center py-4">Loading...</p>
              ) : error ? (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              ) : medicines.length === 0 ? (
                <p className="text-center py-4">No medicines found</p>
              ) : (
                <div className="grid gap-4">
                  {medicines.map((medicine) => (
                    <Card key={medicine.id} className="overflow-hidden">
                      <CardHeader>
                        <CardTitle>{medicine.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="mb-2">{medicine.description}</p>
                        {medicine.dosage && <p className="text-sm text-gray-600"><strong>Dosage:</strong> {medicine.dosage}</p>}
                        {medicine.sideEffects && <p className="text-sm text-gray-600"><strong>Side Effects:</strong> {medicine.sideEffects}</p>}
                      </CardContent>
                      <CardFooter className="flex justify-end">
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          onClick={() => handleDelete(medicine.id)}
                        >
                          Delete
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button onClick={fetchMedicines} disabled={loading}>
                {loading ? 'Loading...' : 'Refresh'}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="add">
          <Card>
            <CardHeader>
              <CardTitle>Add New Medicine</CardTitle>
              <CardDescription>Create a new medicine entry</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">Name *</label>
                  <Input
                    id="name"
                    name="name"
                    value={newMedicine.name}
                    onChange={handleInputChange}
                    placeholder="Medicine name"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="description" className="text-sm font-medium">Description *</label>
                  <Input
                    id="description"
                    name="description"
                    value={newMedicine.description}
                    onChange={handleInputChange}
                    placeholder="Medicine description"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="dosage" className="text-sm font-medium">Dosage</label>
                  <Input
                    id="dosage"
                    name="dosage"
                    value={newMedicine.dosage}
                    onChange={handleInputChange}
                    placeholder="Recommended dosage"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="sideEffects" className="text-sm font-medium">Side Effects</label>
                  <Input
                    id="sideEffects"
                    name="sideEffects"
                    value={newMedicine.sideEffects}
                    onChange={handleInputChange}
                    placeholder="Possible side effects"
                  />
                </div>
                
                {error && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                  </div>
                )}
                
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Adding...' : 'Add Medicine'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 