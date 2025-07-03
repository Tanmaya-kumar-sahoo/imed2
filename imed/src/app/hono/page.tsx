import { Metadata } from 'next';
import { HonoApiDemo } from '@/components/hono-api-demo';

export const metadata: Metadata = {
  title: 'Hono API Demo | IMED',
  description: 'Integration of Hono API with Turso and Drizzle ORM',
};

export default function HonoPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-6">
      <div className="container mx-auto py-6">
        <HonoApiDemo />
      </div>
    </main>
  );
} 