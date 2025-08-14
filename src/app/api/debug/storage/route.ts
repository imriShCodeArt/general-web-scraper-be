import { NextResponse } from 'next/server';
import { csvStorage } from '@/lib/csv-storage';

export async function GET() {
  try {
    const allJobs = csvStorage.listAllJobs();
    
    return NextResponse.json({
      success: true,
      totalJobs: allJobs.length,
      jobs: allJobs,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
