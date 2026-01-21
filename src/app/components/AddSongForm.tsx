import { useState, useRef, useEffect } from "react";
import { Plus } from "lucide-react";

interface AddSongFormProps {
  onAddSong: (title: string, bpm: number) => void;
}

export function AddSongForm({ onAddSong }: AddSongFormProps) {
  const [title, setTitle] = useState("");
  const [bpm, setBpm] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (isExpanded && titleInputRef.current && formRef.current) {
      titleInputRef.current.focus();
      // Scroll form to center of viewport
      formRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
    }
  }, [isExpanded]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && bpm && Number(bpm) > 0) {
      onAddSong(title.trim(), Number(bpm));
      setTitle("");
      setBpm("");
      setIsExpanded(false);
    }
  };

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="w-full backdrop-blur-sm bg-white/5 border-2 border-dashed border-white/20 rounded-2xl px-4 md:px-6 py-6 md:py-8 
          active:bg-white/10 active:border-white/30 transition-all duration-300"
      >
        <div className="flex items-center justify-center gap-3 text-white/60">
          <Plus size={20} className="md:hidden" />
          <Plus size={24} className="hidden md:block" />
          <span className="text-base md:text-lg font-semibold">Add New Song</span>
        </div>
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="backdrop-blur-sm bg-white/10 border border-white/20 rounded-2xl p-4 md:p-6 shadow-lg"
      ref={formRef}
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="songTitle" className="text-xs md:text-sm font-semibold text-white/70 uppercase tracking-wider">
            Song Title
          </label>
          <input
            id="songTitle"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter song title..."
            className="bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white text-base md:text-lg
              placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-white/40"
            ref={titleInputRef}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="songBpm" className="text-xs md:text-sm font-semibold text-white/70 uppercase tracking-wider">
            BPM
          </label>
          <input
            id="songBpm"
            type="number"
            value={bpm}
            onChange={(e) => setBpm(e.target.value)}
            placeholder="120"
            min="1"
            max="300"
            className="bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white text-base md:text-lg
              placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-white/40"
          />
        </div>

        <div className="flex gap-3 mt-2">
          <button
            type="submit"
            className="flex-1 bg-white/20 active:bg-white/30 text-white font-semibold py-3 md:py-3.5 rounded-lg
              transition-colors duration-200 text-base"
          >
            Add Song
          </button>
          <button
            type="button"
            onClick={() => {
              setIsExpanded(false);
              setTitle("");
              setBpm("");
            }}
            className="px-4 md:px-6 bg-white/5 active:bg-white/10 text-white/70 font-semibold py-3 md:py-3.5 rounded-lg
              transition-colors duration-200 text-base"
          >
            Cancel
          </button>
        </div>
      </div>
    </form>
  );
}