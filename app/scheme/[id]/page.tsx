import { notFound } from 'next/navigation';
import { ArrowLeft, Calendar, Clock, Building2, CheckCircle2, Users, XCircle, FileText, AlertTriangle, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { schemes } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import Image from 'next/image';
import SchemeShareButton from '@/components/scheme/SchemeShareButton';
import SchemeDownloadButton from '@/components/scheme/SchemeDownloadButton';
import SupportModalWrapper from '@/components/scheme/SupportModalWrapper';
import RequiredDocumentsInteractive from '@/components/scheme/RequiredDocumentsInteractive';

interface SchemePageProps {
  params: Promise<{ id: string }>;
}

export default async function SchemePage({ params }: SchemePageProps) {
  const { id } = await params;
  const schemeId = parseInt(id, 10);

  if (isNaN(schemeId)) {
    return notFound();
  }

  const [scheme] = await db
    .select()
    .from(schemes)
    .where(eq(schemes.id, schemeId))
    .limit(1);

  if (!scheme) {
    return notFound();
  }

  const finalImageUrl = scheme.imageUrl || '/stock_images/indian_farmer_agricu_646481f5.jpg';

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header Navigation */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 backdrop-blur-sm bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/home"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Back to Home</span>
              <span className="sm:hidden">Back</span>
            </Link>
            <div className="flex items-center gap-2">
              <SchemeShareButton
                title={scheme.title}
                url={`/scheme/${scheme.id}`}
              />
              <SchemeDownloadButton
                schemeName={scheme.title}
                pdfUrl={scheme.pdfGuideline}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section - Full Width */}
      <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <Image
            src={finalImageUrl}
            alt={scheme.title}
            fill
            className="object-cover"
            priority
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/90 via-blue-700/90 to-indigo-800/90" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="flex items-center gap-2 mb-4">
            <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-semibold">
              ⭐ Popular Scheme
            </span>
            <span className="px-3 py-1 bg-green-500/30 backdrop-blur-sm rounded-full text-xs font-semibold">
              ✓ Currently Active
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
            {scheme.title}
          </h1>

          <p className="text-lg sm:text-xl text-blue-100 mb-6 max-w-3xl leading-relaxed">
            {scheme.description}
          </p>

          <div className="flex items-center gap-2 text-blue-100">
            <Building2 className="w-5 h-5" />
            <span className="text-sm font-medium">{scheme.ministry}</span>
          </div>
        </div>
      </div>

      {/* Quick Stats Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {scheme.processingTime && (
            <div className="bg-white rounded-xl shadow-lg p-5 border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Processing Time</p>
                  <p className="text-sm font-bold text-gray-900">{scheme.processingTime}</p>
                </div>
              </div>
            </div>
          )}

          {scheme.schemeValidity && (
            <div className="bg-white rounded-xl shadow-lg p-5 border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Validity Period</p>
                  <p className="text-sm font-bold text-gray-900">{scheme.schemeValidity}</p>
                </div>
              </div>
            </div>
          )}

          {scheme.launchYear && (
            <div className="bg-white rounded-xl shadow-lg p-5 border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Launched</p>
                  <p className="text-sm font-bold text-gray-900">{scheme.launchYear}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Key Benefits */}
            <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Key Benefits</h2>
              </div>
              <div className="space-y-3">
                {scheme.benefits.split('\n').map((benefit, i) => (
                  <div key={i} className="flex gap-3 p-3 rounded-lg hover:bg-green-50 transition-colors">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <p className="text-gray-700 leading-relaxed">{benefit}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Eligibility */}
            {scheme.eligibility && (
              <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Who Can Apply</h2>
                </div>
                <div className="space-y-3">
                  {scheme.eligibility.split('\n').map((criteria, i) => (
                    <div key={i} className="flex gap-3 p-3 rounded-lg hover:bg-blue-50 transition-colors">
                      <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-blue-600 font-bold text-sm">{i + 1}</span>
                      </div>
                      <p className="text-gray-700 leading-relaxed">{criteria}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Not Eligible */}
            {scheme.notEligible && (
              <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                    <XCircle className="w-6 h-6 text-red-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Who Cannot Apply</h2>
                </div>
                <div className="space-y-3">
                  {scheme.notEligible.split('\n').map((exclusion, i) => (
                    <div key={i} className="flex gap-3 p-3 rounded-lg hover:bg-red-50 transition-colors">
                      <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <p className="text-gray-700 leading-relaxed">{exclusion}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* How to Apply */}
            {scheme.howToApply && (
              <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-purple-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">How to Apply</h2>
                </div>
                <div className="space-y-4">
                  {scheme.howToApply.split('\n').map((step, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                          {i + 1}
                        </div>
                      </div>
                      <div className="flex-1 pt-1">
                        <p className="text-gray-700 leading-relaxed">{step}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Important Notes & Common Mistakes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {scheme.additionalNotes && (
                <div className="bg-amber-50 rounded-2xl border border-amber-200 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                    <h3 className="font-bold text-gray-900">Important Notes</h3>
                  </div>
                  <div className="space-y-2">
                    {scheme.additionalNotes.split('\n').map((note, i) => (
                      <p key={i} className="text-sm text-gray-700 leading-relaxed">• {note}</p>
                    ))}
                  </div>
                </div>
              )}

              {scheme.commonMistakes && (
                <div className="bg-red-50 rounded-2xl border border-red-200 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <XCircle className="w-5 h-5 text-red-600" />
                    <h3 className="font-bold text-gray-900">Common Mistakes</h3>
                  </div>
                  <div className="space-y-2">
                    {scheme.commonMistakes.split('\n').map((mistake, i) => (
                      <p key={i} className="text-sm text-gray-700 leading-relaxed">• {mistake}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6 pb-6">
              
              {/* Apply Now CTA */}
              {scheme.officialLink && (
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-xl">
                  <h3 className="text-xl font-bold mb-2">Ready to Apply?</h3>
                  <p className="text-green-100 text-sm mb-4">
                    Start your application process now
                  </p>
                  <a
                    href={scheme.officialLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full bg-white text-green-600 font-bold py-3 px-4 rounded-xl text-center hover:shadow-lg transition-all"
                  >
                    Apply Now →
                  </a>
                </div>
              )}

              {/* Required Documents */}
              {scheme.requiredDocuments && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <h3 className="font-bold text-gray-900">Required Documents</h3>
                  </div>
                  <div className="pr-2">
                    <RequiredDocumentsInteractive
                      requiredDocuments={scheme.requiredDocuments}
                      schemeId={scheme.id}
                    />
                  </div>
                </div>
              )}

              {/* Help Section */}
              <div className="bg-blue-50 rounded-2xl border border-blue-200 p-6">
                <h3 className="font-bold text-gray-900 mb-3">Need Help?</h3>
                <p className="text-sm text-gray-700 mb-4">
                  Our support team is here to assist you with your application.
                </p>
                <SupportModalWrapper schemeId={scheme.id} schemeName={scheme.title} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Spacing for Mobile Nav */}
      <div className="h-24 lg:h-0" />
    </div>
  );
}
