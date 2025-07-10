import { promises as fs } from 'fs';
import path from 'path';

// Save history.json in the current working directory (imed), not imed/imed
const HISTORY_FILE = path.resolve(process.cwd(), 'history.json');

export interface HistoryEntry {
  medicines: any[];
  symptoms: string;
  timestamp: string;
}

export async function addHistoryEntry(entry: HistoryEntry) {
  let entries: HistoryEntry[] = [];
  try {
    const data = await fs.readFile(HISTORY_FILE, 'utf-8');
    entries = JSON.parse(data);
  } catch (e) {
    // File may not exist yet
  }
  entries.push(entry);
  await fs.writeFile(HISTORY_FILE, JSON.stringify(entries, null, 2), 'utf-8');
}

export async function getHistoryEntries(): Promise<HistoryEntry[]> {
  try {
    const data = await fs.readFile(HISTORY_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
} 