'use client';

import React, { useState, memo } from 'react';
import { X, Send, AlertCircle, CheckCircle2 } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  schemeName: string;
}

function HelpModal({
  isOpen,
  onClose,
  schemeName,
}: HelpModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    issue: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('Please enter your name');
      return;
    }
    if (!formData.mobile.trim()) {
      setError('Please enter your mobile number');
      return;
    }
    if (formData.mobile.length < 10) {
      setError('Mobile number must be at least 10 digits');
      return;
    }
    if (!formData.issue.trim()) {
      setError('Please describe your issue');
      return;
    }

    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      setSubmitted(true);
      setIsLoading(false);
      
      setTimeout(() => {
        handleClose();
      }, 2500);
    } catch (err) {
      setError('Failed to submit. Please try again.');
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ name: '', mobile: '', issue: '' });
    setSubmitted(false);
    setError('');
    setIsLoading(false);
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !submitted && !isLoading) {
      handleClose();
    }
  };

  const isFormValid = formData.name.trim() && formData.mobile.trim() && formData.issue.trim();

  return (
    <div 
      className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 pb-20 transition-opacity duration-200 ${
        isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
      onClick={handleBackdropClick}
    >
      <div className="bg-white w-full md:max-w-md md:rounded-2xl rounded-2xl shadow-2xl max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-[#4568F0] to-[#5A78FF] text-white p-5 md:p-6 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-lg md:text-xl font-bold">Get Help</h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
            type="button"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 md:p-6">
          <p className="text-sm md:text-base text-gray-600 mb-5">
            Having issues with <span className="font-semibold text-gray-900">{schemeName}</span>?
            <br />
            Tell us what's wrong and we'll help.
          </p>

          {/* Success State */}
          {submitted ? (
            <div className="space-y-4 text-center py-6">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10 text-green-600" />
                </div>
              </div>
              <div>
                <p className="text-lg font-bold text-green-900 mb-2">
                  Request Submitted!
                </p>
                <p className="text-sm text-green-700 mb-4">
                  Thank you for reaching out. Our support team will contact you within 24 hours.
                </p>
              </div>
              <button
                onClick={handleClose}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition-colors"
                type="button"
              >
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-900">{error}</p>
                </div>
              )}

              {/* Name Input */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  disabled={isLoading}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#4568F0] focus:ring-2 focus:ring-[#4568F0]/20 outline-none transition-all text-sm disabled:bg-gray-100 disabled:text-gray-500"
                />
              </div>

              {/* Mobile Input */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  placeholder="10-digit mobile number"
                  disabled={isLoading}
                  maxLength={10}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#4568F0] focus:ring-2 focus:ring-[#4568F0]/20 outline-none transition-all text-sm disabled:bg-gray-100 disabled:text-gray-500"
                />
              </div>

              {/* Issue Description */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Describe Your Issue
                </label>
                <textarea
                  name="issue"
                  value={formData.issue}
                  onChange={handleChange}
                  placeholder="Tell us what's wrong..."
                  disabled={isLoading}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#4568F0] focus:ring-2 focus:ring-[#4568F0]/20 outline-none transition-all text-sm resize-none disabled:bg-gray-100 disabled:text-gray-500"
                />
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex gap-2">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs md:text-sm text-blue-900">
                  Response time: Within 24 hours during working days
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!isFormValid || isLoading}
                className="w-full bg-[#4568F0] hover:bg-[#3a56d4] disabled:bg-gray-300 text-white font-bold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit Request
                  </>
                )}
              </button>

              {/* Cancel Button */}
              <button
                type="button"
                onClick={handleClose}
                className="w-full border-2 border-gray-300 text-gray-600 hover:bg-gray-50 font-semibold py-3 rounded-xl transition-all"
              >
                Cancel
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default memo(HelpModal);
