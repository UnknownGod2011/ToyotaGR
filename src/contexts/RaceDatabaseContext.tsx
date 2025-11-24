import React, { createContext, useContext, useState, useEffect } from 'react';

export interface DatabaseFile {
  name: string;
  path: string; // Constructed path
}

export interface DatabaseSession {
  id: string;
  name: string;
  files: string[];
  path: string;
}

export interface DatabaseTrack {
  id: string;
  name: string;
  path: string;
  map_file: string | null;
  sessions: DatabaseSession[];
}

export interface RaceDatabase {
  tracks: DatabaseTrack[];
}

interface RaceDatabaseContextType {
  database: RaceDatabase | null;
  loading: boolean;
  error: string | null;
  selectedTrack: DatabaseTrack | null;
  selectedSession: DatabaseSession | null;
  selectTrack: (trackId: string) => void;
  selectSession: (sessionId: string) => void;
}

const RaceDatabaseContext = createContext<RaceDatabaseContextType | undefined>(undefined);

export const RaceDatabaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [database, setDatabase] = useState<RaceDatabase | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTrack, setSelectedTrack] = useState<DatabaseTrack | null>(null);
  const [selectedSession, setSelectedSession] = useState<DatabaseSession | null>(null);

  useEffect(() => {
    fetch('/database.json')
      .then(res => {
        if (!res.ok) throw new Error('Failed to load database index');
        return res.json();
      })
      .then(data => {
        setDatabase(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const selectTrack = (trackId: string) => {
    if (!database) return;
    const track = database.tracks.find(t => t.id === trackId);
    setSelectedTrack(track || null);
    setSelectedSession(null); // Reset session when track changes
  };

  const selectSession = (sessionId: string) => {
    if (!selectedTrack) return;
    const session = selectedTrack.sessions.find(s => s.id === sessionId);
    setSelectedSession(session || null);
  };

  return (
    <RaceDatabaseContext.Provider value={{
      database,
      loading,
      error,
      selectedTrack,
      selectedSession,
      selectTrack,
      selectSession
    }}>
      {children}
    </RaceDatabaseContext.Provider>
  );
};

export const useRaceDatabase = () => {
  const context = useContext(RaceDatabaseContext);
  if (context === undefined) {
    throw new Error('useRaceDatabase must be used within a RaceDatabaseProvider');
  }
  return context;
};
