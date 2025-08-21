import { NextRequest, NextResponse } from 'next/server';
import { csvStorage } from '@/lib/csv-storage';

export async function POST(request: NextRequest) {
  try {
    const { jobId, action } = await request.json();

    if (!jobId || !action) {
      return NextResponse.json(
        { success: false, error: 'Missing jobId or action' },
        { status: 400 }
      );
    }

    if (!['pause', 'resume', 'stop'].includes(action)) {
      return NextResponse.json(
        { success: false, error: 'Invalid action. Must be pause, resume, or stop' },
        { status: 400 }
      );
    }

    // Get the job info
    const jobInfo = csvStorage.getJobInfo(jobId);
    if (!jobInfo) {
      return NextResponse.json(
        { success: false, error: 'Job not found' },
        { status: 404 }
      );
    }

    let updatedStatus: string;
    let message: string;

    switch (action) {
      case 'pause':
        updatedStatus = 'paused';
        message = 'Job paused successfully';
        break;
      case 'resume':
        updatedStatus = 'processing';
        message = 'Job resumed successfully';
        break;
      case 'stop':
        updatedStatus = 'stopped';
        message = 'Job stopped successfully';
        break;
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }

    // Update the job status in storage
    csvStorage.updateJobStatus(jobId, updatedStatus);

    return NextResponse.json({
      success: true,
      message,
      jobId,
      newStatus: updatedStatus
    });

  } catch (error) {
    console.error('Job control error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
