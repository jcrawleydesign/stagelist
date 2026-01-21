import { motion } from "motion/react";
import { GripVertical, Trash2, Edit2, Check, X, Lock, Unlock } from "lucide-react";
import { useState, useRef } from "react";
import { useDrag, useDrop } from "react-dnd";

// Song row component with lock functionality
interface SongRowProps {
  id: number;
  number: number;
  title: string;
  bpm: number;
  color: string;
  isPlaying: boolean;
  isLocked: boolean;
  onClick: () => void;
  onEdit: (title: string, bpm: number) => void;
  onDelete: () => void;
  onMove: (dragIndex: number, hoverIndex: number) => void;
  onToggleLock: () => void;
  index: number;
}

const ITEM_TYPE = 'SONG_ROW';

export function SongRow({ id, number, title, bpm, color, isPlaying, isLocked, onClick, onEdit, onDelete, onMove, onToggleLock, index }: SongRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(title);
  const [editBpm, setEditBpm] = useState(bpm.toString());

  // Calculate animation duration based on BPM
  // Duration = 60 seconds / BPM (for one beat)
  const animationDuration = 60 / bpm;

  // ALL HOOKS MUST BE DEFINED BEFORE ANY CONDITIONAL RETURNS
  const ref = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag] = useDrag({
    type: ITEM_TYPE,
    item: { id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [{ isOver }, drop] = useDrop({
    accept: ITEM_TYPE,
    hover(item: { id: number, index: number }, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }

      // Determine rectangle on screen
      const hoverBoundingRect = ref.current?.getBoundingClientRect();

      // Get vertical middle
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

      // Determine mouse position
      const clientOffset = monitor.getClientOffset();

      // Get pixels to the top
      const hoverClientY = (clientOffset as { x: number, y: number }).y - hoverBoundingRect.top;

      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%

      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      // Time to actually perform the action
      onMove(dragIndex, hoverIndex);

      // Note: we're mutating the monitor item here
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex;
    },
  });

  const opacity = isDragging ? 0.5 : 1;

  // Apply drop to the container, drag to the handle using callback ref
  drop(ref);
  
  // Callback ref that works for both mobile and desktop
  const dragHandleRef = (node: HTMLDivElement | null) => {
    drag(node);
  };

  const handleSave = () => {
    if (editTitle.trim() && editBpm && Number(editBpm) > 0) {
      onEdit(editTitle.trim(), Number(editBpm));
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditTitle(title);
    setEditBpm(bpm.toString());
    setIsEditing(false);
  };

  // NOW WE CAN HAVE CONDITIONAL RENDERING
  if (isEditing) {
    return (
      <motion.div
        className="relative overflow-hidden rounded-2xl backdrop-blur-sm bg-white/10 border border-white/20 shadow-lg"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${color}`} />
        
        <div className="relative p-4 md:p-6 space-y-4">
          {/* Title Input */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-white/70 uppercase tracking-wider">
              Song Title
            </label>
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full bg-white/5 border border-white/30 rounded-lg px-4 py-3 text-lg font-bold text-white
                focus:outline-none focus:ring-2 focus:ring-white/40"
              autoFocus
            />
          </div>

          {/* BPM Input */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-white/70 uppercase tracking-wider">
              BPM
            </label>
            <input
              type="number"
              value={editBpm}
              onChange={(e) => setEditBpm(e.target.value)}
              min="1"
              max="300"
              className="w-full bg-white/5 border border-white/30 rounded-lg px-4 py-3 text-lg font-bold text-white
                focus:outline-none focus:ring-2 focus:ring-white/40"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSave}
              className="flex-1 bg-green-500/20 hover:bg-green-500/30 text-green-300 font-semibold py-3 rounded-lg
                transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <Check size={20} />
              Save
            </button>
            <button
              onClick={handleCancel}
              className="flex-1 bg-white/5 hover:bg-white/10 text-white/70 font-semibold py-3 rounded-lg
                transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <X size={20} />
              Cancel
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      ref={ref}
      className={`
        relative overflow-hidden rounded-2xl group
        backdrop-blur-sm bg-white/10 border border-white/20
        shadow-lg hover:shadow-2xl transition-shadow duration-300
      `}
      whileHover={{ scale: 1.01 }}
      style={{ opacity }}
    >
      {/* Gradient overlay */}
      <motion.div
        className={`absolute inset-0 bg-gradient-to-r ${color} pointer-events-none`}
        animate={
          isPlaying
            ? {
                opacity: [0.6, 0],
              }
            : {
                opacity: 0,
              }
        }
        transition={
          isPlaying
            ? {
                duration: animationDuration,
                repeat: Infinity,
                ease: "easeOut",
              }
            : {}
        }
      />
      
      {/* Accent bar */}
      <motion.div
        className={`absolute left-0 top-0 bottom-0 bg-gradient-to-b ${color}`}
        animate={
          isPlaying
            ? {
                width: ["16px", "4px"],
                opacity: [1, 0.8],
              }
            : {
                width: "4px",
                opacity: 0.8,
              }
        }
        transition={
          isPlaying
            ? {
                duration: animationDuration,
                repeat: Infinity,
                ease: "easeOut",
              }
            : {}
        }
      />

      {/* Mobile Layout */}
      <div className="relative md:hidden">
        <div className="flex items-center gap-3 px-4 py-4">
          {/* Playing Indicator or Drag Handle */}
          <div 
            ref={dragHandleRef}
            className="text-white/40 active:text-white/60 cursor-grab active:cursor-grabbing transition-colors touch-none"
          >
            {isPlaying ? (
              <div className="flex gap-1 items-center justify-center w-5">
                {[0, 0.15, 0.3].map((delay, i) => (
                  <motion.div
                    key={i}
                    className={`w-1 h-4 rounded-full bg-gradient-to-b ${color}`}
                    animate={{
                      scaleY: [1, 1.8, 1],
                      opacity: [0.6, 1, 0.6],
                    }}
                    transition={{
                      duration: 0.6,
                      repeat: Infinity,
                      delay,
                      ease: "easeInOut",
                    }}
                  />
                ))}
              </div>
            ) : (
              <GripVertical size={20} />
            )}
          </div>

          {/* Number */}
          <div className="text-lg font-bold text-white/70 min-w-[2ch]">
            {String(number).padStart(2, '0')}
          </div>

          {/* Main Content - Clickable */}
          <div 
            className={`flex-1 min-w-0 ${isLocked ? '' : 'cursor-pointer'}`}
            onClick={isLocked ? undefined : onClick}
          >
            <div className="text-lg font-bold text-white tracking-tight truncate">
              {title}
            </div>
            <div className="text-sm text-white/60 font-medium">
              {bpm} BPM
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleLock();
              }}
              className={`transition-colors p-2 active:bg-white/10 rounded-lg ${
                isLocked ? 'text-yellow-400 active:text-yellow-300' : 'text-white/60 active:text-white/90'
              }`}
              aria-label={isLocked ? "Unlock" : "Lock"}
            >
              {isLocked ? <Lock size={20} /> : <Unlock size={20} />}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
              }}
              className="text-white/60 active:text-white/90 transition-colors p-2 active:bg-white/10 rounded-lg"
              aria-label="Edit"
            >
              <Edit2 size={20} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="text-white/60 active:text-red-400 transition-colors p-2 active:bg-white/10 rounded-lg"
              aria-label="Delete"
            >
              <Trash2 size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="relative hidden md:grid grid-cols-[40px_80px_1fr_100px_120px] gap-4 items-center px-6 py-5">
        {/* Playing Indicator or Drag Handle */}
        <div 
          ref={dragHandleRef}
          className="text-white/40 hover:text-white/60 cursor-grab active:cursor-grabbing transition-colors"
        >
          {isPlaying ? (
            <div className="flex gap-1 items-center justify-center">
              {[0, 0.15, 0.3].map((delay, i) => (
                <motion.div
                  key={i}
                  className={`w-1 h-4 rounded-full bg-gradient-to-b ${color}`}
                  animate={{
                    scaleY: [1, 1.8, 1],
                    opacity: [0.6, 1, 0.6],
                  }}
                  transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    delay,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </div>
          ) : (
            <GripVertical size={20} />
          )}
        </div>

        {/* Number */}
        <div className="text-xl font-bold text-white/70">
          {String(number).padStart(2, '0')}
        </div>
        
        {/* Title */}
        <div 
          className={`text-2xl lg:text-3xl font-bold text-white tracking-tight truncate ${isLocked ? '' : 'cursor-pointer'}`}
          onClick={isLocked ? undefined : onClick}
        >
          {title}
        </div>
        
        {/* BPM */}
        <div 
          className={`text-right flex flex-col items-end ${isLocked ? '' : 'cursor-pointer'}`}
          onClick={isLocked ? undefined : onClick}
        >
          <div className="text-3xl font-bold text-white">
            {bpm}
          </div>
          <div className="text-xs text-white/50 font-medium uppercase tracking-wider">
            BPM
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 justify-end">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleLock();
            }}
            className={`transition-colors ${
              isLocked ? 'text-yellow-400 hover:text-yellow-300' : 'text-white/40 hover:text-white/80'
            }`}
            aria-label={isLocked ? "Unlock" : "Lock"}
          >
            {isLocked ? <Lock size={18} /> : <Unlock size={18} />}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(true);
            }}
            className="text-white/40 hover:text-white/80 transition-colors"
            aria-label="Edit"
          >
            <Edit2 size={18} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="text-white/40 hover:text-red-400 transition-colors"
            aria-label="Delete"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}