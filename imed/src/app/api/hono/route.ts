import { Hono } from 'hono';
import { handle } from 'hono/vercel';
import { cors } from 'hono/cors';
import { TursoMedicineService } from '@/lib/services/turso-medicine-service';
import { db } from '@/lib/db';
import { medicines, conditions } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

// Initialize the medicine service
const medicineService = new TursoMedicineService();

// Create a Hono app
const app = new Hono()
  .basePath('/api/hono')
  // Apply CORS middleware
  .use('*', cors({
    origin: ['http://localhost:3000', 'https://imed.vercel.app'],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowHeaders: ['Content-Type', 'Authorization'],
    exposeHeaders: ['X-Total-Count'],
    maxAge: 86400,
  }));

// Define routes
app.get('/', (c) => {
  return c.text('Hono API is running');
});

// Medicines endpoints
app.get('/medicines', async (c) => {
  try {
    const allMedicines = await db.select().from(medicines).limit(100);
    return c.text(JSON.stringify({ 
      medicines: allMedicines,
      total: allMedicines.length
    }));
  } catch (error) {
    console.error('Error fetching medicines:', error);
    c.status(500);
    return c.text(JSON.stringify({ error: 'Failed to fetch medicines' }));
  }
});

app.get('/medicines/:id', async (c) => {
  const id = c.req.param('id');
  
  try {
    const medicine = await medicineService.getMedicineById(id);
    
    if (!medicine) {
      c.status(404);
      return c.text(JSON.stringify({ error: 'Medicine not found' }));
    }
    
    return c.text(JSON.stringify(medicine));
  } catch (error) {
    console.error(`Error fetching medicine ${id}:`, error);
    c.status(500);
    return c.text(JSON.stringify({ error: 'Failed to fetch medicine' }));
  }
});

app.post('/medicines', async (c) => {
  try {
    const body = await c.req.json();
    
    // Basic validation
    if (!body.name || !body.description) {
      c.status(400);
      return c.text(JSON.stringify({ error: 'Name and description are required' }));
    }
    
    const medicine = await medicineService.createMedicine({
      id: uuidv4(),
      ...body
    });
    
    c.status(201);
    return c.text(JSON.stringify(medicine));
  } catch (error) {
    console.error('Error creating medicine:', error);
    c.status(500);
    return c.text(JSON.stringify({ error: 'Failed to create medicine' }));
  }
});

app.put('/medicines/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  
  try {
    const updatedMedicine = await medicineService.updateMedicine(id, body);
    
    if (!updatedMedicine) {
      c.status(404);
      return c.text(JSON.stringify({ error: 'Medicine not found' }));
    }
    
    return c.text(JSON.stringify(updatedMedicine));
  } catch (error) {
    console.error(`Error updating medicine ${id}:`, error);
    c.status(500);
    return c.text(JSON.stringify({ error: 'Failed to update medicine' }));
  }
});

app.delete('/medicines/:id', async (c) => {
  const id = c.req.param('id');
  
  try {
    await medicineService.deleteMedicine(id);
    return c.text(JSON.stringify({ success: true }));
  } catch (error) {
    console.error(`Error deleting medicine ${id}:`, error);
    c.status(500);
    return c.text(JSON.stringify({ error: 'Failed to delete medicine' }));
  }
});

export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const DELETE = handle(app);

export const runtime = 'edge';