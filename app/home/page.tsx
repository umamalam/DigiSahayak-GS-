"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, ArrowRight } from "lucide-react";

import CategoryCard from "@/components/CategoryCard";
import PopularSchemeCard from "@/components/PopularSchemeCard";
import SchemeGrid from "@/components/SchemeGrid";
import TopBarControls from "@/components/dashboard/TopBarControls";
import { useLanguage } from "@/lib/contexts/LanguageContext";

interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string;
  description: string | null;
}

interface Scheme {
  id: number;
  categoryId: number;
  title: string;
  slug: string;
  ministry: string;
  description: string;
  benefits: string;
  eligibility: string | null;
  howToApply: string | null;
  officialLink: string | null;
  imageUrl: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
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

const CATEGORY_GRADIENTS: Record<string, string> = {
  "farmers": "from-emerald-100 to-green-200",
  "students": "from-blue-100 to-indigo-200",
  "women": "from-pink-100 to-rose-200",
  "children": "from-amber-100 to-orange-200",
  "senior-citizens": "from-teal-100 to-cyan-200",
  "youth": "from-purple-100 to-violet-200",
  "differently-abled": "from-cyan-100 to-sky-200",
};

// Database-driven: More Categories fetched from database

export default function DashboardPage() {
  const [query, setQuery] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [allSchemes, setAllSchemes] = useState<Scheme[]>([]);
  const [eligibilityScores, setEligibilityScores] = useState<EligibilityScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const fetchedRef = useRef(false);
  const { t } = useLanguage();

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    const fetchData = async () => {
      try {
        // Fetch core data (categories and schemes) - these are required
        const [categoriesRes, schemesRes] = await Promise.all([
          fetch('/api/categories', { cache: 'no-store' }),
          fetch('/api/schemes', { cache: 'no-store' }),
        ]);

        if (!categoriesRes.ok || !schemesRes.ok) {
          throw new Error('Failed to fetch data');
        }

        const categoriesData = await categoriesRes.json();
        const schemesData = await schemesRes.json();

        setCategories(categoriesData);
        setAllSchemes(schemesData);

        // Fetch eligibility separately - optional, user may not be logged in
        try {
          const eligibilityRes = await fetch('/api/user/eligibility', { 
            cache: 'no-store', 
            credentials: 'include' 
          });
          
          if (eligibilityRes.ok) {
            const eligibilityData = await eligibilityRes.json();
            setEligibilityScores(eligibilityData.scores || []);
          }
        } catch {
          // Silently ignore eligibility errors - user may not be logged in
        }
      } catch (err) {
        console.error('Failed to load data:', err);
        setError('Failed to load schemes. Please refresh.');
      } finally {
        setLoading(false);
        setIsInitialized(true);
      }
    };

    fetchData();
  }, []);

  const getSchemesByCategory = (categorySlug: string) => {
    const category = categories.find(c => c.slug === categorySlug);
    if (!category) return [];
    return allSchemes.filter(s => s.categoryId === category.id);
  };

  const topCategories = categories.slice(0, 5).map(cat => ({
    emoji: cat.icon,
    title: cat.name,
    count: allSchemes.filter(s => s.categoryId === cat.id).length,
    href: `/categories/${cat.slug}`,
    gradient: CATEGORY_GRADIENTS[cat.slug] || "from-gray-100 to-gray-200",
  }));

  const popularSchemes = allSchemes.slice(0, 5);

  // Search filtering logic
  const filteredSchemes = query.trim() 
    ? allSchemes.filter(scheme =>
        scheme.title.toLowerCase().includes(query.toLowerCase()) ||
        scheme.description.toLowerCase().includes(query.toLowerCase()) ||
        scheme.ministry.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const isEmptyDatabase = !loading && !error && categories.length === 0 && allSchemes.length === 0;
  const isSearching = query.trim().length > 0;

  if (loading || !isInitialized) {
    return (
      <div className="min-h-screen bg-slate-50/50 dark:bg-gray-900">
        <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-sky-100/60 via-white/80 to-transparent dark:from-gray-800/60 dark:via-gray-900/80 -z-10" />
        
        <div className="max-w-6xl mx-auto px-6 pt-12 pb-8">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-white dark:bg-gray-800 rounded-3xl shadow-lg flex items-center justify-center border-2 border-white/80 dark:border-gray-700 animate-pulse" />
          </div>

          <div className="text-center mb-8">
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4 w-64 mx-auto animate-pulse" />
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-lg w-96 mx-auto animate-pulse" />
          </div>

          <div className="sticky top-6 z-30 mb-12">
            <div className="max-w-3xl mx-auto px-6">
              <div className="h-14 bg-white dark:bg-gray-800 rounded-2xl shadow-lg animate-pulse" />
            </div>
          </div>

          <div className="space-y-8">
            {[1, 2, 3].map(i => (
              <div key={i}>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-4 animate-pulse" />
                <div className="flex gap-5 overflow-x-auto pb-4">
                  {[1, 2, 3, 4, 5].map(j => (
                    <div key={j} className="w-[220px] h-[140px] flex-shrink-0 bg-white dark:bg-gray-800 rounded-2xl shadow-sm animate-pulse" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50/50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">⚠️</span>
          </div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">{t('oops')}</h2>
          <p className="text-slate-600 dark:text-gray-400 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            {t('refresh')}
          </button>
        </div>
      </div>
    );
  }

  if (isEmptyDatabase) {
    return (
      <div className="min-h-screen bg-slate-50/50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">📦</span>
          </div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">{t('no_data')}</h2>
          <p className="text-slate-600 dark:text-gray-400 mb-4">{t('run_seed')}</p>
          <code className="bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded text-sm text-gray-800 dark:text-gray-200 block">npm run db:seed</code>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-gray-900 text-slate-900 dark:text-white font-sans transition-colors">
      <div className="fixed top-4 right-4 z-50">
        <TopBarControls />
      </div>
      <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-sky-100/60 via-white/80 to-transparent dark:from-gray-800/60 dark:via-gray-900/80 -z-10" />

      <header className="relative z-10">
        <div className="max-w-6xl mx-auto px-6 pt-12 pb-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-white dark:bg-gray-800 rounded-3xl shadow-lg shadow-blue-900/10 dark:shadow-black/20 flex items-center justify-center overflow-hidden border-2 border-white/80 dark:border-gray-700">
              <Image src="/logo.png" alt="DigiSahayak" width={80} height={80} className="w-full h-full object-cover" priority />
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-800 to-indigo-600 tracking-tight mb-3">
            {t('discover_schemes')}
          </h1>
          <p className="text-base text-slate-600 dark:text-gray-400 font-medium max-w-2xl mx-auto">
            {t('discover_schemes_desc')}
          </p>
        </div>

        <div className="sticky top-6 z-30 mb-12">
          <div className="max-w-3xl mx-auto px-6">
            <form onSubmit={(e) => { e.preventDefault(); }} className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-white/60 px-3 py-3 flex items-center gap-3">
              <div className="pl-3">
                <Search className="w-6 h-6 text-blue-500/80" />
              </div>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('search_placeholder')}
                className="flex-1 bg-transparent outline-none text-base py-2 placeholder:text-slate-400 text-slate-800 dark:text-white dark:placeholder:text-gray-500"
              />
              <button type="button" onClick={() => setQuery('')} className={`text-sm font-semibold px-4 py-2 rounded-lg transition-all ${query ? 'text-gray-600 hover:bg-gray-100' : 'text-gray-400'}`}>
                {t('clear')}
              </button>
              <button type="submit" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 rounded-xl text-sm font-bold shadow-md transition-all hover:shadow-lg active:scale-[0.98]">
                {t('search')}
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 pt-2 pb-32 space-y-8">
        {/* Search Results Section */}
        {isSearching && (
          <section className="animate-fadeIn">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">{t('search_results')}</h2>
              <p className="text-slate-600 dark:text-gray-400">
                {t('found')} <span className="font-semibold text-blue-600">{filteredSchemes.length}</span> {filteredSchemes.length !== 1 ? t('schemes') : t('scheme')} {t('for')} "{query}"
              </p>
            </div>

            {filteredSchemes.length > 0 ? (
              <SchemeGrid schemes={filteredSchemes.map(s => ({
                id: s.id,
                title: s.title,
                ministry: s.ministry,
                description: s.description,
                imageUrl: s.imageUrl,
              }))} />
            ) : (
              <div className="text-center py-16">
                <div className="text-5xl mb-4">🔍</div>
                <h3 className="text-lg font-semibold text-slate-700 dark:text-gray-200 mb-2">{t('no_schemes_found')}</h3>
                <p className="text-slate-600 dark:text-gray-400 mb-6">{t('try_different_keywords')}</p>
                <button 
                  onClick={() => setQuery('')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                >
                  {t('clear_search')}
                </button>
              </div>
            )}
          </section>
        )}

        {/* Normal Dashboard - Hidden when searching */}
        {!isSearching && <>
        <section>
          <div className="flex items-center justify-between px-1 mb-4">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">{t('top_categories')}</h2>
            <Link href="/categories" className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 group">
              {t('view_all')} <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="overflow-x-auto -mx-4 px-4 pb-4 scrollbar-hide">
            <div className="flex gap-5 w-max">
              {topCategories.map((c) => (
                <div key={c.title} className="w-[220px] h-[140px] flex-shrink-0">
                  <CategoryCard {...c} large />
                </div>
              ))}
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-lg font-bold mb-3 text-slate-700 dark:text-gray-200 px-1">{t('all_categories')}</h3>

          <div className="overflow-x-auto -mx-6 px-6 scrollbar-hide">
            <div className="flex gap-3 pb-2 w-max">
              {categories.map((cat) => (
                <Link key={cat.slug} href={`/categories/${cat.slug}`}>
                  <div className="px-5 py-2.5 bg-white/60 backdrop-blur-sm hover:bg-white hover:shadow-md rounded-full border border-slate-200/60 shadow-sm flex items-center gap-2.5 text-sm whitespace-nowrap transition-all cursor-pointer">
                    <span className="text-lg">{cat.icon}</span> 
                    <span className="font-semibold text-slate-700">{cat.name}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between px-1 mb-4">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">{t('popular_schemes')}</h2>
            <span className="text-sm font-medium text-slate-500 dark:text-gray-400">{t('trending_now')}</span>
          </div>

          <div className="overflow-x-auto -mx-4 px-4 pb-4 scrollbar-hide">
            <div className="flex gap-5 w-max">
              {popularSchemes.map((s) => (
                <div key={s.id} className="flex-shrink-0">
                  <PopularSchemeCard 
                    id={s.id}
                    title={s.title}
                    ministry={s.ministry}
                    description={s.description}
                    imageUrl={s.imageUrl}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Shortlisted for You Section */}
        {eligibilityScores.length > 0 && eligibilityScores.filter(s => s.scorePercent >= 60).length > 0 && (
          <section className="animate-fadeIn">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2 flex items-center gap-2">
                  <span>⭐</span> Shortlisted for You
                </h2>
                <p className="text-slate-600 dark:text-gray-400">
                  Based on your uploaded documents, you're eligible for these schemes
                </p>
              </div>
            </div>
            
            <div className="flex gap-5 overflow-x-auto pb-4 scrollbar-hide">
              {eligibilityScores.filter(s => s.scorePercent >= 60).slice(0, 5).map(score => (
                <Link
                  key={score.schemeId}
                  href={`/schemes/${score.schemeSlug}`}
                  className="flex-shrink-0 w-[280px] bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-md transition-all p-5 border border-gray-100 dark:border-gray-700 group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm text-slate-800 dark:text-white mb-1 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {score.schemeTitle}
                      </h3>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-green-500 to-emerald-500 h-full rounded-full transition-all"
                          style={{ width: `${score.scorePercent}%` }}
                        />
                      </div>
                      <span className="text-sm font-bold text-green-600 dark:text-green-400">
                        {score.scorePercent}%
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Eligibility Match
                    </p>
                  </div>

                  {score.matchedCriteria.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs font-medium text-green-700 dark:text-green-400 mb-1">
                        ✓ {score.matchedCriteria.length} criteria met
                      </p>
                    </div>
                  )}

                  {score.missingDocs.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Missing: {score.missingDocs.slice(0, 2).join(', ')}
                        {score.missingDocs.length > 2 && ` +${score.missingDocs.length - 2} more`}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 text-sm font-semibold mt-auto">
                    View Details
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
        
        <div className="border-t border-slate-200 my-8"></div>
        
        <div className="space-y-6">
          {categories.map((category) => {
            const categorySchemes = getSchemesByCategory(category.slug);
            if (categorySchemes.length === 0) return null;
            
            return (
              <section key={category.slug}>
                <div className="flex items-baseline justify-between mb-2 px-1">
                  <h2 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">{t('schemes_for')} {category.name}</h2>
                  <Link href={`/categories/${category.slug}`}>
                    <span className="text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer bg-blue-50 dark:bg-blue-900/30 px-2.5 py-1 rounded-full hover:bg-blue-100 dark:hover:bg-blue-800/30 transition-colors">{t('see_all')}</span>
                  </Link>
                </div>
                <SchemeGrid schemes={categorySchemes.map(s => ({
                  id: s.id,
                  title: s.title,
                  ministry: s.ministry,
                  description: s.description,
                  imageUrl: s.imageUrl,
                }))} />
              </section>
            );
          })}
        </div>
        </>}
      </main>
    </div>
  );
}
