'use server';

import { bulkImportQueue } from '../jobs/queues';
import fs from 'fs';
import path from 'path';

import { getSession } from '../lib/session';

export async function uploadBulkImportZip(formData: FormData) {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN')) {
      return { success: false, error: 'Unauthorized: Admin access required.' };
    }

    const file = formData.get('file') as File;
    if (!file) {
      return { success: false, error: 'No file provided.' };
    }

    if (file.name.split('.').pop() !== 'zip') {
      return { success: false, error: 'Only .zip files are allowed.' };
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const tempDir = path.join(process.cwd(), 'public/uploads/temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const fileName = `bulk-${Date.now()}.zip`;
    const filePath = path.join(tempDir, fileName);
    fs.writeFileSync(filePath, buffer);

    // Add to BullMQ
    const job = await bulkImportQueue.add('import-products', { filePath });

    return { success: true, jobId: job.id };
  } catch (error: any) {
    console.error('Bulk Import Upload Error:', error);
    return { success: false, error: 'Failed to upload and start job.' };
  }
}

export async function checkBulkImportProgress(jobId: string) {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN')) {
      return { success: false, error: 'Unauthorized' };
    }

    const job = await bulkImportQueue.getJob(jobId);
    if (!job) return { success: false, error: 'Job not found.' };

    const state = await job.getState();
    const progress = job.progress;
    
    return {
      success: true,
      state, // 'active', 'completed', 'failed', 'waiting', etc.
      progress,
      failedReason: job.failedReason,
      result: job.returnvalue,
    };
  } catch (_error) {
    return { success: false, error: 'Failed to check progress.' };
  }
}
