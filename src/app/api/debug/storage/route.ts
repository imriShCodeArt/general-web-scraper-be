import { NextResponse } from 'next/server';
import { csvStorage } from '@/lib/csv-storage';

export async function GET() {
  try {
    const allJobs = csvStorage.listAllJobs();
    
    // Get additional debug info
    const debugInfo = {
      success: true,
      totalJobs: allJobs.length,
      jobs: allJobs,
      timestamp: new Date().toISOString(),
      storageInfo: {
        memorySize: allJobs.length,
        storageType: 'Hybrid (Memory + File System)',
        tempDirectory: process.env.TMPDIR || process.env.TEMP || 'System default'
      }
    };
    
    return NextResponse.json(debugInfo);
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
