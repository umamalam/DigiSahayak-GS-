import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import { ArrowLeft, ExternalLink, Shield, CheckCircle2, FileText, AlertCircle, Download, Phone } from 'lucide-react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { schemes, userDocuments, users } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { verifyToken } from '@/lib/auth/utils';
import HeaderGradient from '@/components/scheme/HeaderGradient';
import SectionCard from '@/components/scheme/SectionCard';
import BenefitList from '@/components/scheme/BenefitList';
import EligibilityList from '@/components/scheme/EligibilityList';
import TimelineSteps from '@/components/scheme/TimelineSteps';
import RequiredDocuments from '@/components/scheme/RequiredDocuments';
import NotEligibleList from '@/components/scheme/NotEligibleList';
import ProcessingInfo from '@/components/scheme/ProcessingInfo';
import HelpModalWrapper from '@/components/scheme/HelpModalWrapper';
import SchemeOverview from '@/components/scheme/SchemeOverview';
import HelplineNumbers from '@/components/scheme/HelplineNumbers';
import PdfDownload from '@/components/scheme/PdfDownload';
import SimilarSchemes from '@/components/scheme/SimilarSchemes';
import DocumentStatusIndicator from '@/components/scheme/DocumentStatusIndicator';
import SchemeStatsBar from '@/components/scheme/SchemeStatsBar';
import SchemeBadges from '@/components/scheme/SchemeBadges';
import TableOfContents from '@/components/scheme/TableOfContents';
import SchemeShareButton from '@/components/scheme/SchemeShareButton';

interface SchemePageProps {
  params: Promise<{ slug: string }>;
}

export default async function SchemePage({ params }: SchemePageProps) {
  const { slug } = await params;

  const [scheme] = await db
    .select()
    .from(schemes)
    .where(eq(schemes.slug, slug))
    .limit(1);

  if (!scheme) {
    return notFound();
  }

  // Get current user ID from token
  let userId: number | null = null;
  let userDocs: any[] = [];
  
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (token) {
      const decoded = verifyToken(token);
      if (decoded) {
        userId = decoded.id; // Fixed: using decoded.id instead of decoded.userId
        // Fetch user's documents
        userDocs = await db
          .select()
          .from(userDocuments)
          .where(eq(userDocuments.userId, userId));
      }
    }
  } catch (e) {
    // Continue without user context
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Back Button */}
      <div className="ml-4 md:ml-8 lg:ml-[320px] py-6">
        <Link
          href="/home"
          className="inline-flex items-center gap-2 text-[#4568F0] hover:text-[#3a56d4] font-semibold text-sm hover:bg-blue-50/50 px-3 py-2 rounded-lg transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Home</span>
        </Link>
      </div>

      {/* Main Layout: Left Sidebar + Right Content */}
      <div className="flex gap-6 px-4 md:px-6 lg:px-8 pb-[120px]">
        
        {/* LEFT SIDEBAR - Table of Contents + Required Documents */}
        <TableOfContents />
        
        {/* LEFT SIDEBAR - Fixed Required Documents */}
        <div className="hidden lg:block w-72 flex-shrink-0">
          <div className="sticky top-24 h-fit">
            {scheme.requiredDocuments && (
              <div className="rounded-2xl p-6 shadow-sm bg-white border border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-bold text-slate-900">Required Documents</h3>
                </div>
                <RequiredDocuments documents={scheme.requiredDocuments} />
              </div>
            )}
          </div>
        </div>

        {/* RIGHT CONTENT AREA */}
        <div className="flex-1 max-w-4xl">
          
          {/* Hero Banner - Full Width */}
          <div className="mb-8">
            <HeaderGradient
              ministry={scheme.ministry}
              title={scheme.title}
              description={scheme.description}
              imageUrl={scheme.imageUrl || undefined}
            />
          </div>

          {/* Badges + Quick Stats */}
          <div className="mb-6">
            <SchemeBadges isPopular={true} isActive={true} category={scheme.ministry} />
            <SchemeStatsBar
              processingTime={scheme.processingTime || undefined}
              validity={scheme.schemeValidity || undefined}
              launchYear={scheme.launchYear || undefined}
            />
          </div>

          {/* 2-Column Grid: Scheme Overview + Key Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6" id="overview">
            {/* Scheme Overview */}
            <div className="rounded-2xl p-6 shadow-sm bg-gradient-to-br from-blue-50 to-indigo-50">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-bold text-slate-900">Scheme Overview</h3>
              </div>
              <SchemeOverview
                ministry={scheme.ministry}
                description={scheme.description}
              />
            </div>

            {/* Key Benefits */}
            <div className="rounded-2xl p-6 shadow-sm bg-green-50" id="benefits">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <h3 className="text-lg font-bold text-slate-900">Key Benefits</h3>
              </div>
              <BenefitList text={scheme.benefits} />
            </div>
          </div>

          {/* 2-Column Grid: Who Can Apply + Who Cannot Apply */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6" id="eligibility">
            {/* Who Can Apply */}
            {scheme.eligibility && (
              <div className="rounded-2xl p-6 shadow-sm bg-blue-50">
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-bold text-slate-900">Who Can Apply</h3>
                </div>
                <EligibilityList text={scheme.eligibility} />
              </div>
            )}

            {/* Who Cannot Apply */}
            {scheme.notEligible && (
              <div className="rounded-2xl p-6 shadow-sm bg-red-50" id="noteligible">
                <div className="flex items-center gap-2 mb-4">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <h3 className="text-lg font-bold text-slate-900">Who Cannot Apply</h3>
                </div>
                <NotEligibleList text={scheme.notEligible} />
              </div>
            )}
          </div>

          {/* Full Width: How to Apply */}
          {scheme.howToApply && (
            <div className="rounded-2xl p-6 shadow-sm bg-white mb-6" id="howto">
              <h3 className="text-lg font-bold text-slate-900 mb-4">How to Apply</h3>
              <TimelineSteps text={scheme.howToApply} />
            </div>
          )}

          {/* 2-Column Grid: Important Notes + Common Mistakes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6" id="notes">
            {/* Important Notes */}
            {scheme.additionalNotes && (
              <div className="rounded-2xl p-6 shadow-sm bg-teal-50">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Important Notes</h3>
                <div className="space-y-3">
                  {scheme.additionalNotes.split('\n').map((note, i) => (
                    <div key={i} className="flex gap-2 text-sm">
                      <span className="text-teal-600 font-bold">→</span>
                      <span className="text-gray-700">{note}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Common Mistakes */}
            {scheme.commonMistakes && (
              <div className="rounded-2xl p-6 shadow-sm bg-orange-50" id="mistakes">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Common Mistakes</h3>
                <div className="space-y-3">
                  {scheme.commonMistakes.split('\n').map((mistake, i) => (
                    <div key={i} className="flex gap-2 text-sm">
                      <span className="text-orange-600 font-bold">•</span>
                      <span className="text-gray-700">{mistake}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Bottom Buttons Section */}
          <div className="space-y-3 pt-2">
            <div className="grid grid-cols-1 gap-3">
              {/* Apply Now */}
              {scheme.officialLink && (
                <a
                  href={scheme.officialLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:shadow-lg text-white font-bold py-3 px-4 rounded-xl transition-all text-center"
                >
                  Apply Now
                </a>
              )}
            </div>

            {/* Secondary Actions */}
            <div className="grid grid-cols-2 gap-3">
              <SchemeShareButton title={scheme.title} url={`${process.env.NEXT_PUBLIC_APP_URL || 'https://digisahayak.in'}/schemes/${scheme.slug}`} />
              <HelpModalWrapper schemeName={scheme.title} />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Layout - Single Column */}
      <div className="lg:hidden px-4 md:px-6 pb-[120px] space-y-6">
        {/* Hero */}
        <div className="mb-6">
          <HeaderGradient
            ministry={scheme.ministry}
            title={scheme.title}
            description={scheme.description}
            imageUrl={scheme.imageUrl || undefined}
          />
        </div>

        {/* All Sections Stacked */}
        {scheme.requiredDocuments && (
          <div className="rounded-2xl p-6 shadow-sm bg-white">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-bold text-slate-900">Required Documents</h3>
            </div>
            <RequiredDocuments documents={scheme.requiredDocuments} />
          </div>
        )}

        <div className="rounded-2xl p-6 shadow-sm bg-gradient-to-br from-blue-50 to-indigo-50">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-bold text-slate-900">Scheme Overview</h3>
          </div>
          <SchemeOverview
            ministry={scheme.ministry}
            description={scheme.description}
          />
        </div>

        <div className="rounded-2xl p-6 shadow-sm bg-green-50">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-bold text-slate-900">Key Benefits</h3>
          </div>
          <BenefitList text={scheme.benefits} />
        </div>

        {scheme.eligibility && (
          <div className="rounded-2xl p-6 shadow-sm bg-blue-50">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-bold text-slate-900">Who Can Apply</h3>
            </div>
            <EligibilityList text={scheme.eligibility} />
          </div>
        )}

        {scheme.notEligible && (
          <div className="rounded-2xl p-6 shadow-sm bg-red-50">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <h3 className="text-lg font-bold text-slate-900">Who Cannot Apply</h3>
            </div>
            <NotEligibleList text={scheme.notEligible} />
          </div>
        )}

        {scheme.howToApply && (
          <div className="rounded-2xl p-6 shadow-sm bg-white">
            <h3 className="text-lg font-bold text-slate-900 mb-4">How to Apply</h3>
            <TimelineSteps text={scheme.howToApply} />
          </div>
        )}

        {scheme.additionalNotes && (
          <div className="rounded-2xl p-6 shadow-sm bg-teal-50">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Important Notes</h3>
            <div className="space-y-3">
              {scheme.additionalNotes.split('\n').map((note, i) => (
                <div key={i} className="flex gap-2 text-sm">
                  <span className="text-teal-600 font-bold">→</span>
                  <span className="text-gray-700">{note}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {scheme.commonMistakes && (
          <div className="rounded-2xl p-6 shadow-sm bg-orange-50">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Common Mistakes</h3>
            <div className="space-y-3">
              {scheme.commonMistakes.split('\n').map((mistake, i) => (
                <div key={i} className="flex gap-2 text-sm">
                  <span className="text-orange-600 font-bold">•</span>
                  <span className="text-gray-700">{mistake}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="grid grid-cols-2 gap-3">
          {scheme.officialLink && (
            <a
              href={scheme.officialLink}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:shadow-lg text-white font-bold py-3 px-4 rounded-xl transition-all text-center"
            >
              Apply Now
            </a>
          )}
          <HelpModalWrapper schemeName={scheme.title} />
        </div>
      </div>
    </div>
  );
}
