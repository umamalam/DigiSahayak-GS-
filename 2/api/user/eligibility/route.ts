import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { schemes, userDocuments, users } from '@/lib/db/schema';
import { verifyToken } from '@/lib/auth/utils';
import { eq } from 'drizzle-orm';

// Canonical document type mappings (same as upload API)
const CANONICAL_MAPPINGS: Record<string, string> = {
  'aadhaar': 'aadhaar',
  'aadhar': 'aadhaar',
  'aadhaar card': 'aadhaar',
  'pan': 'pan',
  'pan card': 'pan',
  'passbook': 'passbook',
  'bank passbook': 'passbook',
  'bank account': 'passbook',
  'bank details': 'passbook',
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

// Helper function to normalize document type (same logic as upload API)
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
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '_')
    .substring(0, 100);
}

interface EligibilityScore {
  schemeId: number;
  schemeSlug: string;
  schemeTitle: string;
  scorePercent: number;
  missingDocs: string[];
  matchedCriteria: string[];
  imageUrl: string | null;
}

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('auth_token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const userId = decoded.id;

    // Fetch user profile
    const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user.length) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Fetch user's uploaded documents
    const documents = await db
      .select()
      .from(userDocuments)
      .where(eq(userDocuments.userId, userId));

    const uploadedDocTypes = new Set(documents.map(d => d.documentType));

    // Fetch all active schemes
    const allSchemes = await db
      .select()
      .from(schemes)
      .where(eq(schemes.isActive, true));

    const scores: EligibilityScore[] = [];

    for (const scheme of allSchemes) {
      let score = 0;
      const missingDocs: string[] = [];
      const matchedCriteria: string[] = [];

      // Parse required documents - split by bullet points (•) or newlines (\n)
      let requiredDocs: string[] = [];
      if (scheme.requiredDocuments) {
        try {
          requiredDocs = JSON.parse(scheme.requiredDocuments);
        } catch {
          // Split by bullet points (•) or newlines to handle database format
          requiredDocs = scheme.requiredDocuments
            .split(/[•\n]/)
            .map(d => d.trim())
            .filter(d => d.length > 0);
        }
      }

      // Calculate document score (only if there are required documents)
      if (requiredDocs.length > 0) {
        const docScore = 100 / requiredDocs.length;
        
        for (const docType of requiredDocs) {
          // Normalize the required document name using same logic as upload API
          const normalizedRequired = normalizeDocumentType(docType);
          
          // Check if user has this document
          const hasDoc = uploadedDocTypes.has(normalizedRequired);

          if (hasDoc) {
            score += docScore;
            matchedCriteria.push(`Has ${docType}`);
          } else {
            missingDocs.push(docType);
          }
        }
      } else {
        // If scheme has no required documents, only give eligibility if user has uploaded SOME documents
        if (uploadedDocTypes.size > 0) {
          score = 60;
          matchedCriteria.push('No documents required');
        } else {
          // User has no documents and scheme needs no documents = not a match
          score = 0;
        }
      }

      // Cap score at 100 and ensure it's at least 0
      score = Math.max(0, Math.min(100, Math.round(score)));

      scores.push({
        schemeId: scheme.id,
        schemeSlug: scheme.slug,
        schemeTitle: scheme.title,
        scorePercent: score,
        missingDocs,
        matchedCriteria,
        imageUrl: scheme.imageUrl,
      });
    }

    // Sort by score descending
    scores.sort((a, b) => b.scorePercent - a.scorePercent);

    return NextResponse.json({ 
      scores,
      totalSchemes: scores.length,
      highlyEligible: scores.filter(s => s.scorePercent >= 60).length,
    });
  } catch (error) {
    console.error('Eligibility error:', error);
    return NextResponse.json(
      { error: 'Failed to calculate eligibility' },
      { status: 500 }
    );
  }
}
