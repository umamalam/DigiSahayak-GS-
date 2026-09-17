import { Phone, Mail, Globe } from 'lucide-react';

interface HelplineNumbersProps {
  tollfree?: string;
  email?: string;
  website?: string;
}

export default function HelplineNumbers({
  tollfree,
  email,
  website,
}: HelplineNumbersProps) {
  const contactItems = [
    ...(tollfree ? [{ icon: Phone, label: 'Toll-Free Helpline', value: tollfree, action: `tel:${tollfree}`, color: 'purple' }] : []),
    ...(email ? [{ icon: Mail, label: 'Email Support', value: email, action: `mailto:${email}`, color: 'purple' }] : []),
  ];

  return (
    <div className="space-y-3">
      {contactItems.map((item, idx) => {
        const Icon = item.icon;
        return (
          <a
            key={idx}
            href={item.action}
            className="flex items-center justify-between gap-3 bg-gray-50 rounded-xl p-4 border border-purple-200 hover:shadow-md transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                <Icon className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-600">{item.label}</p>
                <p className="text-sm font-semibold text-gray-900">{item.value}</p>
              </div>
            </div>
            <div className="text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity">→</div>
          </a>
        );
      })}

      {website && (
        <a
          href={website}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between gap-3 bg-gray-50 rounded-xl p-4 border border-cyan-200 hover:shadow-md transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-100 flex items-center justify-center group-hover:bg-cyan-200 transition-colors">
              <Globe className="w-5 h-5 text-cyan-600" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-600">Official Website</p>
              <p className="text-sm font-semibold text-gray-900 truncate">{website.replace('https://', '')}</p>
            </div>
          </div>
          <div className="text-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity">→</div>
        </a>
      )}
    </div>
  );
}
