'use client';

import { useState, useEffect } from 'react';
import SearchBar from '@/components/ui/SearchBar';
import SchemeCard from '@/components/ui/SchemeCard';
import TopBarControls from '@/components/dashboard/TopBarControls';
import type { Scheme } from '@/lib/db/schema';

export default function SearchPage() {
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [filteredSchemes, setFilteredSchemes] = useState<Scheme[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/schemes')
      .then(res => res.json())
      .then(data => {
        setSchemes(data);
        setFilteredSchemes(data);
        setIsLoading(false);
      });
  }, []);

  const handleSearch = (query: string) => {
    if (!query.trim()) {
      setFilteredSchemes(schemes);
      return;
    }

    const lowercaseQuery = query.toLowerCase();
    const filtered = schemes.filter(
      (scheme) =>
        scheme.title.toLowerCase().includes(lowercaseQuery) ||
        scheme.description.toLowerCase().includes(lowercaseQuery) ||
        scheme.ministry.toLowerCase().includes(lowercaseQuery)
    );
    setFilteredSchemes(filtered);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="fixed top-4 right-4 z-50">
        <TopBarControls />
      </div>
      <div className="max-w-screen-sm md:max-w-2xl lg:max-w-4xl mx-auto px-4 py-6 md:py-8">
        <h1 className="text-xl font-bold text-gray-900 mb-6">Search Schemes</h1>

        <div className="mb-6">
          <SearchBar onSearch={handleSearch} placeholder="Search by name, ministry, or keywords..." />
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-sm">Loading schemes...</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-600 mb-4">
              {filteredSchemes.length} scheme{filteredSchemes.length !== 1 ? 's' : ''} found
            </p>
            
            <div className="space-y-3">
              {filteredSchemes.map((scheme) => (
                <SchemeCard key={scheme.id} scheme={scheme} />
              ))}
            </div>

            {filteredSchemes.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-sm">No schemes found matching your search.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
