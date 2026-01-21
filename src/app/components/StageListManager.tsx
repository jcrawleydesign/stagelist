import { X, Plus, Trash2, Check, Edit2, Home, Music, Copy, MoreVertical, LogIn, LogOut, User, UserPlus } from "lucide-react";
import { useState, useEffect } from "react";
import RockIcon from "@/imports/RockIcon-48-634";
import { listsAPI } from "@/app/services/api";

interface Song {
  id: number;
  number: number;
  title: string;
  bpm: number;
  color: string;
}

interface SavedStageList {
  id: string;
  name: string;
  songs: Song[];
  nextId: number;
  createdAt: string;
  updatedAt: string;
}

interface StageListManagerProps {
  isOpen: boolean;
  onClose: () => void;
  currentListId: string;
  currentListName: string;
  currentSongs: Song[];
  currentNextId: number;
  onLoadList: (list: SavedStageList) => void;
  onSaveCurrentAs: (name: string) => void;
  onRenameList: (id: string, newName: string) => void;
  onDeleteList: (id: string) => void;
  onCreateNewList: () => void;
  onDuplicateList: (list: SavedStageList) => void;
  user?: any | null;
  onOpenAuth?: (mode: 'signin' | 'signup') => void;
  onLogout?: () => void;
}

export function StageListManager({
  isOpen,
  onClose,
  currentListId,
  currentListName,
  currentSongs,
  currentNextId,
  onLoadList,
  onSaveCurrentAs,
  onRenameList,
  onDeleteList,
  onCreateNewList,
  onDuplicateList,
  user,
  onOpenAuth,
  onLogout,
}: StageListManagerProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [newListName, setNewListName] = useState("");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [savedLists, setSavedLists] = useState<SavedStageList[]>([]);
  const [isLoadingLists, setIsLoadingLists] = useState(false);

  // Load lists from cloud if user is authenticated, otherwise from localStorage
  useEffect(() => {
    const loadLists = async () => {
      if (!isOpen) return;
      
      setIsLoadingLists(true);
      try {
        if (user) {
          // Load from cloud
          const cloudLists = await listsAPI.getAll();
          setSavedLists(cloudLists);
          // Also update localStorage for offline access
          localStorage.setItem("stageLists", JSON.stringify(cloudLists));
        } else {
          // Load from localStorage
          const savedListsJson = localStorage.getItem("stageLists");
          const localLists: SavedStageList[] = savedListsJson ? JSON.parse(savedListsJson) : [];
          setSavedLists(localLists);
        }
      } catch (error) {
        console.error("Failed to load lists:", error);
        // Fallback to localStorage
        const savedListsJson = localStorage.getItem("stageLists");
        const localLists: SavedStageList[] = savedListsJson ? JSON.parse(savedListsJson) : [];
        setSavedLists(localLists);
      } finally {
        setIsLoadingLists(false);
      }
    };

    loadLists();
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleCreateNew = () => {
    onCreateNewList();
    onClose();
  };

  const handleRename = (id: string) => {
    if (editingName.trim()) {
      onRenameList(id, editingName.trim());
      setEditingId(null);
      setEditingName("");
    }
  };

  const startEditing = (id: string, currentName: string) => {
    setEditingId(id);
    setEditingName(currentName);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"
    >
      {/* Top Right Login/Logout Button */}
      <div className="absolute top-4 right-4 md:top-8 md:right-8 z-10">
        {user ? (
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl px-4 py-2.5">
              <User size={18} className="text-white/70" />
              <span className="text-white/70 text-sm">{user.email}</span>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-4 py-2.5 backdrop-blur-xl bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 text-white rounded-xl transition-all hover:scale-105 active:scale-95 shadow-lg"
              aria-label="Logout"
            >
              <LogOut size={20} />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 md:gap-3">
            <button
              onClick={() => onOpenAuth?.('signin')}
              className="flex items-center gap-2 px-4 py-2.5 backdrop-blur-xl bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 text-white rounded-xl transition-all hover:scale-105 active:scale-95 shadow-lg"
              aria-label="Login"
            >
              <LogIn size={20} />
              <span className="font-medium">Login</span>
            </button>
            <button
              onClick={() => onOpenAuth?.('signup')}
              className="flex items-center gap-2 px-4 py-2.5 backdrop-blur-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 border border-purple-500/30 hover:border-purple-400/50 text-white rounded-xl transition-all hover:scale-105 active:scale-95 shadow-lg"
              aria-label="Sign Up"
            >
              <UserPlus size={20} />
              <span className="font-medium">Sign Up</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="h-full overflow-y-auto">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-12 md:py-20">
          {/* Hero Section */}
          <div className="text-center mb-16 md:mb-20">
            <div className="inline-flex items-center justify-center mb-6">
              <div className="w-32 h-auto md:w-40 lg:w-48 [--fill-0:white]">
                <RockIcon />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4 tracking-tight">
              Stage Lists
            </h1>
            <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto">
              Create, manage, and organize your performance setlists
            </p>
          </div>

          {/* Create New List - Hero CTA */}
          <div className="mb-16 md:mb-20">
            <button
              onClick={handleCreateNew}
              className="group w-full max-w-2xl mx-auto block"
            >
              <div className="relative overflow-hidden backdrop-blur-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-2 border-purple-500/30 hover:border-purple-400/50 rounded-3xl p-8 md:p-12 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-2xl hover:shadow-purple-500/20">
                {/* Animated gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="relative flex flex-col items-center gap-6">
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-xl">
                    <Plus className="w-8 h-8 md:w-10 md:h-10 text-white" strokeWidth={3} />
                  </div>
                  <div className="text-center">
                    <h2 className="text-2xl md:text-4xl font-bold text-white mb-2">
                      Create New Stage List
                    </h2>
                    <p className="text-white/60 text-base md:text-lg">
                      Start fresh with a blank setlist
                    </p>
                  </div>
                </div>
              </div>
            </button>
          </div>

          {/* Loading State */}
          {isLoadingLists && (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-pulse">
                <Music className="w-10 h-10 text-white/30" />
              </div>
              <h3 className="text-2xl font-bold text-white/60 mb-2">Loading your stage lists...</h3>
              <p className="text-white/40">{user ? "Syncing from cloud" : "Loading from device"}</p>
            </div>
          )}

          {/* Saved Lists Grid */}
          {!isLoadingLists && savedLists.length > 0 && (
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 md:mb-8 flex items-center gap-3">
                <span>My Stage Lists</span>
                <span className="text-lg md:text-xl text-white/40 font-normal">
                  ({savedLists.length})
                </span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {savedLists.map((list) => (
                  <div
                    key={list.id}
                    className={`group relative backdrop-blur-xl bg-white/5 hover:bg-white/10 border rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] overflow-hidden ${
                      list.id === currentListId
                        ? "border-purple-500/50 bg-purple-500/10 shadow-lg shadow-purple-500/20"
                        : "border-white/10 hover:border-white/20"
                    }`}
                  >
                    {editingId === list.id ? (
                      <div className="p-6">
                        <input
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          autoFocus
                          className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white text-lg font-semibold outline-none focus:ring-2 focus:ring-purple-500/50 mb-4"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleRename(list.id);
                            if (e.key === "Escape") {
                              setEditingId(null);
                              setEditingName("");
                            }
                          }}
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleRename(list.id)}
                            className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors font-medium"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => {
                              setEditingId(null);
                              setEditingName("");
                            }}
                            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {/* More menu button */}
                        <div className="absolute top-4 right-4">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuId(openMenuId === list.id ? null : list.id);
                            }}
                            className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white/70 hover:text-white rounded-lg transition-colors backdrop-blur-sm"
                            aria-label="More options"
                            title="More"
                          >
                            <MoreVertical size={18} />
                          </button>
                          
                          {/* Dropdown menu */}
                          {openMenuId === list.id && (
                            <>
                              {/* Backdrop to close menu when clicking outside */}
                              <div
                                className="fixed inset-0 z-10"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenMenuId(null);
                                }}
                              />
                              
                              {/* Menu */}
                              <div className="absolute top-12 right-0 z-20 w-48 backdrop-blur-xl bg-slate-900/95 border border-white/20 rounded-xl shadow-2xl overflow-hidden">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onDuplicateList(list);
                                    onClose();
                                    setOpenMenuId(null);
                                  }}
                                  className="w-full px-4 py-3 flex items-center gap-3 text-white/70 hover:text-white hover:bg-white/10 transition-colors text-left"
                                >
                                  <Copy size={18} />
                                  <span>Duplicate</span>
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    startEditing(list.id, list.name);
                                    setOpenMenuId(null);
                                  }}
                                  className="w-full px-4 py-3 flex items-center gap-3 text-white/70 hover:text-white hover:bg-white/10 transition-colors text-left"
                                >
                                  <Edit2 size={18} />
                                  <span>Edit</span>
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (confirm(`Delete "${list.name}"?`)) {
                                      onDeleteList(list.id);
                                    }
                                    setOpenMenuId(null);
                                  }}
                                  className="w-full px-4 py-3 flex items-center gap-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors text-left border-t border-white/10"
                                >
                                  <Trash2 size={18} />
                                  <span>Delete</span>
                                </button>
                              </div>
                            </>
                          )}
                        </div>

                        <button
                          onClick={() => {
                            onLoadList(list);
                            onClose();
                          }}
                          className="w-full p-6 pt-16 text-left"
                        >
                          {/* List Info */}
                          <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">
                            {list.name}
                          </h3>
                          <div className="flex items-center gap-3 text-sm text-white/50 mb-4">
                            <span>{list.songs.length} songs</span>
                            <span>•</span>
                            <span>{new Date(list.updatedAt).toLocaleDateString()}</span>
                          </div>
                        </button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {!isLoadingLists && savedLists.length === 0 && (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Music className="w-10 h-10 text-white/30" />
              </div>
              <h3 className="text-2xl font-bold text-white/60 mb-2">No stage lists yet</h3>
              <p className="text-white/40">Create your first stage list to get started</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}