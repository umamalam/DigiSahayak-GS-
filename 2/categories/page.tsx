import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { db } from '@/lib/db';
import { categories, schemes } from '@/lib/db/schema';
import { count, eq } from 'drizzle-orm';

export default async function CategoriesPage() {
  const allCategories = await db
    .select()
    .from(categories)
    .orderBy(categories.id);

  // Get scheme count for each category
  const categoriesWithCounts = await Promise.all(
    allCategories.map(async (category) => {
      const [result] = await db
        .select({ count: count() })
        .from(schemes)
        .where(eq(schemes.categoryId, category.id));
      
      return {
        ...category,
        schemeCount: result?.count || 0,
      };
    })
  );

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-screen-sm md:max-w-2xl lg:max-w-4xl mx-auto px-4 py-6 md:py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/home"
            className="inline-flex items-center gap-2 text-[#4568F0] hover:text-[#3a56d4] mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Back</span>
          </Link>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">All Categories</h1>
          <p className="text-gray-600">Browse all {allCategories.length} categories and explore {categoriesWithCounts.reduce((sum, cat) => sum + cat.schemeCount, 0)} government schemes</p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categoriesWithCounts.map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className="group"
            >
              <div className="bg-white border border-gray-200 rounded-3xl p-6 hover:shadow-lg hover:border-[#4568F0]/30 transition-all duration-300 h-full cursor-pointer flex flex-col justify-between">
                {/* Icon and Title */}
                <div>
                  <div className="w-14 h-14 bg-gradient-to-br from-[#4568F0]/10 to-[#4568F0]/5 rounded-2xl flex items-center justify-center text-3xl mb-3 group-hover:scale-110 transition-transform">
                    {category.icon}
                  </div>
                  
                  <h2 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-[#4568F0] transition-colors">
                    {category.name}
                  </h2>
                  
                  {category.description && (
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                      {category.description}
                    </p>
                  )}
                </div>

                {/* Scheme Count and Arrow */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <span className="text-xs font-semibold text-[#4568F0] bg-[#4568F0]/10 px-2.5 py-1 rounded-full">
                    {category.schemeCount} scheme{category.schemeCount !== 1 ? 's' : ''}
                  </span>
                  <ArrowRight className="w-4 h-4 text-[#4568F0] group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
