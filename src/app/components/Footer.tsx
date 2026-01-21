import { Linkedin, Instagram, Share2 } from "lucide-react";

interface FooterProps {
  onShare: () => void;
}

export function Footer({ onShare }: FooterProps) {
  return (
    <footer className="mt-auto pt-8 pb-6">
      <div className="max-w-[1400px] w-full mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 px-4">
        {/* Copyright */}
        <div className="text-white/50 text-sm">
          © {new Date().getFullYear()} Stage List. All rights reserved.
        </div>

        {/* Social Icons & Share */}
        <div className="flex items-center gap-3">
          {/* Social Links */}
          <a
            href="https://www.linkedin.com/in/jeremy-crawley-9a7b4769"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2.5 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            aria-label="LinkedIn"
          >
            <Linkedin size={20} />
          </a>
          <a
            href="https://www.instagram.com/jcrawleyphoto/?hl=en"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2.5 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Instagram"
          >
            <Instagram size={20} />
          </a>

          {/* Divider */}
          <div className="h-6 w-px bg-white/20 mx-1"></div>

          {/* Share Button */}
          <button
            onClick={onShare}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 active:from-purple-700 active:to-pink-700 text-white rounded-lg transition-all shadow-lg hover:shadow-purple-500/50"
            aria-label="Share Stage List"
          >
            <Share2 size={18} />
            <span className="font-medium">Share</span>
          </button>
        </div>
      </div>
    </footer>
  );
}