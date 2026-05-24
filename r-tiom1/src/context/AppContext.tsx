import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Beat, User, CartItem, LicenseType, LicenseOption, Purchase } from '../types';
import { INITIAL_BEATS, LICENSE_INFO } from '../data';
import { resolveUrl } from '../utils/db';

interface AppContextType {
  beats: Beat[];
  user: User | null;
  cart: CartItem[];
  currentBeat: Beat | null;
  isPlaying: boolean;
  volume: number;
  duration: number;
  currentTime: number;
  searchQuery: string;
  selectedGenre: string;
  minBpm: number;
  maxBpm: number;
  purchasedTrackUrls: Record<string, string>; // Maps beatId -> active downloadable URL
  setSearchQuery: (q: string) => void;
  setSelectedGenre: (g: string) => void;
  setBpmFilter: (min: number, max: number) => void;
  addToCart: (beat: Beat, licenseType: LicenseType) => void;
  removeFromCart: (cartItemId: string) => void;
  clearCart: () => void;
  selectBeat: (beat: Beat) => void;
  togglePlay: () => void;
  setVolumeState: (vol: number) => void;
  setAudioCurrentTime: (time: number) => void;
  login: (email: string, pass: string) => { success: boolean; error?: string };
  register: (email: string, pass: string, name: string, role: 'admin' | 'buyer') => { success: boolean; error?: string };
  logout: () => void;
  addBeat: (beat: Omit<Beat, 'plays' | 'createdAt' | 'isSoldExclusive'> & { id?: string }) => void;
  updateBeat: (id: string, beat: Partial<Beat>) => void;
  deleteBeat: (id: string) => void;
  checkout: () => void;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  incrementPlayCount: (beatId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Store beats
  const [beats, setBeats] = useState<Beat[]>(() => {
    const saved = localStorage.getItem('r_tiom_beats');
    return saved ? JSON.parse(saved) : INITIAL_BEATS;
  });

  // Store users
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('r_tiom_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Store cart objects
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('r_tiom_cart');
    return saved ? JSON.parse(saved) : [];
  });

  // Audio Playback
  const [currentBeat, setCurrentBeat] = useState<Beat | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(() => {
    const saved = localStorage.getItem('r_tiom_volume');
    return saved ? parseFloat(saved) : 0.8;
  });
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  // Audio Ref
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Search & Filtering
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [minBpm, setMinBpm] = useState(60);
  const [maxBpm, setMaxBpm] = useState(180);

  // Local purchased list (fallback downloads dictionary mapping beatId -> streamable link)
  const [purchasedTrackUrls, setPurchasedTrackUrls] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('r_tiom_downloads');
    return saved ? JSON.parse(saved) : {};
  });

  // Initialize hardcoded accounts database if none exists
  useEffect(() => {
    const existingUsers = localStorage.getItem('r_tiom_users');
    if (!existingUsers) {
      const defaultUsers = [
        {
          id: 'admin_1',
          email: 'admin@rtiom.com',
          name: 'Artem (R-Tiom)',
          password: 'admin123', // Demo purposes (simple offline project)
          role: 'admin',
          purchasedBeats: []
        },
        {
          id: 'buyer_1',
          email: 'buyer@rtiom.com',
          name: 'Collab Artist',
          password: 'buyer123',
          role: 'buyer',
          purchasedBeats: ['b4']
        }
      ];
      localStorage.setItem('r_tiom_users', JSON.stringify(defaultUsers));
    }
  }, []);

  // Save beats to local storage
  useEffect(() => {
    localStorage.setItem('r_tiom_beats', JSON.stringify(beats));
  }, [beats]);

  // Save user info
  useEffect(() => {
    if (user) {
      localStorage.setItem('r_tiom_current_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('r_tiom_current_user');
    }
  }, [user]);

  // Save cart
  useEffect(() => {
    localStorage.setItem('r_tiom_cart', JSON.stringify(cart));
  }, [cart]);

  // Save downloads
  useEffect(() => {
    localStorage.setItem('r_tiom_downloads', JSON.stringify(purchasedTrackUrls));
  }, [purchasedTrackUrls]);

  // Sync volume level
  useEffect(() => {
    localStorage.setItem('r_tiom_volume', volume.toString());
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Audio lifecycle handler
  const [resolvedAudioUrl, setResolvedAudioUrl] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    if (!currentBeat) {
      setResolvedAudioUrl(null);
      return;
    }

    resolveUrl(currentBeat.audioUrl).then((url) => {
      if (active) {
        setResolvedAudioUrl(url);
      }
    });

    return () => {
      active = false;
    };
  }, [currentBeat]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying && resolvedAudioUrl) {
      audio.play().catch((err) => {
        console.warn('Audio play request interrupted:', err);
      });
    } else {
      audio.pause();
    }
  }, [isPlaying, resolvedAudioUrl]);

  const setVolumeState = (vol: number) => {
    setVolume(Math.max(0, Math.min(1, vol)));
  };

  const setAudioCurrentTime = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const getBpmFilter = () => [minBpm, maxBpm];
  const setBpmFilter = (min: number, max: number) => {
    setMinBpm(min);
    setMaxBpm(max);
  };

  const addToCart = (beat: Beat, licenseType: LicenseType) => {
    const itemPrice = beat.prices[licenseType];
    const cartItemId = `${beat.id}-${licenseType}`;

    // If already in cart, avoid double add
    const exists = cart.some(item => item.id === cartItemId);
    if (exists) return;

    const newCartItem: CartItem = {
      id: cartItemId,
      beat,
      licenseType,
      price: itemPrice
    };

    setCart(prev => [...prev, newCartItem]);
  };

  const removeFromCart = (cartItemId: string) => {
    setCart(prev => prev.filter(item => item.id !== cartItemId));
  };

  const clearCart = () => setCart([]);

  const selectBeat = (beat: Beat) => {
    if (currentBeat?.id === beat.id) {
      togglePlay();
    } else {
      setCurrentBeat(beat);
      setIsPlaying(true);
      incrementPlayCount(beat.id);
    }
  };

  const togglePlay = () => {
    if (!currentBeat && beats.length > 0) {
      setCurrentBeat(beats[0]);
    }
    setIsPlaying(prev => !prev);
  };

  const incrementPlayCount = (beatId: string) => {
    setBeats(prevBeats =>
      prevBeats.map(b => b.id === beatId ? { ...b, plays: b.plays + 1 } : b)
    );
  };

  // Auth Operations
  const login = (email: string, pass: string) => {
    const usersRaw = localStorage.getItem('r_tiom_users');
    if (!usersRaw) return { success: false, error: 'Database initializing. Try again.' };

    const users = JSON.parse(usersRaw);
    const foundUser = users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());

    if (!foundUser) {
      return { success: false, error: 'Пользователь не найден' };
    }

    if (foundUser.password !== pass) {
      return { success: false, error: 'Неверный пароль' };
    }

    const matchedUser: User = {
      id: foundUser.id,
      email: foundUser.email,
      name: foundUser.name,
      role: foundUser.role as 'admin' | 'buyer',
      purchasedBeats: foundUser.purchasedBeats || []
    };

    setUser(matchedUser);
    return { success: true };
  };

  const register = (email: string, pass: string, name: string, role: 'admin' | 'buyer') => {
    const usersRaw = localStorage.getItem('r_tiom_users') || '[]';
    const users = JSON.parse(usersRaw);

    const exists = users.some((u: any) => u.email.toLowerCase() === email.toLowerCase());
    if (exists) {
      return { success: false, error: 'Email уже зарегистрирован' };
    }

    const newUserRecord = {
      id: 'usr_' + Date.now().toString(),
      email: email,
      name: name,
      password: pass,
      role: role,
      purchasedBeats: []
    };

    users.push(newUserRecord);
    localStorage.setItem('r_tiom_users', JSON.stringify(users));

    const matchedUser: User = {
      id: newUserRecord.id,
      email: newUserRecord.email,
      name: newUserRecord.name,
      role: newUserRecord.role as 'admin' | 'buyer',
      purchasedBeats: []
    };

    setUser(matchedUser);
    return { success: true };
  };

  const logout = () => {
    setUser(null);
  };

  // Beat management panel (Admin CRUD)
  const addBeat = (beatData: Omit<Beat, 'plays' | 'createdAt' | 'isSoldExclusive'> & { id?: string }) => {
    const newBeat: Beat = {
      plays: 0,
      isSoldExclusive: false,
      createdAt: new Date().toISOString(),
      ...beatData,
      id: beatData.id || 'beat_' + Date.now().toString()
    };
    setBeats(prev => [newBeat, ...prev]);
  };

  const updateBeat = (id: string, updatedFields: Partial<Beat>) => {
    setBeats(prev => prev.map(b => b.id === id ? { ...b, ...updatedFields } as Beat : b));
  };

  const deleteBeat = (id: string) => {
    setBeats(prev => prev.filter(b => b.id !== id));
    if (currentBeat?.id === id) {
      setCurrentBeat(null);
      setIsPlaying(false);
    }
  };

  const checkout = () => {
    if (!user) return;

    // Simulate purchasing
    const purchasedIds = cart.map(item => item.beat.id);
    
    // Check if any exclusive is purchased
    const exclusivePurchasedIds = cart
      .filter(item => item.licenseType === 'exclusive')
      .map(item => item.beat.id);

    // Update beats to reflect sold state
    if (exclusivePurchasedIds.length > 0) {
      setBeats(prev =>
        prev.map(b =>
          exclusivePurchasedIds.includes(b.id) ? { ...b, isSoldExclusive: true } : b
        )
      );
    }

    // Update current user list of owned beats
    const updatedUser: User = {
      ...user,
      purchasedBeats: [...new Set([...user.purchasedBeats, ...purchasedIds])]
    };
    setUser(updatedUser);

    // Update core database record
    const usersRaw = localStorage.getItem('r_tiom_users') || '[]';
    const users = JSON.parse(usersRaw);
    const updatedUsers = users.map((u: any) => {
      if (u.id === user.id) {
        return { ...u, purchasedBeats: updatedUser.purchasedBeats };
      }
      return u;
    });
    localStorage.setItem('r_tiom_users', JSON.stringify(updatedUsers));

    // Save download file URLs mock
    const newDownloads = { ...purchasedTrackUrls };
    cart.forEach(item => {
      // Simulate file delivery url
      newDownloads[item.beat.id] = item.beat.audioUrl;
    });
    setPurchasedTrackUrls(newDownloads);

    // Clear cart
    clearCart();
  };

  return (
    <AppContext.Provider
      value={{
        beats,
        user,
        cart,
        currentBeat,
        isPlaying,
        volume,
        duration,
        currentTime,
        searchQuery,
        selectedGenre,
        minBpm,
        maxBpm,
        purchasedTrackUrls,
        setSearchQuery,
        setSelectedGenre,
        setBpmFilter,
        addToCart,
        removeFromCart,
        clearCart,
        selectBeat,
        togglePlay,
        setVolumeState,
        setAudioCurrentTime,
        login,
        register,
        logout,
        addBeat,
        updateBeat,
        deleteBeat,
        checkout,
        audioRef,
        incrementPlayCount
      }}
    >
      {children}
      <audio
        id="app-bg-audio"
        ref={audioRef}
        src={resolvedAudioUrl || null}
        onTimeUpdate={() => {
          if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
          }
        }}
        onDurationChange={() => {
          if (audioRef.current) {
            setDuration(audioRef.current.duration || 0);
          }
        }}
        onEnded={() => {
          setIsPlaying(false);
          setCurrentTime(0);
        }}
      />
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used inside AppProvider');
  return context;
};
