import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { db } from '@/lib/db';
import { userDocuments } from '@/lib/db/schema';
import { verifyToken } from '@/lib/auth/utils';
import { eq, and } from 'drizzle-orm';

const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads');
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

// Canonical document type mappings to ensure consistency
const CANONICAL_MAPPINGS: Record<string, string> = {
  'aadhaar': 'aadhaar',
  'aadhar': 'aadhaar',
  'aadhaar card': 'aadhaar',
  'pan': 'pan',
  'pan card': 'pan',
  'passbook': 'passbook',
  'bank passbook': 'passbook',
  'bank account': 'passbook',
  'income': 'income',
  'income certificate': 'income',
  'income proof': 'income',
  'land': 'land',
  'land document': 'land',
  'land ownership': 'land',
  'address': 'address',
  'address proof': 'address',
  'caste': 'caste',
  'caste certificate': 'caste',
  'ration': 'ration',
  'ration card': 'ration',
  'photo': 'photo',
  'photograph': 'photo',
  'passport': 'passport',
  'driving license': 'driving_license',
  'driving licence': 'driving_license',
  'voter id': 'voter_id',
  'voter card': 'voter_id',
};

// Helper function to normalize document type for storage and matching
function normalizeDocumentType(label: string): string {
  const normalized = label.toLowerCase().trim();
  
  // First try exact match with canonical mappings
  if (CANONICAL_MAPPINGS[normalized]) {
    return CANONICAL_MAPPINGS[normalized];
  }
  
  // Try partial match with canonical mappings
  for (const [key, value] of Object.entries(CANONICAL_MAPPINGS)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return value;
    }
  }
  
  // If no canonical match, create a slug from the label
  return normalized
    .replace(/[^a-z0-9\s]/g, '') // Remove special chars
    .replace(/\s+/g, '_') // Replace spaces with underscore
    .substring(0, 100); // Limit length
}

export async function POST(req: NextRequest) {
  try {
    // Verify authentication
    const token = req.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const userId = decoded.id;

    // Parse multipart form data
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const documentLabel = formData.get('documentType') as string | null;
    const sourceLabel = formData.get('sourceLabel') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!documentLabel || documentLabel.trim().length === 0) {
      return NextResponse.json({ error: 'Document type is required' }, { status: 400 });
    }

    // Use sourceLabel (original human-readable label) for normalization if available
    // This ensures canonical mappings work even if client sends pre-normalized keys
    const labelForNormalization = sourceLabel || documentLabel;
    const documentType = normalizeDocumentType(labelForNormalization);
    
    if (documentType.length === 0) {
      return NextResponse.json({ error: 'Invalid document type' }, { status: 400 });
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPG, PNG, and PDF files are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB.' },
        { status: 400 }
      );
    }

    // Create user directory if it doesn't exist
    const userDir = join(UPLOAD_DIR, userId.toString());
    await mkdir(userDir, { recursive: true });

    // Generate unique filename
    const timestamp = Date.now();
    const extension = file.name.split('.').pop() || 'bin';
    const fileName = `${documentType}-${timestamp}.${extension}`;
    const filePath = join(userDir, fileName);
    const relativeFilePath = `/uploads/${userId}/${fileName}`;

    // Save file to disk
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Check if document already exists and delete old one
    const existing = await db
      .select()
      .from(userDocuments)
      .where(and(
        eq(userDocuments.documentType, documentType),
        eq(userDocuments.userId, userId)
      ))
      .limit(1);

    if (existing.length > 0) {
      // Update existing record
      await db
        .update(userDocuments)
        .set({
          sourceLabel: labelForNormalization,
          filePath: relativeFilePath,
          fileName: file.name,
          fileSize: file.size,
          contentType: file.type,
          status: 'uploaded',
          uploadedAt: new Date(),
        })
        .where(eq(userDocuments.id, existing[0].id));

      return NextResponse.json({
        success: true,
        file: {
          url: relativeFilePath,
          fileName: file.name,
          fileType: file.type,
          size: file.size,
        },
        documentRecord: {
          id: existing[0].id,
          documentType,
          sourceLabel: labelForNormalization,
          status: 'uploaded',
        },
      });
    }

    // Insert new record
    const result = await db.insert(userDocuments).values({
      userId,
      documentType,
      sourceLabel: labelForNormalization,
      filePath: relativeFilePath,
      fileName: file.name,
      fileSize: file.size,
      contentType: file.type,
      status: 'uploaded',
    });

    return NextResponse.json({
      success: true,
      file: {
        url: relativeFilePath,
        fileName: file.name,
        fileType: file.type,
        size: file.size,
      },
      documentRecord: {
        id: result.lastInsertRowid,
        documentType,
        status: 'uploaded',
      },
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed. Please try again.' },
      { status: 500 }
    );
  }
}
