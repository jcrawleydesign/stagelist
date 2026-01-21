import { X } from "lucide-react";
import { MetronomeSound } from "@/app/hooks/useMetronome";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  volume: number;
  isMuted: boolean;
  onVolumeChange: (volume: number) => void;
  onMuteToggle: () => void;
  metronomeSound: MetronomeSound;
  onMetronomeSoundChange: (sound: MetronomeSound) => void;
}

export function SettingsModal({
  isOpen,
  onClose,
  volume,
  isMuted,
  onVolumeChange,
  onMuteToggle,
  metronomeSound,
  onMetronomeSoundChange,
}: SettingsModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-gradient-to-br from-slate-800/95 to-slate-900/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl max-w-md w-full p-6 md:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-white">Settings</h2>
          <button
            onClick={onClose}
            className="p-2 text-white/50 hover:text-white hover:bg-white/10 active:bg-white/20 rounded-lg transition-colors"
            aria-label="Close settings"
          >
            <X size={24} />
          </button>
        </div>

        {/* Settings Content */}
        <div className="space-y-6">
          {/* Audio Settings Section */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Audio Settings</h3>
            
            {/* Volume Control */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-white/80">Volume</label>
                <span className="text-white/60 font-medium">{Math.round(volume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none
                  [&::-webkit-slider-thumb]:w-5
                  [&::-webkit-slider-thumb]:h-5
                  [&::-webkit-slider-thumb]:rounded-full
                  [&::-webkit-slider-thumb]:bg-gradient-to-br
                  [&::-webkit-slider-thumb]:from-purple-500
                  [&::-webkit-slider-thumb]:to-pink-500
                  [&::-webkit-slider-thumb]:cursor-pointer
                  [&::-webkit-slider-thumb]:shadow-lg
                  [&::-moz-range-thumb]:w-5
                  [&::-moz-range-thumb]:h-5
                  [&::-moz-range-thumb]:rounded-full
                  [&::-moz-range-thumb]:bg-gradient-to-br
                  [&::-moz-range-thumb]:from-purple-500
                  [&::-moz-range-thumb]:to-pink-500
                  [&::-moz-range-thumb]:border-0
                  [&::-moz-range-thumb]:cursor-pointer
                  [&::-moz-range-thumb]:shadow-lg"
              />
            </div>

            {/* Mute Toggle */}
            <div className="flex items-center justify-between pt-4 mt-4 border-t border-white/10">
              <label className="text-white/80">Mute Metronome</label>
              <button
                onClick={onMuteToggle}
                className={`relative w-14 h-8 rounded-full transition-colors ${
                  isMuted ? 'bg-white/20' : 'bg-gradient-to-r from-purple-500 to-pink-500'
                }`}
              >
                <div
                  className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-lg transition-transform ${
                    isMuted ? 'left-1' : 'left-7'
                  }`}
                />
              </button>
            </div>

            {/* Metronome Sound Selection */}
            <div className="pt-4 mt-4 border-t border-white/10">
              <label className="text-white/80 block mb-3">Metronome Sound</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => onMetronomeSoundChange('click')}
                  className={`px-4 py-3 rounded-lg font-medium transition-all ${
                    metronomeSound === 'click'
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                      : 'bg-white/10 text-white/60 hover:bg-white/20 hover:text-white/80'
                  }`}
                >
                  Click
                </button>
                <button
                  onClick={() => onMetronomeSoundChange('beep')}
                  className={`px-4 py-3 rounded-lg font-medium transition-all ${
                    metronomeSound === 'beep'
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                      : 'bg-white/10 text-white/60 hover:bg-white/20 hover:text-white/80'
                  }`}
                >
                  Beep
                </button>
                <button
                  onClick={() => onMetronomeSoundChange('woodblock')}
                  className={`px-4 py-3 rounded-lg font-medium transition-all ${
                    metronomeSound === 'woodblock'
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                      : 'bg-white/10 text-white/60 hover:bg-white/20 hover:text-white/80'
                  }`}
                >
                  Wood Block
                </button>
                <button
                  onClick={() => onMetronomeSoundChange('cowbell')}
                  className={`px-4 py-3 rounded-lg font-medium transition-all ${
                    metronomeSound === 'cowbell'
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                      : 'bg-white/10 text-white/60 hover:bg-white/20 hover:text-white/80'
                  }`}
                >
                  Cowbell
                </button>
                <button
                  onClick={() => onMetronomeSoundChange('snap')}
                  className={`px-4 py-3 rounded-lg font-medium transition-all col-span-2 ${
                    metronomeSound === 'snap'
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                      : 'bg-white/10 text-white/60 hover:bg-white/20 hover:text-white/80'
                  }`}
                >
                  Snap
                </button>
              </div>
            </div>
          </div>

          {/* App Info Section */}
          <div className="pt-6 border-t border-white/10">
            <h3 className="text-lg font-semibold text-white mb-3">About</h3>
            <div className="space-y-2 text-sm text-white/60">
              <p>Stage List Manager</p>
              <p>Version 1.0.0</p>
              <p className="pt-2 text-white/40 text-xs">
                A modern tool for managing your stage performance setlists with BPM tracking and metronome support.
              </p>
            </div>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 active:from-purple-700 active:to-pink-700 text-white font-semibold rounded-lg transition-all shadow-lg"
        >
          Done
        </button>
      </div>
    </div>
  );
}