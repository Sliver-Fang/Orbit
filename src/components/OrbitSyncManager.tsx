import React, { useState, useEffect, useRef } from "react";
import { Palette } from "../types";
import { playSoundWave } from "../utils/data";
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Copy, 
  Check, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  PlusCircle, 
  Info,
  HelpCircle
} from "lucide-react";

interface OrbitSyncManagerProps {
  palette: Palette;
  isDark: boolean;
  
  // App tracker states
  habits: any[];
  setHabits: React.Dispatch<React.SetStateAction<any[]>>;
  tasks: any[];
  setTasks: React.Dispatch<React.SetStateAction<any[]>>;
  avoidItems: any[];
  setAvoidItems: React.Dispatch<React.SetStateAction<any[]>>;
  sleepLogs: any[];
  setSleepLogs: React.Dispatch<React.SetStateAction<any[]>>;
  customQuotes: any[];
  setCustomQuotes: React.Dispatch<React.SetStateAction<any[]>>;
  selectedPaletteId: string;
  setSelectedPaletteId: (id: string) => void;
  setIsDark: (dark: boolean) => void;
}

export default function OrbitSyncManager({
  palette,
  isDark,
  habits,
  setHabits,
  tasks,
  setTasks,
  avoidItems,
  setAvoidItems,
  sleepLogs,
  setSleepLogs,
  customQuotes,
  setCustomQuotes,
  selectedPaletteId,
  setSelectedPaletteId,
  setIsDark
}: OrbitSyncManagerProps) {
  const [syncCode, setSyncCode] = useState(() => {
    return localStorage.getItem("orbit_sync_code") || "";
  });
  const [isAutoSync, setIsAutoSync] = useState(() => {
    return localStorage.getItem("orbit_sync_auto") === "true";
  });
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState("");
  const [lastSyncedTime, setLastSyncedTime] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  // Keep a ref of current states to avoid dependency cycle in autosync pushes
  const stateRef = useRef({
    habits,
    tasks,
    avoidItems,
    sleepLogs,
    customQuotes,
    selectedPaletteId,
    isDark
  });

  useEffect(() => {
    stateRef.current = {
      habits,
      tasks,
      avoidItems,
      sleepLogs,
      customQuotes,
      selectedPaletteId,
      isDark
    };
  }, [habits, tasks, avoidItems, sleepLogs, customQuotes, selectedPaletteId, isDark]);

  // Unique timestamp of local state updates
  const [localChangeTimestamp, setLocalChangeTimestamp] = useState<number>(Date.now());

  // Track if state has been modified after initial mount
  const isInitialMount = useRef(true);

  // Trigger local state update timestamp when tracking vectors mutate
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    setLocalChangeTimestamp(Date.now());
  }, [habits, tasks, avoidItems, sleepLogs, customQuotes]);

  // Handle automatic debounced push when local storage moves
  useEffect(() => {
    if (!syncCode || !isAutoSync) return;

    const delayHandler = setTimeout(() => {
      // Perform auto-upload push
      pushStateToCloud(true);
    }, 2000); // 2 second debounce

    return () => clearTimeout(delayHandler);
  }, [localChangeTimestamp, isAutoSync, syncCode]);

  // Periodic polling listener for cross-device updates
  useEffect(() => {
    if (!syncCode || !isAutoSync) return;

    const pollInterval = setInterval(() => {
      pullStateFromCloud(true); // silent background fetch
    }, 6000); // Poll every 6 seconds for changes

    return () => clearInterval(pollInterval);
  }, [syncCode, isAutoSync]);

  // Save sync configuration on modification
  const handleUpdateSyncCode = (code: string) => {
    const cleanStr = code.trim().replace(/[^a-zA-Z0-9-]/g, "");
    setSyncCode(cleanStr);
    localStorage.setItem("orbit_sync_code", cleanStr);
  };

  const handleToggleAutoSync = () => {
    const newVal = !isAutoSync;
    setIsAutoSync(newVal);
    localStorage.setItem("orbit_sync_auto", String(newVal));
    playSoundWave("click");
  };

  const handleGenerateCode = () => {
    playSoundWave("click");
    const segments = [];
    for (let i = 0; i < 3; i++) {
      segments.push(Math.random().toString(36).substring(2, 6).toUpperCase());
    }
    const generated = `ORBIT-${segments.join("-")}`;
    handleUpdateSyncCode(generated);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(syncCode);
    setCopied(true);
    playSoundWave("click");
    setTimeout(() => setCopied(false), 2000);
  };

  // Helper: Format Date nicely
  const getFormattedTime = () => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  // SMART MERGE FUNCTION — COMBINES LOCAL AND REMOTE RECORDS
  const mergeStates = (local: any, remote: any) => {
    // 1. Merging Habits (Union of completion dates by ID)
    const habitMap = new Map();
    (local.habits || []).forEach((h: any) => habitMap.set(h.id, { ...h }));
    (remote.habits || []).forEach((ch: any) => {
      if (habitMap.has(ch.id)) {
        const existing = habitMap.get(ch.id);
        const completedDates = Array.from(new Set([...existing.completedDates, ...ch.completedDates]));
        habitMap.set(ch.id, { ...existing, ...ch, completedDates });
      } else {
        habitMap.set(ch.id, { ...ch });
      }
    });

    // 2. Merging Tasks (Union by ID, keeping completed if either is true)
    const taskMap = new Map();
    (local.tasks || []).forEach((t: any) => taskMap.set(t.id, { ...t }));
    (remote.tasks || []).forEach((ct: any) => {
      if (taskMap.has(ct.id)) {
        const existing = taskMap.get(ct.id);
        const isCompleted = existing.isCompleted || ct.isCompleted;
        const completedAt = existing.completedAt || ct.completedAt;
        taskMap.set(ct.id, { ...existing, ...ct, isCompleted, completedAt });
      } else {
        taskMap.set(ct.id, { ...ct });
      }
    });

    // 3. Merging Avoid Items
    const avoidMap = new Map();
    (local.avoidItems || []).forEach((item: any) => avoidMap.set(item.id, { ...item }));
    (remote.avoidItems || []).forEach((item: any) => {
      if (avoidMap.has(item.id)) {
        const existing = avoidMap.get(item.id);
        const timesViolatedToday = Math.max(existing.timesViolatedToday, item.timesViolatedToday);
        const avoidedToday = existing.avoidedToday && item.avoidedToday;
        avoidMap.set(item.id, { ...existing, ...item, timesViolatedToday, avoidedToday });
      } else {
        avoidMap.set(item.id, { ...item });
      }
    });

    // 4. Merging Sleep Logs
    const sleepMap = new Map();
    (local.sleepLogs || []).forEach((s: any) => sleepMap.set(s.id, { ...s }));
    (remote.sleepLogs || []).forEach((s: any) => {
      if (sleepMap.has(s.id)) {
        const existing = sleepMap.get(s.id);
        sleepMap.set(s.id, { ...existing, ...s });
      } else {
        sleepMap.set(s.id, { ...s });
      }
    });

    // 5. Merging Custom Quotes
    const quoteMap = new Map();
    (local.customQuotes || []).forEach((q: any) => quoteMap.set(q.id, { ...q }));
    (remote.customQuotes || []).forEach((q: any) => {
      quoteMap.set(q.id, { ...q });
    });

    return {
      habits: Array.from(habitMap.values()),
      tasks: Array.from(taskMap.values()),
      avoidItems: Array.from(avoidMap.values()),
      sleepLogs: Array.from(sleepMap.values()),
      customQuotes: Array.from(quoteMap.values()),
      selectedPaletteId: remote.selectedPaletteId || local.selectedPaletteId,
      isDark: remote.isDark !== undefined ? remote.isDark : local.isDark
    };
  };

  // UPLOAD LOCAL DATA TO THE CLOUD
  const pushStateToCloud = async (isSilent = false) => {
    if (!syncCode) return;
    if (!isSilent) setSyncStatus('syncing');

    try {
      const payload = {
        habits: stateRef.current.habits,
        tasks: stateRef.current.tasks,
        avoidItems: stateRef.current.avoidItems,
        sleepLogs: stateRef.current.sleepLogs,
        customQuotes: stateRef.current.customQuotes,
        selectedPaletteId: stateRef.current.selectedPaletteId,
        isDark: stateRef.current.isDark,
        clientTimestamp: Date.now()
      };

      const res = await fetch(`https://api.keyvalue.xyz/${syncCode}/state`, {
        method: "POST",
        body: JSON.stringify(payload),
        headers: {
          "Content-Type": "text/plain"
        }
      });

      if (!res.ok) {
        throw new Error("Unable to upload state vectors");
      }

      setSyncStatus('synced');
      setLastSyncedTime(getFormattedTime());
      setErrorMessage("");
    } catch (err: any) {
      console.warn("Sync error:", err);
      setSyncStatus('error');
      setErrorMessage("Upload failed. Verify key or connection.");
    }
  };

  // DOWNLOAD DATA FROM THE CLOUD (AND SMART MERGE / OVERWRITE)
  const pullStateFromCloud = async (isBackground = false, forceOverwrite = false) => {
    if (!syncCode) return;
    if (!isBackground) setSyncStatus('syncing');

    try {
      const res = await fetch(`https://api.keyvalue.xyz/${syncCode}/state`);
      if (!res.ok) {
        if (res.status === 404) {
          // Key doesn't exist yet in directory, create it first
          if (!isBackground) {
            pushStateToCloud();
          }
          return;
        }
        throw new Error("Retrieve failure");
      }

      const raw = await res.text();
      if (!raw || raw.trim() === "null") {
        if (!isBackground) pushStateToCloud();
        return;
      }

      const remoteData = JSON.parse(raw);

      // Verify if remote is identical to current state to skip state churns
      const isIdentical = JSON.stringify({
        habits: stateRef.current.habits,
        tasks: stateRef.current.tasks,
        avoidItems: stateRef.current.avoidItems,
        sleepLogs: stateRef.current.sleepLogs,
        customQuotes: stateRef.current.customQuotes,
        selectedPaletteId: stateRef.current.selectedPaletteId,
        isDark: stateRef.current.isDark
      }) === JSON.stringify({
        habits: remoteData.habits,
        tasks: remoteData.tasks,
        avoidItems: remoteData.avoidItems,
        sleepLogs: remoteData.sleepLogs,
        customQuotes: remoteData.customQuotes,
        selectedPaletteId: remoteData.selectedPaletteId,
        isDark: remoteData.isDark
      });

      if (isIdentical) {
        setSyncStatus('synced');
        setLastSyncedTime(getFormattedTime());
        return;
      }

      // Background poll: strictly pull if remote data has a clientTimestamp and it is newer than our local state timestamps
      if (isBackground) {
        const lastSyncedTimestamp = localStorage.getItem("orbit_last_sync_timestamp") || "0";
        const hasNewerCloudPulse = remoteData.clientTimestamp && remoteData.clientTimestamp > parseInt(lastSyncedTimestamp, 10);

        if (hasNewerCloudPulse) {
          // Seamless background merge
          const merged = mergeStates(stateRef.current, remoteData);
          setHabits(merged.habits);
          setTasks(merged.tasks);
          setAvoidItems(merged.avoidItems);
          setSleepLogs(merged.sleepLogs);
          setCustomQuotes(merged.customQuotes);
          setSelectedPaletteId(merged.selectedPaletteId);
          setIsDark(merged.isDark);

          localStorage.setItem("orbit_last_sync_timestamp", String(remoteData.clientTimestamp));
          setLastSyncedTime(getFormattedTime());
          playSoundWave("click"); // subtle acoustic sync affirmation
        }
        setSyncStatus('synced');
        return;
      }

      // Manual User Pull Option: Offers options or executes direct overwrite
      if (forceOverwrite) {
        setHabits(remoteData.habits || []);
        setTasks(remoteData.tasks || []);
        setAvoidItems(remoteData.avoidItems || []);
        setSleepLogs(remoteData.sleepLogs || []);
        setCustomQuotes(remoteData.customQuotes || []);
        if (remoteData.selectedPaletteId) setSelectedPaletteId(remoteData.selectedPaletteId);
        if (remoteData.isDark !== undefined) setIsDark(remoteData.isDark);
        
        localStorage.setItem("orbit_last_sync_timestamp", String(remoteData.clientTimestamp || Date.now()));
        setErrorMessage("");
        playSoundWave("alarm");
      } else {
        // Smart Merge
        const merged = mergeStates(stateRef.current, remoteData);
        setHabits(merged.habits);
        setTasks(merged.tasks);
        setAvoidItems(merged.avoidItems);
        setSleepLogs(merged.sleepLogs);
        setCustomQuotes(merged.customQuotes);
        setSelectedPaletteId(merged.selectedPaletteId);
        setIsDark(merged.isDark);
        
        localStorage.setItem("orbit_last_sync_timestamp", String(remoteData.clientTimestamp || Date.now()));
        setErrorMessage("");
        playSoundWave("click");
      }

      setSyncStatus('synced');
      setLastSyncedTime(getFormattedTime());
    } catch (err: any) {
      console.warn("Pull error:", err);
      // Background silences, foreground signals error
      if (!isBackground) {
        setSyncStatus('error');
        setErrorMessage("Download failed. Make sure device key is accurate.");
      }
    }
  };

  const handleSmartMergeAction = async () => {
    playSoundWave("click");
    if (!syncCode) {
      setErrorMessage("Enter a Sync Code first");
      return;
    }
    setSyncStatus('syncing');
    
    try {
      // 1. Fetch remote data
      const res = await fetch(`https://api.keyvalue.xyz/${syncCode}/state`);
      if (!res.ok) {
        // Safe upload primary if does not exist
        await pushStateToCloud(false);
        return;
      }
      
      const raw = await res.text();
      if (!raw || raw.trim() === "null") {
        await pushStateToCloud(false);
        return;
      }
      
      const remoteData = JSON.parse(raw);
      
      // 2. Perform direct merge
      const merged = mergeStates(stateRef.current, remoteData);
      
      // 3. Update local react states
      setHabits(merged.habits);
      setTasks(merged.tasks);
      setAvoidItems(merged.avoidItems);
      setSleepLogs(merged.sleepLogs);
      setCustomQuotes(merged.customQuotes);
      setSelectedPaletteId(merged.selectedPaletteId);
      setIsDark(merged.isDark);
      
      // 4. Overwrite cloud state with merged data
      const payload = {
        ...merged,
        clientTimestamp: Date.now()
      };
      
      await fetch(`https://api.keyvalue.xyz/${syncCode}/state`, {
        method: "POST",
        body: JSON.stringify(payload),
        headers: { "Content-Type": "text/plain" }
      });
      
      localStorage.setItem("orbit_last_sync_timestamp", String(payload.clientTimestamp));
      setSyncStatus('synced');
      setLastSyncedTime(getFormattedTime());
      setErrorMessage("");
    } catch (err) {
      setSyncStatus('error');
      setErrorMessage("Smart merge operation struggled. Verify Connection.");
    }
  };

  return (
    <div id="orbit-sync-manager-section" className={`p-5 sm:p-6 rounded-3xl transition-all duration-300 border ${
      isDark ? "bg-zinc-900 border-zinc-800 text-zinc-100" : "bg-white border-zinc-100 text-zinc-900"
    } shadow-sm`}>
      
      {/* Title Header area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl text-white shadow-sm flex items-center justify-center"
               style={{ backgroundColor: palette.accent }}>
            <Wifi size={14} />
          </div>
          <div>
            <h3 className="font-sans font-semibold tracking-tight text-base flex items-center gap-1.5">
              Orbit Cloud Link
              <span className={`w-2.5 h-2.5 rounded-full inline-block ${
                !syncCode 
                  ? "bg-zinc-400" 
                  : syncStatus === 'synced' 
                    ? "bg-emerald-500 animate-pulse" 
                    : syncStatus === 'syncing' 
                      ? "bg-amber-400 rotate-180 animate-spin" 
                      : syncStatus === 'error' 
                        ? "bg-red-500" 
                        : "bg-zinc-400"
              }`} />
            </h3>
            <p className="text-[11px] text-zinc-400 font-sans">
              Instant Cross-Device Syncing without Accounts
            </p>
          </div>
        </div>

        {/* Toggle options buttons */}
        <div className="flex items-center gap-2">
          {/* Info toggle */}
          <button
            onClick={() => setShowInfo(!showInfo)}
            className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
              showInfo 
                ? "bg-zinc-800/10 border-zinc-300 dark:border-zinc-700 text-zinc-100" 
                : "border-transparent text-zinc-400 hover:text-zinc-620"
            }`}
          >
            <HelpCircle size={14} />
          </button>

          {/* Autoplay toggle slide */}
          <button
            onClick={handleToggleAutoSync}
            disabled={!syncCode}
            className={`text-xs px-3 py-1.5 rounded-xl border font-sans font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              !syncCode
                ? "opacity-40 cursor-not-allowed border-transparent"
                : isAutoSync
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                  : isDark 
                    ? "border-zinc-800 text-zinc-400 hover:bg-zinc-850" 
                    : "border-zinc-200 text-zinc-600 bg-zinc-50"
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isAutoSync ? "bg-emerald-500 animate-ping" : "bg-zinc-400"}`} />
            {isAutoSync ? "Auto-Sync Active" : "Auto-Sync Off"}
          </button>
        </div>
      </div>

      {/* Sleek Information block */}
      {showInfo && (
        <div className={`p-3.5 rounded-2xl text-[11px] leading-relaxed mb-4 border ${
          isDark ? "bg-zinc-850 border-zinc-800 text-zinc-300" : "bg-zinc-50 border-emerald-100 text-zinc-650"
        } animate-fadeIn`}>
          <p className="font-bold mb-1 flex items-center gap-1 text-[12px] text-emerald-500">
            <Info size={11} /> how does pairing work?
          </p>
          <ul className="list-disc pl-4 space-y-1">
            <li>Type any secret word or click <strong>Generate Code</strong> on your PC.</li>
            <li>Copy that exact room code to your Mobile Device (or vice versa).</li>
            <li>Enable <strong>Auto-Sync</strong> to sync state automatically across interfaces!</li>
            <li>Uses anonymous public browser-to-browser relay keys - secure, private, and 100% database-free!</li>
          </ul>
        </div>
      )}

      {/* Action form deck */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        {/* Sync input field */}
        <div className="relative w-full">
          <input
            type="text"
            value={syncCode}
            onChange={(e) => handleUpdateSyncCode(e.target.value)}
            placeholder="Type secret word or generate a code..."
            className={`w-full text-xs font-mono px-3.5 py-2.5 rounded-2xl border transition-all ${
              isDark
                ? "bg-zinc-850 border-zinc-800 text-zinc-200 placeholder-zinc-500 focus:border-zinc-700 focus:outline-none"
                : "bg-zinc-50 border-zinc-150 text-zinc-805 placeholder-zinc-400 focus:border-zinc-300 focus:outline-none"
            }`}
          />
          {syncCode && (
            <button
              onClick={copyToClipboard}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-400 transition-colors cursor-pointer"
              title="Copy pairing passcode link"
            >
              {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
            </button>
          )}
        </div>

        {/* Generate / Clear buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
          <button
            onClick={handleGenerateCode}
            className={`w-full sm:w-auto px-4 py-2.5 text-xs font-sans font-bold rounded-2xl border transition-all cursor-pointer ${
              isDark 
                ? "border-zinc-800 bg-zinc-800 text-zinc-200 hover:bg-zinc-750" 
                : "border-zinc-200 bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
            }`}
          >
            Generate Code
          </button>
        </div>
      </div>

      {/* Manual Synchronising controls - trigger only when Sync Code is present */}
      {syncCode && (
        <div className="mt-4 flex flex-col md:flex-row md:items-center justify-between gap-4 pt-4 border-t border-dashed border-zinc-200 dark:border-zinc-800">
          
          {/* Action buttons */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Smart Merge action */}
            <button
              onClick={handleSmartMergeAction}
              title="Combine habits/tasks from both devices safely"
              className="text-xs px-3.5 py-2 text-white font-sans font-extrabold rounded-xl transition-all shadow-sm hover:scale-102 flex items-center gap-1.5 cursor-pointer"
              style={{ backgroundColor: palette.accent }}
            >
              <PlusCircle size={13} />
              <span>Smart Merge Records</span>
            </button>

            {/* Force Push to cloud */}
            <button
              onClick={() => pushStateToCloud(false)}
              className={`text-xs px-3 py-2 rounded-xl border font-sans font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                isDark 
                  ? "border-zinc-800 text-zinc-300 bg-zinc-850 hover:bg-zinc-800"
                  : "border-zinc-200 text-zinc-650 hover:bg-zinc-100"
              }`}
              title="Overwrite cloud backup with your current local screen data"
            >
              <ArrowUpCircle size={13} />
              <span>Push State</span>
            </button>

            {/* Force Pull from cloud */}
            <button
              onClick={() => {
                if (window.confirm("This will pull cloud data directly. If you want to keep local records as well, use 'Smart Merge' instead. Proceed?")) {
                  pullStateFromCloud(false, true);
                }
              }}
              className={`text-xs px-3 py-2 rounded-xl border font-sans font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                isDark 
                  ? "border-zinc-800 text-zinc-300 bg-zinc-850 hover:bg-zinc-800"
                  : "border-zinc-200 text-zinc-650 hover:bg-zinc-100"
              }`}
              title="Pull remote backup directly (will overwrite local dashboard items)"
            >
              <ArrowDownCircle size={13} />
              <span>Pull Overwrite</span>
            </button>
          </div>

          {/* Sync status logging messages */}
          <div className="text-[10px] font-mono text-zinc-400 text-right">
            {errorMessage ? (
              <span className="text-rose-500 font-bold">{errorMessage}</span>
            ) : lastSyncedTime ? (
              <span className="flex items-center gap-1 justify-end">
                <Check size={10} className="text-emerald-500" />
                Linked • Updated {lastSyncedTime}
              </span>
            ) : (
              <span>Passkey Set • Ready to Sync</span>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
