import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { categories, schemes } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import SchemeCard from '@/components/ui/SchemeCard';
import SearchBar from '@/components/ui/SearchBar';
import TopBarControls from '@/components/dashboard/TopBarControls';

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  
  const [category] = await db
    .select()
    .from(categories)
    .where(eq(categories.slug, slug))
    .limit(1);

  if (!category) {
    notFound();
  }

  const categorySchemes = await db
    .select()
    .from(schemes)
    .where(eq(schemes.categoryId, category.id));

  return (
    <div className="min-h-screen bg-white">
      <div className="fixed top-4 right-4 z-50">
        <TopBarControls />
      </div>
      <div className="max-w-screen-sm md:max-w-2xl lg:max-w-4xl mx-auto px-4 py-6 md:py-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/home"
            className="inline-flex items-center gap-2 text-[#4568F0] hover:text-[#3a56d4] mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Back</span>
          </Link>
          
          <div className="flex items-center gap-3 mb-3">
            <div className="w-14 h-14 bg-gradient-to-br from-[#4568F0]/10 to-[#4568F0]/5 rounded-2xl flex items-center justify-center text-3xl">
              {category.icon}
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{category.name}</h1>
              {category.description && (
                <p className="text-xs text-gray-600 mt-1">{category.description}</p>
              )}
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <SearchBar placeholder="Search schemes..." />
        </div>

        {/* Schemes List */}
        <div>
          <p className="text-sm text-gray-600 mb-4">
            {categorySchemes.length} scheme{categorySchemes.length !== 1 ? 's' : ''} available
          </p>
          
          <div className="space-y-3">
            {categorySchemes.map((scheme) => (
              <SchemeCard key={scheme.id} scheme={scheme} />
            ))}
          </div>

          {categorySchemes.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-sm">No schemes available in this category yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
