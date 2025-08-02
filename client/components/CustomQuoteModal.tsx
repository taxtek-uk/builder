import { useState } from 'react';
import { X, MessageSquareMore, Mail, User, FileText, Ruler } from 'lucide-react';

interface CustomQuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  wallWidth: number;
  moduleCount: number;
}

export function CustomQuoteModal({ isOpen, onClose, wallWidth, moduleCount }: CustomQuoteModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    wallWidth: wallWidth.toString(),
    modules: moduleCount.toString(),
    notes: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In real implementation, this would submit to your backend
    console.log('Custom quote request:', formData);
    alert('Thank you! We\'ll contact you within 24 hours with a custom quotation.');
    
    setIsSubmitting(false);
    onClose();
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        {/* Modal */}
        <div className="bg-white rounded-lg shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gold-100 rounded-lg flex items-center justify-center">
                <MessageSquareMore size={20} className="text-gold-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Custom Configuration Required</h2>
                <p className="text-sm text-slate-600">Request a tailored quotation</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X size={20} className="text-slate-400" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Info Message */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-6">
              <p className="text-sm text-amber-800">
                For walls above 6.0 metres or more than 6 modules, please request a tailored quotation from our design team.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <User size={16} className="inline mr-2" />
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                  placeholder="Enter your full name"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <Mail size={16} className="inline mr-2" />
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                  placeholder="Enter your email address"
                />
              </div>

              {/* Wall Dimensions */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    <Ruler size={16} className="inline mr-2" />
                    Wall Width (mm)
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.wallWidth}
                    onChange={(e) => handleInputChange('wallWidth', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Modules
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.modules}
                    onChange={(e) => handleInputChange('modules', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <FileText size={16} className="inline mr-2" />
                  Additional Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent resize-none"
                  placeholder="Any specific requirements or questions..."
                />
              </div>

              {/* Buttons */}
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 flex items-center justify-center space-x-2 bg-gold-500 hover:bg-gold-600 disabled:bg-gold-300 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  <MessageSquareMore size={16} />
                  <span>{isSubmitting ? 'Sending...' : 'Get Quote'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
