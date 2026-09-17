import { Bell } from 'lucide-react';
import TopBarControls from '@/components/dashboard/TopBarControls';

export default function UpdatesPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="fixed top-4 right-4 z-50">
        <TopBarControls />
      </div>
      <div className="max-w-screen-sm md:max-w-2xl mx-auto px-4 py-6 md:py-8">
        <h1 className="text-xl font-bold text-gray-900 mb-6">Updates</h1>

        <div className="text-center py-16">
          <div className="w-20 h-20 bg-gradient-to-br from-[#4568F0]/10 to-[#4568F0]/5 rounded-full flex items-center justify-center mx-auto mb-4">
            <Bell className="w-10 h-10 text-[#4568F0]" />
          </div>
          <p className="text-gray-700 mb-2 font-medium">No new updates</p>
          <p className="text-sm text-gray-500">
            Check back later for new scheme announcements
          </p>
        </div>
      </div>
    </div>
  );
}
