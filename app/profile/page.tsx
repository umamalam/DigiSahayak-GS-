'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import UserProfileCard from '@/components/dashboard/UserProfileCard';
import DocumentUploadSection from '@/components/dashboard/DocumentUploadSection';
import EligibilityScoreCard from '@/components/dashboard/EligibilityScoreCard';
import ApplicationStatusCard from '@/components/dashboard/ApplicationStatusCard';
import TopBarControls from '@/components/dashboard/TopBarControls';
import { FileText, Award, User, Briefcase, Shield } from 'lucide-react';

interface UserData {
  id: number;
  name: string;
  phone: string;
  createdAt: string;
  role?: string;
}

interface Application {
  id: number;
  schemeName: string;
  status: 'Not Started' | 'In Progress' | 'Submitted' | 'Approved' | 'Rejected';
  appliedAt: string;
}

interface EligibilityData {
  scores: any[];
  totalSchemes: number;
  highlyEligible: number;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [eligibility, setEligibility] = useState<EligibilityData | null>(null);
  const [documentsCount, setDocumentsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/user/me', { credentials: 'include' }).then(res => res.ok ? res.json() : Promise.reject('Auth failed')),
      fetch('/api/user/applications', { credentials: 'include' }).then(res => res.ok ? res.json() : { applications: [] }),
      fetch('/api/user/eligibility', { credentials: 'include' }).then(res => res.ok ? res.json() : { scores: [], totalSchemes: 0, highlyEligible: 0 }),
      fetch('/api/documents/user', { credentials: 'include' }).then(res => res.ok ? res.json() : { documents: [] }),
      fetch('/api/auth/check-session', { credentials: 'include' }).then(res => res.ok ? res.json() : { user: { role: 'user' } })
    ])
      .then(([userData, appsData, eligibilityData, docsData, sessionData]) => {
        setUser({ ...userData, role: sessionData.user?.role || 'user' });
        setApplications(appsData.applications || []);
        setEligibility(eligibilityData);
        setDocumentsCount(docsData.documents?.length || 0);
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch data:', err);
        router.push('/login');
      });
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <p className="text-gray-500">User not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="fixed top-4 right-4 z-50">
        <TopBarControls />
      </div>
      <div className="max-w-screen-sm md:max-w-2xl mx-auto px-4 py-6 md:py-8">
        {/* Page Title */}
        <h1 className="text-2xl font-bold text-gray-900 mb-8">My Dashboard</h1>

        {/* Tabs */}
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-gray-100 p-1 rounded-xl">
            <TabsTrigger value="profile" className="flex items-center gap-2 rounded-lg">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="applications" className="flex items-center gap-2 rounded-lg">
              <Briefcase className="w-4 h-4" />
              <span className="hidden sm:inline">Applications</span>
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center gap-2 rounded-lg">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Documents</span>
            </TabsTrigger>
            <TabsTrigger value="eligibility" className="flex items-center gap-2 rounded-lg">
              <Award className="w-4 h-4" />
              <span className="hidden sm:inline">Eligibility</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-4">
            <UserProfileCard
              name={user.name}
              mobile={user.phone}
              memberSince={user.createdAt}
              schemesEligible={eligibility?.highlyEligible || 0}
              totalSchemes={eligibility?.totalSchemes || 0}
              documentsUploaded={documentsCount}
              totalDocuments={9}
            />

            {/* Employee Dashboard Button - Only visible to employees/admins */}
            {(user.role === 'employee' || user.role === 'admin') && (
              <button
                onClick={() => router.push('/employee/dashboard')}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white rounded-2xl p-5 mb-4 shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] flex items-center justify-center gap-3"
              >
                <Shield className="w-6 h-6" />
                <div className="text-left">
                  <p className="font-bold text-lg">Employee Dashboard</p>
                  <p className="text-xs text-blue-100">Manage Support Tickets</p>
                </div>
              </button>
            )}

            {/* Quick Links */}
            <div className="grid grid-cols-2 gap-3 pt-4">
              <button className="bg-white border-2 border-gray-100 hover:border-[#4568F0] rounded-2xl p-4 text-center transition-all">
                <div className="text-2xl mb-2">🔗</div>
                <p className="text-xs font-semibold text-gray-900">Linked Schemes</p>
                <p className="text-lg font-bold text-[#4568F0]">8</p>
              </button>
              <button className="bg-white border-2 border-gray-100 hover:border-[#4568F0] rounded-2xl p-4 text-center transition-all">
                <div className="text-2xl mb-2">📱</div>
                <p className="text-xs font-semibold text-gray-900">Applications</p>
                <p className="text-lg font-bold text-[#4568F0]">{applications.length}</p>
              </button>
            </div>
          </TabsContent>

          {/* Applications Tab */}
          <TabsContent value="applications" className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-4">
              <p className="text-sm text-blue-900">
                📋 Track all your scheme applications here. View status and next steps.
              </p>
            </div>
            {applications.length > 0 ? (
              <div className="space-y-3">
                {applications.map((app) => (
                  <ApplicationStatusCard
                    key={app.id}
                    schemeName={app.schemeName}
                    status={app.status}
                    appliedAt={app.appliedAt}
                    onViewClick={() => console.log('View application:', app.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 rounded-2xl p-8 text-center">
                <p className="text-gray-500">No applications yet. Start applying to schemes!</p>
              </div>
            )}
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-4">
              <p className="text-sm text-blue-900">
                📂 Upload your documents once and apply to any scheme. Your documents stay private and secure.
              </p>
            </div>
            <DocumentUploadSection />
          </TabsContent>

          {/* Eligibility Tab */}
          <TabsContent value="eligibility" className="space-y-4">
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Based on your profile and uploaded documents, here's your eligibility for top schemes:
              </p>
              <EligibilityScoreCard
                schemeName="PM-KISAN"
                score={95}
                eligibilityStatus="eligible"
                reasons={[
                  'Land area: ✓ 2.5 acres',
                  'Farmer Status: ✓ Verified',
                  'Income: ✓ Within limit',
                  'Residency: ✓ Indian resident',
                ]}
              />
              <EligibilityScoreCard
                schemeName="Pradhan Mantri Fasal"
                score={72}
                eligibilityStatus="partial"
                reasons={[
                  'Land Records: ⚠ Pending verification',
                  'Crop Type: ✓ Covered',
                  'Insurance: ✓ Not enrolled',
                  'Income: ✓ Below limit',
                ]}
              />
              <EligibilityScoreCard
                schemeName="Kisan Credit Card"
                score={88}
                eligibilityStatus="eligible"
                reasons={[
                  'Farmer Status: ✓ Verified',
                  'Credit Score: ✓ Eligible',
                  'Bank Account: ✓ Active',
                  'Documents: ✓ Complete',
                ]}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
