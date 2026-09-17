'use client';

import { useEffect, useState } from 'react';
import { List } from 'lucide-react';

interface Section {
  id: string;
  title: string;
}

const sections: Section[] = [
  { id: 'overview', title: 'Overview' },
  { id: 'benefits', title: 'Benefits' },
  { id: 'eligibility', title: 'Eligibility' },
  { id: 'noteligible', title: 'Exclusions' },
  { id: 'howto', title: 'How to Apply' },
  { id: 'notes', title: 'Notes' },
  { id: 'mistakes', title: 'Mistakes' },
];

export default function TableOfContents() {
  const [activeSection, setActiveSection] = useState<string>('');

  useEffect(() => {
    const handleScroll = () => {
      for (const section of sections) {
        const element = document.getElementById(section.id);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top >= 100 && rect.top <= 300) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 100;
      const elementPosition = element.offsetTop - offset;
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="hidden lg:block w-52 flex-shrink-0">
      <div className="sticky top-24 h-fit rounded-xl p-4 bg-white border border-gray-200 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <List className="w-4 h-4 text-blue-600" />
          <h3 className="font-bold text-slate-900 text-sm">Sections</h3>
        </div>
        <nav className="space-y-1">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => scrollToSection(section.id)}
              className={`block w-full text-left px-2 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeSection === section.id
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {section.title}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
