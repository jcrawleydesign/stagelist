import { X, Link2, MessageCircle, Share2 } from "lucide-react";
import { useState } from "react";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  songCount: number;
}

export function ShareModal({ isOpen, onClose, title, songCount }: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const url = window.location.href;
  const shareText = `Check out my ${title} with ${songCount} songs!`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleMessages = () => {
    // SMS/iMessage URL scheme
    const smsUrl = `sms:&body=${encodeURIComponent(shareText + ' ' + url)}`;
    window.open(smsUrl, '_blank');
  };

  const handleWhatsApp = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + url)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleInstagram = () => {
    // Instagram doesn't support direct link sharing via URL
    // Copy to clipboard and inform user
    navigator.clipboard.writeText(url);
    alert('Link copied! You can paste it in your Instagram message or story.');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-gradient-to-br from-slate-800 to-slate-900 border border-white/20 rounded-2xl shadow-2xl max-w-md w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Share Stage List</h2>
          <button
            onClick={onClose}
            className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X size={24} />
          </button>
        </div>

        {/* Share Options */}
        <div className="space-y-3">
          {/* Copy Link */}
          <button
            onClick={handleCopyLink}
            className="w-full flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 active:bg-white/15 border border-white/10 rounded-xl transition-colors group"
          >
            <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
              <Link2 size={24} className="text-white" />
            </div>
            <div className="flex-1 text-left">
              <div className="text-white font-semibold">
                {copied ? 'Link Copied!' : 'Copy Link'}
              </div>
              <div className="text-white/60 text-sm">Copy URL to clipboard</div>
            </div>
          </button>

          {/* Apple Messages */}
          <button
            onClick={handleMessages}
            className="w-full flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 active:bg-white/15 border border-white/10 rounded-xl transition-colors group"
          >
            <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg">
              <MessageCircle size={24} className="text-white" />
            </div>
            <div className="flex-1 text-left">
              <div className="text-white font-semibold">Messages</div>
              <div className="text-white/60 text-sm">Share via SMS/iMessage</div>
            </div>
          </button>

          {/* WhatsApp */}
          <button
            onClick={handleWhatsApp}
            className="w-full flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 active:bg-white/15 border border-white/10 rounded-xl transition-colors group"
          >
            <div className="p-3 bg-gradient-to-br from-green-400 to-green-600 rounded-lg">
              <MessageCircle size={24} className="text-white" />
            </div>
            <div className="flex-1 text-left">
              <div className="text-white font-semibold">WhatsApp</div>
              <div className="text-white/60 text-sm">Share via WhatsApp</div>
            </div>
          </button>

          {/* Instagram */}
          <button
            onClick={handleInstagram}
            className="w-full flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 active:bg-white/15 border border-white/10 rounded-xl transition-colors group"
          >
            <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
              <Share2 size={24} className="text-white" />
            </div>
            <div className="flex-1 text-left">
              <div className="text-white font-semibold">Instagram</div>
              <div className="text-white/60 text-sm">Copy link for Instagram</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
