import { useState, useEffect, useCallback } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { SongRow } from "@/app/components/SongRow";
import { AddSongForm } from "@/app/components/AddSongForm";
import { Footer } from "@/app/components/Footer";
import { ShareModal } from "@/app/components/ShareModal";
import { StageListManager } from "@/app/components/StageListManager";
import { SettingsModal } from "@/app/components/SettingsModal";
import { AuthModal } from "@/app/components/AuthModal";
import { Volume2, VolumeX, Edit2, Check, X, Save, Home, Settings, LogIn, LogOut, User } from "lucide-react";
import { useMetronome, MetronomeSound } from "@/app/hooks/useMetronome";
import RockIcon from "@/imports/RockIcon-48-634";
import { listsAPI, settingsAPI } from "@/app/services/api";
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { authService, supabase } from '@/app/services/supabase';

interface Song {
  id: number;
  number: number;
  title: string;
  bpm: number;
  color: string;
  locked?: boolean;
}

interface SavedStageList {
  id: string;
  name: string;
  songs: Song[];
  nextId: number;
  createdAt: string;
  updatedAt: string;
}

const colorPalette = [
  "from-emerald-400 to-teal-500",
  "from-cyan-400 to-blue-500",
  "from-purple-400 to-pink-500",
  "from-amber-400 to-orange-500",
  "from-rose-400 to-red-500",
  "from-indigo-400 to-purple-500",
  "from-green-400 to-emerald-500",
  "from-pink-400 to-rose-500",
];

const initialSongs: Song[] = [
  { id: 1, number: 1, title: "Get Back", bpm: 120, color: "from-emerald-400 to-teal-500" },
  { id: 2, number: 2, title: "Better Than This", bpm: 128, color: "from-cyan-400 to-blue-500" },
  { id: 3, number: 3, title: "THANK YOU FOR BEING A FRIEND", bpm: 95, color: "from-purple-400 to-pink-500" },
  { id: 4, number: 4, title: "ANNALISE", bpm: 140, color: "from-amber-400 to-orange-500" },
  { id: 5, number: 5, title: "Work HOLIDAY", bpm: 110, color: "from-rose-400 to-red-500" },
];

export default function App() {
  const [currentListId, setCurrentListId] = useState<string>(() => {
    const saved = localStorage.getItem('currentStageListId');
    return saved || 'default';
  });
  
  const [songs, setSongs] = useState<Song[]>(() => {
    // Load from localStorage on initial render
    const saved = localStorage.getItem('stageListSongs');
    return saved ? JSON.parse(saved) : initialSongs;
  });
  const [playingSongs, setPlayingSongs] = useState<Set<number>>(new Set());
  const [volume, setVolume] = useState(0.3);
  const [isMuted, setIsMuted] = useState(false);
  const [metronomeSound, setMetronomeSound] = useState<MetronomeSound>(() => {
    const saved = localStorage.getItem('metronomeSound');
    return (saved as MetronomeSound) || 'click';
  });
  const [nextId, setNextId] = useState(() => {
    const saved = localStorage.getItem('stageListNextId');
    return saved ? JSON.parse(saved) : 6;
  });
  const [pageTitle, setPageTitle] = useState(() => {
    const saved = localStorage.getItem('stageListTitle');
    return saved ? saved : "Stage List";
  });
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(pageTitle);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isListManagerOpen, setIsListManagerOpen] = useState(true); // Changed to true
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(true);
  const [isLoadingFromCloud, setIsLoadingFromCloud] = useState(false); // Changed to false - no loading screen
  const [cloudSyncEnabled, setCloudSyncEnabled] = useState(false); // Start as false until we verify auth
  const [user, setUser] = useState<any | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        console.log('🔍 Checking for existing session...');
        
        const session = await authService.getSession();
        console.log('📋 Session data:', session);
        
        if (session?.user) {
          console.log('✅ Found active session for user:', session.user.email);
          console.log('🔑 Access token length:', session.access_token?.length);
          console.log('⏰ Expires at:', new Date(session.expires_at! * 1000).toLocaleString());
          
          // Decode the JWT to see what's in it
          try {
            const tokenParts = session.access_token!.split('.');
            if (tokenParts.length === 3) {
              const payload = JSON.parse(atob(tokenParts[1]));
              const now = Math.floor(Date.now() / 1000);
              console.log('🔓 Decoded JWT payload:', {
                sub: payload.sub,
                email: payload.email,
                aud: payload.aud,
                iss: payload.iss,
                exp: payload.exp,
                iat: payload.iat,
                expiresAt: new Date(payload.exp * 1000).toISOString(),
                issuedAt: new Date(payload.iat * 1000).toISOString(),
                isExpired: payload.exp < now,
                secondsUntilExpiry: payload.exp - now,
              });
              
              // Check if token is expired
              if (payload.exp < now) {
                console.error('⚠️ TOKEN IS EXPIRED! Attempting to refresh...');
                const { data: { session: refreshedSession }, error } = await supabase.auth.refreshSession();
                if (error) {
                  console.error('❌ Failed to refresh session:', error);
                  setUser(null);
                  setCloudSyncEnabled(false);
                  return;
                }
                if (refreshedSession) {
                  console.log('✅ Session refreshed successfully!');
                  setUser(refreshedSession.user);
                  setCloudSyncEnabled(true);
                  return;
                }
              }
            }
          } catch (decodeError) {
            console.error('Failed to decode JWT:', decodeError);
          }
          
          setUser(session.user);
          setCloudSyncEnabled(true);
        } else {
          console.log('❌ No active session found');
          setUser(null);
          setCloudSyncEnabled(false);
        }
      } catch (error) {
        console.error('❌ Session check error:', error);
        setUser(null);
        setCloudSyncEnabled(false);
      }
    };
    
    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔔 Auth state changed:', event, 'User:', session?.user?.email || 'none');
      setUser(session?.user ?? null);
      setCloudSyncEnabled(!!session?.user);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Auto-save to localStorage whenever songs or title changes
  useEffect(() => {
    localStorage.setItem('stageListSongs', JSON.stringify(songs));
    localStorage.setItem('stageListNextId', JSON.stringify(nextId));
    setIsSaved(true);
  }, [songs, nextId]);

  useEffect(() => {
    localStorage.setItem('stageListTitle', pageTitle);
    setIsSaved(true);
  }, [pageTitle]);

  // Save metronome sound preference
  useEffect(() => {
    localStorage.setItem('metronomeSound', metronomeSound);
  }, [metronomeSound]);

  // Load data from cloud on initial mount
  useEffect(() => {
    const loadFromCloud = async () => {
      // Check if user is authenticated FIRST
      if (!user) {
        setIsLoadingFromCloud(false);
        setCloudSyncEnabled(false);
        return;
      }
      
      try {
        setIsLoadingFromCloud(true);
        
        // Test server health first with a timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
        
        try {
          const healthResponse = await fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-2567dc62/health`,
            {
              headers: {
                'apikey': publicAnonKey,
              },
              signal: controller.signal,
            }
          );
          clearTimeout(timeoutId);
          
          if (!healthResponse.ok) {
            throw new Error('Server health check returned ' + healthResponse.status);
          }
          
          console.log('✅ Server is online and healthy');
        } catch (healthError) {
          clearTimeout(timeoutId);
          console.log('💡 Cloud sync is not available yet');
          console.log('📱 Your data is safely stored locally on this device');
          console.log('🔄 Cloud sync will activate automatically once the server is deployed');
          setIsLoadingFromCloud(false);
          setCloudSyncEnabled(false);
          return; // Exit early - use localStorage only
        }
        
        console.log('☁️ Loading from cloud...');
        
        // Load lists from cloud
        const cloudLists = await listsAPI.getAll();
        console.log('📋 Cloud lists loaded:', cloudLists.length);
        
        // Load settings from cloud
        const cloudSettings = await settingsAPI.get();
        console.log('⚙️ Cloud settings loaded');
        
        // Migrate localStorage data to cloud if cloud is empty
        const localListsJson = localStorage.getItem('stageLists');
        const localLists: SavedStageList[] = localListsJson ? JSON.parse(localListsJson) : [];
        
        if (cloudLists.length === 0 && localLists.length > 0) {
          console.log('📤 Migrating local data to cloud...');
          for (const list of localLists) {
            await listsAPI.create(list);
          }
          // Upload settings too
          const localSound = localStorage.getItem('metronomeSound') || 'click';
          await settingsAPI.update({ 
            metronomeSound: localSound,
            metronomeVolume: volume 
          });
          console.log('✅ Migration complete');
        } else if (cloudLists.length > 0) {
          console.log('📥 Using cloud data...');
          localStorage.setItem('stageLists', JSON.stringify(cloudLists));
          
          // Load current list
          const currentId = localStorage.getItem('currentStageListId');
          const currentList = cloudLists.find(list => list.id === currentId) || cloudLists[0];
          
          if (currentList) {
            setSongs(currentList.songs);
            setNextId(currentList.nextId);
            setPageTitle(currentList.name);
            setCurrentListId(currentList.id);
          }
          
          // Load settings
          setMetronomeSound(cloudSettings.metronomeSound as MetronomeSound);
          setVolume(cloudSettings.metronomeVolume);
        }
        
        setIsLoadingFromCloud(false);
        setCloudSyncEnabled(true);
        console.log('✅ Cloud sync enabled');
      } catch (error) {
        console.log('💾 Using local storage only');
        setIsLoadingFromCloud(false);
        setCloudSyncEnabled(false);
      }
    };
    
    loadFromCloud();
  }, [user]); // Run when user changes

  // Sync to cloud whenever data changes (debounced)
  useEffect(() => {
    if (isLoadingFromCloud || !cloudSyncEnabled || !user) return;
    
    const syncToCloud = async () => {
      try {
        setIsSaved(false);
        
        // Update or create current list in cloud
        if (currentListId) {
          const currentList: SavedStageList = {
            id: currentListId,
            name: pageTitle,
            songs,
            nextId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          
          // Try to update, if it fails, create new
          try {
            await listsAPI.update(currentListId, {
              name: pageTitle,
              songs,
              nextId,
              updatedAt: new Date().toISOString(),
            });
          } catch (error) {
            // List doesn't exist, create it
            await listsAPI.create(currentList);
          }
        }
        
        setIsSaved(true);
      } catch (error) {
        console.error('Failed to sync to cloud:', error);
        setIsSaved(true); // Don't block the UI
      }
    };
    
    // Debounce the sync to avoid too many requests
    const timeoutId = setTimeout(syncToCloud, 1000);
    return () => clearTimeout(timeoutId);
  }, [songs, pageTitle, nextId, currentListId, isLoadingFromCloud, cloudSyncEnabled, user]);

  // Sync settings to cloud
  useEffect(() => {
    if (isLoadingFromCloud || !cloudSyncEnabled || !user) return;
    
    const syncSettings = async () => {
      try {
        await settingsAPI.update({
          metronomeSound,
          metronomeVolume: volume,
        });
      } catch (error) {
        console.error('Failed to sync settings to cloud:', error);
      }
    };
    
    const timeoutId = setTimeout(syncSettings, 1000);
    return () => clearTimeout(timeoutId);
  }, [metronomeSound, volume, isLoadingFromCloud, cloudSyncEnabled, user]);

  const toggleSong = (id: number) => {
    setPlayingSongs((prev) => {
      const newSet = new Set<number>();
      // If the song is currently playing, stop it
      // Otherwise, stop all songs and play only this one
      if (!prev.has(id)) {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const addSong = (title: string, bpm: number) => {
    const newSong: Song = {
      id: nextId,
      number: songs.length + 1,
      title,
      bpm,
      color: colorPalette[songs.length % colorPalette.length],
    };
    setSongs([...songs, newSong]);
    setNextId(nextId + 1);
  };

  const editSong = (id: number, title: string, bpm: number) => {
    setSongs(songs.map(song => 
      song.id === id ? { ...song, title, bpm } : song
    ));
  };

  const deleteSong = (id: number) => {
    // Stop playing if it's currently playing
    setPlayingSongs((prev) => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
    
    // Remove song and renumber
    const filteredSongs = songs.filter(song => song.id !== id);
    const renumberedSongs = filteredSongs.map((song, index) => ({
      ...song,
      number: index + 1,
    }));
    setSongs(renumberedSongs);
  };

  const moveSong = useCallback((dragIndex: number, hoverIndex: number) => {
    const dragSong = songs[dragIndex];
    const newSongs = [...songs];
    newSongs.splice(dragIndex, 1);
    newSongs.splice(hoverIndex, 0, dragSong);
    
    // Renumber songs
    const renumberedSongs = newSongs.map((song, index) => ({
      ...song,
      number: index + 1,
    }));
    
    setSongs(renumberedSongs);
  }, [songs]);

  const toggleLock = useCallback((id: number) => {
    setSongs(songs.map(song => 
      song.id === id ? { ...song, locked: !song.locked } : song
    ));
  }, [songs]);

  // Get the currently playing song's BPM
  const playingSongId = Array.from(playingSongs)[0];
  const playingSong = songs.find(song => song.id === playingSongId);
  const currentBpm = playingSong?.bpm || 120;
  const isPlaying = playingSongs.size > 0;

  // Single metronome for the currently playing song
  // Always call the hook, but only play when not loading
  useMetronome(currentBpm, isPlaying && !isLoadingFromCloud, volume, isMuted, metronomeSound);

  // Initialize first list save
  useEffect(() => {
    const savedLists = localStorage.getItem('stageLists');
    if (!savedLists) {
      // First time user - save current list as "my first Stage List"
      const firstList: SavedStageList = {
        id: 'default',
        name: 'my first Stage List',
        songs: songs,
        nextId: nextId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem('stageLists', JSON.stringify([firstList]));
      localStorage.setItem('currentStageListId', 'default');
    }
  }, []);

  // Stage List Management Functions
  const handleSaveCurrentAs = async (name: string) => {
    const savedListsJson = localStorage.getItem('stageLists');
    const savedLists: SavedStageList[] = savedListsJson ? JSON.parse(savedListsJson) : [];
    
    const newId = `list_${Date.now()}`;
    const newList: SavedStageList = {
      id: newId,
      name,
      songs,
      nextId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // Save to cloud if authenticated
    if (cloudSyncEnabled && user) {
      try {
        await listsAPI.create(newList);
      } catch (error) {
        console.error('Failed to save list to cloud:', error);
      }
    }
    
    const updatedLists = [...savedLists, newList];
    localStorage.setItem('stageLists', JSON.stringify(updatedLists));
    setCurrentListId(newId);
    localStorage.setItem('currentStageListId', newId);
    setPageTitle(name);
  };

  const handleLoadList = (list: SavedStageList) => {
    setSongs(list.songs);
    setNextId(list.nextId);
    setPageTitle(list.name);
    setCurrentListId(list.id);
    localStorage.setItem('currentStageListId', list.id);
    setPlayingSongs(new Set()); // Stop any playing songs
  };

  const handleRenameList = async (id: string, newName: string) => {
    const savedListsJson = localStorage.getItem('stageLists');
    const savedLists: SavedStageList[] = savedListsJson ? JSON.parse(savedListsJson) : [];
    
    const updatedLists = savedLists.map(list => 
      list.id === id 
        ? { ...list, name: newName, updatedAt: new Date().toISOString() }
        : list
    );
    
    // Update in cloud if authenticated
    if (cloudSyncEnabled && user) {
      try {
        await listsAPI.update(id, {
          name: newName,
          updatedAt: new Date().toISOString(),
        });
      } catch (error) {
        console.error('Failed to rename list in cloud:', error);
      }
    }
    
    localStorage.setItem('stageLists', JSON.stringify(updatedLists));
    
    // If renaming current list, update page title
    if (id === currentListId) {
      setPageTitle(newName);
    }
  };

  const handleDeleteList = (id: string) => {
    const savedListsJson = localStorage.getItem('stageLists');
    const savedLists: SavedStageList[] = savedListsJson ? JSON.parse(savedListsJson) : [];
    
    const updatedLists = savedLists.filter(list => list.id !== id);
    localStorage.setItem('stageLists', JSON.stringify(updatedLists));
    
    // Delete from cloud
    if (cloudSyncEnabled) {
      listsAPI.delete(id).catch(err => console.error('Failed to delete list from cloud:', err));
    }
    
    // If deleting current list, load the first available list or create new
    if (id === currentListId) {
      if (updatedLists.length > 0) {
        handleLoadList(updatedLists[0]);
      } else {
        handleCreateNewList();
      }
    }
  };

  const handleCreateNewList = () => {
    setSongs([]);
    setNextId(1);
    setPageTitle('New Stage List');
    const newId = `list_${Date.now()}`;
    setCurrentListId(newId);
    localStorage.setItem('currentStageListId', newId);
    setPlayingSongs(new Set());
  };

  const handleDuplicateList = async (list: SavedStageList) => {
    const savedListsJson = localStorage.getItem('stageLists');
    const savedLists: SavedStageList[] = savedListsJson ? JSON.parse(savedListsJson) : [];
    
    const newId = `list_${Date.now()}`;
    const duplicatedList: SavedStageList = {
      ...list,
      id: newId,
      name: `${list.name} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // Save to cloud if authenticated
    if (cloudSyncEnabled && user) {
      try {
        await listsAPI.create(duplicatedList);
      } catch (error) {
        console.error('Failed to duplicate list in cloud:', error);
      }
    }
    
    const updatedLists = [...savedLists, duplicatedList];
    localStorage.setItem('stageLists', JSON.stringify(updatedLists));
    
    // Load the duplicated list
    handleLoadList(duplicatedList);
  };

  // Update current list whenever changes are made
  useEffect(() => {
    if (currentListId) {
      const savedListsJson = localStorage.getItem('stageLists');
      const savedLists: SavedStageList[] = savedListsJson ? JSON.parse(savedListsJson) : [];
      
      const updatedLists = savedLists.map(list =>
        list.id === currentListId
          ? { ...list, name: pageTitle, songs, nextId, updatedAt: new Date().toISOString() }
          : list
      );
      
      // If current list doesn't exist in saved lists, add it
      if (!savedLists.find(list => list.id === currentListId)) {
        const newList: SavedStageList = {
          id: currentListId,
          name: pageTitle,
          songs,
          nextId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        updatedLists.push(newList);
      }
      
      localStorage.setItem('stageLists', JSON.stringify(updatedLists));
    }
  }, [songs, pageTitle, nextId, currentListId]);

  const handleShare = async () => {
    const shareData = {
      title: pageTitle,
      text: `Check out my ${pageTitle} with ${songs.length} songs!`,
      url: window.location.href,
    };

    try {
      // Try native share API first (works on mobile)
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: copy URL to clipboard
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      }
    } catch (err) {
      // User cancelled or error occurred
      console.log('Share cancelled or failed:', err);
    }
  };

  const handleAuthSuccess = async () => {
    console.log('🎉 Auth success callback triggered');
    try {
      // Force refresh the session
      const { data: { session }, error } = await supabase.auth.getSession();
      console.log('🔄 Refreshed session after auth:', session ? 'Found' : 'Not found');
      
      if (error) {
        console.error('❌ Error refreshing session:', error);
      }
      
      if (session?.user) {
        console.log('✅ Setting user from refreshed session:', session.user.email);
        setUser(session.user);
        setCloudSyncEnabled(true);
        
        // Reload the app to ensure everything syncs properly
        console.log('🔄 Reloading page to complete login...');
        window.location.reload();
      } else {
        console.warn('⚠️ No session found after auth success');
      }
    } catch (err) {
      console.error('❌ Exception in handleAuthSuccess:', err);
    }
  };

  const handleLogout = async () => {
    try {
      await authService.signOut();
      setUser(null);
      setCloudSyncEnabled(false);
      window.location.reload();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="leading-[normal] not-italic min-h-full flex flex-col bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {/* Navigation Bar */}
        <nav className="sticky top-0 z-50 backdrop-blur-md bg-slate-900/80 border-b border-white/10">
          <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-10 xl:px-12 py-3 md:py-4 flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-14 h-auto md:w-16 lg:w-20 [--fill-0:white]">
                <RockIcon />
              </div>
              <span className="text-lg md:text-xl font-bold text-white hidden sm:block">Stage List</span>
            </div>
            
            {/* Navigation Links */}
            <div className="flex items-center gap-2 md:gap-3">
              <button
                onClick={() => setIsListManagerOpen(true)}
                className="flex items-center gap-2 px-3 py-2 md:px-4 md:py-2.5 text-white/70 hover:text-white hover:bg-white/10 active:bg-white/20 rounded-lg transition-colors"
                aria-label="Go home"
              >
                <Home size={20} />
                <span className="hidden sm:inline">Home</span>
              </button>
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="flex items-center gap-2 px-3 py-2 md:px-4 md:py-2.5 text-white/70 hover:text-white hover:bg-white/10 active:bg-white/20 rounded-lg transition-colors"
                aria-label="Settings"
              >
                <Settings size={20} />
                <span className="hidden sm:inline">Settings</span>
              </button>
              {user ? (
                <div className="flex items-center gap-2">
                  {/* User Profile Badge */}
                  <div className="flex items-center gap-2 px-3 py-2 md:px-4 md:py-2.5 bg-green-500/20 border border-green-500/30 rounded-lg">
                    <User size={18} className="text-green-400" />
                    <span className="hidden md:inline text-sm font-medium text-green-300">
                      {user.email}
                    </span>
                    <span className="inline md:hidden text-xs font-bold text-green-300">
                      ●
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-3 py-2 md:px-4 md:py-2.5 text-white/70 hover:text-white hover:bg-white/10 active:bg-white/20 rounded-lg transition-colors"
                    aria-label="Logout"
                  >
                    <LogOut size={20} />
                    <span className="hidden sm:inline">Logout</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="flex items-center gap-2 px-3 py-2 md:px-4 md:py-2.5 text-white/70 hover:text-white hover:bg-white/10 active:bg-white/20 rounded-lg transition-colors"
                  aria-label="Login"
                >
                  <LogIn size={20} />
                  <span className="hidden sm:inline">Login</span>
                </button>
              )}
            </div>
          </div>
        </nav>

        <div className="p-4 md:p-6 lg:p-10 xl:p-12 flex flex-col flex-1">
          <div className="max-w-[1400px] w-full mx-auto flex flex-col gap-6 md:gap-8 flex-1">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  {isEditingTitle ? (
                    <>
                      <input
                        type="text"
                        value={tempTitle}
                        onChange={(e) => setTempTitle(e.target.value)}
                        autoFocus
                        className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight 
                          bg-white/5 border border-white/30 rounded-lg px-3 py-1 outline-none focus:ring-2 focus:ring-white/40"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            if (tempTitle.trim()) {
                              setPageTitle(tempTitle.trim());
                            }
                            setIsEditingTitle(false);
                          }}
                          className="p-2 bg-white/20 hover:bg-white/30 active:bg-white/40 text-white rounded-lg transition-colors"
                          aria-label="Save title"
                        >
                          <Check size={20} />
                        </button>
                        <button
                          onClick={() => {
                            setTempTitle(pageTitle);
                            setIsEditingTitle(false);
                          }}
                          className="p-2 bg-white/10 hover:bg-white/20 active:bg-white/30 text-white/70 rounded-lg transition-colors"
                          aria-label="Cancel edit"
                        >
                          <X size={20} />
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight">
                        {pageTitle}
                      </h1>
                      <button
                        onClick={() => {
                          setIsEditingTitle(true);
                          setTempTitle(pageTitle);
                        }}
                        className="p-2 text-white/50 hover:text-white/80 active:text-white transition-colors hover:bg-white/10 rounded-lg"
                        aria-label="Edit title"
                      >
                        <Edit2 size={20} className="sm:hidden" />
                        <Edit2 size={24} className="hidden sm:block" />
                      </button>
                    </>
                  )}
                </div>

                {/* Save Indicator */}
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all w-fit ${
                  isSaved 
                    ? 'bg-green-500/90 text-white shadow-lg shadow-green-500/30' 
                    : 'bg-yellow-500/90 text-white shadow-lg shadow-yellow-500/30 animate-pulse'
                }`}>
                  <Save size={14} />
                  <span>
                    {isSaved ? 'Saved' : 'Saving...'}
                  </span>
                  {user && isSaved && (
                    <span className="text-[10px]">
                      ☁️
                    </span>
                  )}
                </div>
              </div>
              
              {/* Audio Controls */}
              <div className="w-full sm:w-auto flex items-center gap-3 md:gap-4 backdrop-blur-sm bg-white/10 border border-white/20 rounded-xl px-3 md:px-4 py-2.5 md:py-3">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="text-white active:text-white/70 transition-colors p-1.5 active:bg-white/10 rounded-lg"
                  aria-label={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>
                
                <div className="flex items-center gap-2 md:gap-3 flex-1 sm:flex-initial">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="flex-1 sm:w-24 md:w-32 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer
                      [&::-webkit-slider-thumb]:appearance-none
                      [&::-webkit-slider-thumb]:w-4
                      [&::-webkit-slider-thumb]:h-4
                      [&::-webkit-slider-thumb]:rounded-full
                      [&::-webkit-slider-thumb]:bg-white
                      [&::-webkit-slider-thumb]:cursor-pointer
                      [&::-moz-range-thumb]:w-4
                      [&::-moz-range-thumb]:h-4
                      [&::-moz-range-thumb]:rounded-full
                      [&::-moz-range-thumb]:bg-white
                      [&::-moz-range-thumb]:border-0
                      [&::-moz-range-thumb]:cursor-pointer"
                  />
                  <span className="text-white/60 text-sm font-medium min-w-[3ch]">
                    {Math.round(volume * 100)}
                  </span>
                </div>

                <div className="text-sm text-white/60 font-medium pl-2 md:pl-3 border-l border-white/20 whitespace-nowrap">
                  <span className="hidden sm:inline">{playingSongs.size} playing</span>
                  <span className="sm:hidden">{playingSongs.size}</span>
                </div>
              </div>
            </div>

            {/* Header Row - Hidden on mobile */}
            {songs.length > 0 && (
              <div className="hidden md:grid grid-cols-[40px_80px_1fr_100px_120px] gap-4 px-6 text-sm font-semibold text-white/50 uppercase tracking-wider">
                <div></div>
                <div className="pl-0">Track</div>
                <div className="pl-0">Title</div>
                <div className="text-right pr-0">Tempo</div>
                <div className="text-right pr-0">Actions</div>
              </div>
            )}

            {/* Song Rows */}
            <div className="flex flex-col gap-3 md:gap-4 flex-1">
              {songs.map((song, index) => (
                <SongRow
                  key={song.id}
                  id={song.id}
                  index={index}
                  number={song.number}
                  title={song.title}
                  bpm={song.bpm}
                  color={song.color}
                  isPlaying={playingSongs.has(song.id)}
                  isLocked={song.locked || false}
                  onClick={() => toggleSong(song.id)}
                  onEdit={(title, bpm) => editSong(song.id, title, bpm)}
                  onDelete={() => deleteSong(song.id)}
                  onMove={moveSong}
                  onToggleLock={() => toggleLock(song.id)}
                />
              ))}
              
              {/* Add Song Form */}
              <AddSongForm onAddSong={addSong} />
            </div>
          </div>
          <Footer onShare={() => setIsShareModalOpen(true)} />
        </div>
        
        {/* Modals - Always rendered, controlled by isOpen props */}
        <ShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          title={pageTitle}
          songCount={songs.length}
        />
        <StageListManager
          isOpen={isListManagerOpen}
          onClose={() => setIsListManagerOpen(false)}
          currentListId={currentListId}
          currentListName={pageTitle}
          currentSongs={songs}
          currentNextId={nextId}
          onLoadList={handleLoadList}
          onSaveCurrentAs={handleSaveCurrentAs}
          onRenameList={handleRenameList}
          onDeleteList={handleDeleteList}
          onCreateNewList={handleCreateNewList}
          onDuplicateList={handleDuplicateList}
          user={user}
          onOpenAuth={(mode) => {
            setAuthModalMode(mode);
            setIsAuthModalOpen(true);
          }}
          onLogout={handleLogout}
        />
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          volume={volume}
          isMuted={isMuted}
          onVolumeChange={setVolume}
          onMuteToggle={() => setIsMuted(!isMuted)}
          metronomeSound={metronomeSound}
          onMetronomeSoundChange={setMetronomeSound}
        />
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onSuccess={handleAuthSuccess}
          initialMode={authModalMode}
        />
      </div>
    </DndProvider>
  );
}