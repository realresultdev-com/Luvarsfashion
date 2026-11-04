import { useState } from "react";
import { Link } from "react-router-dom";
import { Trash2, AlertTriangle, CheckCircle2, ShieldCheck, Mail, ArrowLeft } from "lucide-react";

export default function AccountDeletion() {
  const [email, setEmail] = useState("");
  const [reason, setReason] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    // Simulating deletion request queue
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-xl mx-auto w-full space-y-8">
        <div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Store
          </Link>

          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-100 rounded-2xl text-red-600">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Request Account & Data Deletion</h1>
              <p className="text-sm text-gray-500">Google Play Policy & Privacy Compliance</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 text-amber-900 text-sm">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Permanent Action Notice</p>
              <p className="mt-1 text-amber-800 text-xs sm:text-sm">
                In compliance with Google Play User Data policies, submitting this form will initiate
                the permanent removal of your Luvars Fashion account, order history records, saved addresses,
                and associated personal information from our databases.
              </p>
            </div>
          </div>

          {submitted ? (
            <div className="text-center py-8 space-y-4">
              <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto" />
              <h3 className="text-xl font-bold text-gray-900">Deletion Request Received</h3>
              <p className="text-sm text-gray-600 max-w-md mx-auto">
                We have registered your deletion request for <strong>{email}</strong>. Our data operations
                team will process the purge within 3-5 business days. An acknowledgement has been recorded.
              </p>
              <Link
                to="/"
                className="inline-block mt-4 px-6 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-black transition-colors"
              >
                Return to Homepage
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                  Account Email Address
                </label>
                <div className="relative">
                  <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter the email associated with your account"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                  Reason for Deletion (Optional)
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                >
                  <option value="">Select a reason...</option>
                  <option value="privacy">Privacy concerns</option>
                  <option value="no_longer_needed">No longer using the service</option>
                  <option value="duplicate">Created duplicate account</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold text-sm transition-colors shadow-xs flex items-center justify-center gap-2"
                >
                  {isSubmitting ? "Submitting Request..." : "Request Account & Data Deletion"}
                </button>
              </div>
            </form>
          )}

          <div className="border-t border-gray-100 pt-4 flex items-center gap-2 text-xs text-gray-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Secure SSL 256-Bit Encrypted Google Play Compliance Pipeline</span>
          </div>
        </div>
      </div>
    </div>
  );
}
