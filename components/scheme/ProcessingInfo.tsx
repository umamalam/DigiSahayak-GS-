import { Clock, AlertCircle } from 'lucide-react';

interface ProcessingInfoProps {
  processingTime?: string;
  validity?: string;
  mistakes?: string;
  notes?: string;
}

export default function ProcessingInfo({
  processingTime,
  validity,
  mistakes,
  notes,
}: ProcessingInfoProps) {
  return (
    <div className="space-y-4">
      {processingTime && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex gap-3">
            <Clock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 text-sm">Processing Time</h3>
              <p className="text-sm text-blue-700 mt-1">{processingTime}</p>
            </div>
          </div>
        </div>
      )}

      {validity && (
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-purple-900 text-sm">Scheme Validity</h3>
              <p className="text-sm text-purple-700 mt-1">{validity}</p>
            </div>
          </div>
        </div>
      )}

      {mistakes && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <h3 className="font-semibold text-amber-900 text-sm mb-2">Common Mistakes to Avoid</h3>
          <p className="text-sm text-amber-800 leading-relaxed">{mistakes}</p>
        </div>
      )}

      {notes && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <h3 className="font-semibold text-green-900 text-sm mb-2">Additional Notes</h3>
          <p className="text-sm text-green-800 leading-relaxed">{notes}</p>
        </div>
      )}
    </div>
  );
}
