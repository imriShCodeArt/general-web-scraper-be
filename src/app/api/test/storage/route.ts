import { NextResponse } from 'next/server';
import { csvStorage } from '@/lib/csv-storage';

export async function POST() {
  try {
    // Test data
    const testProducts = [
      {
        url: 'https://test.com/product1',
        title: 'Test Product 1',
        slug: 'test-product-1',
        sku: 'TEST-001',
        stock_status: 'instock',
        images: ['https://test.com/image1.jpg'],
        description: 'This is a test product',
        category: 'Test Category',
        attributes: {},
        variations: []
      }
    ];

    const testJobId = `test-${Date.now()}`;
    
    console.log(`[TestStorage] Testing storage with job ID: ${testJobId}`);
    
    // Test storing
    await csvStorage.storeCSVData(testJobId, testProducts);
    console.log(`[TestStorage] Stored test data`);
    
    // Test retrieving
    const retrievedData = csvStorage.getCSVData(testJobId, 'parent');
    const jobInfo = csvStorage.getJobInfo(testJobId);
    
    console.log(`[TestStorage] Retrieved data:`, !!retrievedData, 'size:', retrievedData?.length || 0);
    console.log(`[TestStorage] Job info:`, jobInfo);
    
    // Clean up test data
    // Note: In production, you might want to keep test data for debugging
    
    return NextResponse.json({
      success: true,
      testJobId,
      stored: true,
      retrieved: !!retrievedData,
      dataSize: retrievedData?.length || 0,
      jobInfo,
      message: 'Storage test completed successfully'
    });
    
  } catch (error) {
    console.error(`[TestStorage] Test failed:`, error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Storage test failed'
    }, { status: 500 });
  }
}
