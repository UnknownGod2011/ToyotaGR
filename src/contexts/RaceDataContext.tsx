/**
 * Race Data Context
 * Global state management for race telemetry data
 * Author: Tanush Shah
 */

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { RealSessionData, realDataLoader } from '../services/RealDataLoader';
import { TelemetryPoint, dataParser } from '../services/DataParser';
import { pdfTrackParser, TrackGeometry } from '../services/PDFTrackParser';
import { CleanedTelemetryData } from '../services/TelemetryUploadService';
import { analyticsEngine } from '../services/AnalyticsEngine';

import { DatabaseTrack, DatabaseSession } from './RaceDatabaseContext';

interface RaceDataContextType {
  sessionData: RealSessionData | null;
  trackGeometry: TrackGeometry | null;
  loading: boolean;
  error: string | null;
  currentLap: number;
  setCurrentLap: (lap: number) => void;
  selectedLap: number;
  setSelectedLap: (lap: number) => void;
  comparisonLap: number | null;
  setComparisonLap: (lap: number | null) => void;
  getCurrentLapTelemetry: () => TelemetryPoint[] | null;
  getSelectedLapTelemetry: () => TelemetryPoint[] | null;
  getBestLapTelemetry: () => TelemetryPoint[] | null;
  loadRaceData: (trackId: string, raceNumber: number, vehicleNumber?: number) => Promise<void>;
  loadDatabaseSession: (track: DatabaseTrack, session: DatabaseSession, vehicleNumber?: number) => Promise<void>;
  loadTrackOnly: (trackId: string, trackName: string) => Promise<void>;
  uploadTelemetryData: (data: CleanedTelemetryData) => Promise<void>;
  dataLoaded: boolean;
  trackLoaded: boolean;
  selectedTrackId: string | null;
}

const RaceDataContext = createContext<RaceDataContextType | undefined>(undefined);

export const useRaceData = () => {
  const context = useContext(RaceDataContext);
  if (!context) {
    throw new Error('useRaceData must be used within a RaceDataProvider');
  }
  return context;
};

interface RaceDataProviderProps {
  children: ReactNode;
}

export const RaceDataProvider: React.FC<RaceDataProviderProps> = ({ children }) => {
  const [sessionData, setSessionData] = useState<RealSessionData | null>(null);
  const [trackGeometry, setTrackGeometry] = useState<TrackGeometry | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentLap, setCurrentLap] = useState(1);
  const [selectedLap, setSelectedLap] = useState(1);
  const [comparisonLap, setComparisonLap] = useState<number | null>(null);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [trackLoaded, setTrackLoaded] = useState(false);
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);

  const loadTrackOnly = async (trackId: string, trackName: string) => {
    setLoading(true);
    setError(null);
    setTrackLoaded(false);
    setSelectedTrackId(trackId);

    try {
      // Load track PDF and parse geometry
      // If trackId is from database, we might need to find the map file
      // For legacy support, we use getTrackPDFPath
      // But if we have the database track object, we should use that.
      // Since this function signature only has trackId, we stick to legacy or simple lookup
      const pdfPath = `/Race_Data/${getTrackPDFPath(trackId)}`;
      const geometry = await pdfTrackParser.parseTrackPDF(pdfPath, trackId, trackName);
      setTrackGeometry(geometry);
      setTrackLoaded(true);
      console.log(`Track ${trackName} loaded successfully`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load track');
      console.error('Error loading track:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadDatabaseSession = async (track: DatabaseTrack, session: DatabaseSession, vehicleNumber?: number) => {
    console.log(`🏁 [RaceDataContext] Loading DB session: ${track.name}, ${session.name}, Vehicle ${vehicleNumber || 'ALL'}`);
    setLoading(true);
    setError(null);
    setDataLoaded(false);
    setSelectedTrackId(track.id);

    try {
      // Load track geometry
      console.log(`📍 [RaceDataContext] Loading track geometry...`);
      // Use the map file from the database track if available
      const mapFile = track.map_file || getTrackPDFPath(track.id);
      const pdfPath = `/Race_Data/${mapFile}`;
      const geometry = await pdfTrackParser.parseTrackPDF(pdfPath, track.id, track.name);
      setTrackGeometry(geometry);
      setTrackLoaded(true);
      console.log(`✅ [RaceDataContext] Track geometry loaded`);

      // Then load race data
      console.log(`📊 [RaceDataContext] Loading race data from CSV files...`);
      const data = await realDataLoader.loadSessionData(track, session, vehicleNumber);
      console.log(`✅ [RaceDataContext] Race data loaded`);

      // Load ML predictions
      await analyticsEngine.loadMLPredictions();
      console.log(`🤖 [RaceDataContext] ML predictions loaded`);

      setSessionData(data);
      setDataLoaded(true);

      // Set initial laps
      if (data.lapTimes.length > 0) {
        const bestLap = data.lapTimes.reduce((best, lap) =>
          lap.lapTime < best.lapTime ? lap : best
        );
        const lastLap = data.lapTimes[data.lapTimes.length - 1];
        setCurrentLap(lastLap.lap);
        setSelectedLap(bestLap.lap);
      }

      console.log(`🎉 [RaceDataContext] Race data loading complete!`);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load race data';
      setError(errorMsg);
      console.error('❌ [RaceDataContext] Error loading race data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadRaceData = async (trackId: string, raceNumber: number, vehicleNumber?: number) => {
    console.log(`🏁 [RaceDataContext] Loading race data: ${trackId}, Race ${raceNumber}, Vehicle ${vehicleNumber || 'ALL'}`);
    setLoading(true);
    setError(null);
    setDataLoaded(false);
    setSelectedTrackId(trackId);

    try {
      // Load track geometry first
      console.log(`📍 [RaceDataContext] Loading track geometry...`);
      const trackInfo = getTrackInfo(trackId);
      await loadTrackOnly(trackId, trackInfo.name);
      console.log(`✅ [RaceDataContext] Track geometry loaded`);

      // Then load race data
      console.log(`📊 [RaceDataContext] Loading race data from CSV files...`);
      const data = await realDataLoader.loadRaceData(trackId, raceNumber, vehicleNumber);
      console.log(`✅ [RaceDataContext] Race data loaded`);

      // Load ML predictions
      await analyticsEngine.loadMLPredictions();
      console.log(`🤖 [RaceDataContext] ML predictions loaded`);

      setSessionData(data);
      setDataLoaded(true);

      // Set initial laps
      if (data.lapTimes.length > 0) {
        const bestLap = data.lapTimes.reduce((best, lap) =>
          lap.lapTime < best.lapTime ? lap : best
        );
        const lastLap = data.lapTimes[data.lapTimes.length - 1];
        setCurrentLap(lastLap.lap);
        setSelectedLap(bestLap.lap);
      }

      console.log(`🎉 [RaceDataContext] Race data loading complete!`);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load race data';
      setError(errorMsg);
      console.error('❌ [RaceDataContext] Error loading race data:', err);
    } finally {
      setLoading(false);
    }
  };

  const uploadTelemetryData = async (cleanedData: CleanedTelemetryData) => {
    setLoading(true);
    setError(null);

    try {
      if (!trackGeometry) {
        throw new Error('Please select a track first');
      }

      // Process telemetry
      const telemetryWithDistance = dataParser.calculateDistanceBasedTelemetry(cleanedData.telemetry);
      const telemetryByLap = dataParser.groupTelemetryByLap(telemetryWithDistance);

      // Calculate lap times
      const lapTimes = Array.from(telemetryByLap.entries())
        .map(([lapNum, lapTelemetry]) => {
          if (lapTelemetry.length < 2) return null;
          const startTime = new Date(lapTelemetry[0].timestamp).getTime();
          const endTime = new Date(lapTelemetry[lapTelemetry.length - 1].timestamp).getTime();
          const lapTime = (endTime - startTime) / 1000;

          return {
            lap: lapNum,
            lapTime,
            timestamp: lapTelemetry[0].timestamp,
            vehicleId: 'USER-UPLOAD',
            vehicleNumber: 0,
          };
        })
        .filter((l): l is NonNullable<typeof l> => l !== null && l.lapTime > 0 && l.lapTime < 300);

      if (lapTimes.length === 0) {
        throw new Error('No valid laps found in telemetry data');
      }

      // Find best lap
      const bestLapData = lapTimes.reduce((best, lap) =>
        lap.lapTime < best.lapTime ? lap : best
      );
      const bestLapTelemetry = telemetryByLap.get(bestLapData.lap) || null;

      // Detect corners
      const corners = bestLapTelemetry ? analyticsEngine.detectCorners(bestLapTelemetry) : [];

      // Generate insights
      const currentLapTelemetry = Array.from(telemetryByLap.values())[telemetryByLap.size - 1] || [];
      const insights = bestLapTelemetry && currentLapTelemetry.length > 0
        ? analyticsEngine.generateInsights(currentLapTelemetry, bestLapTelemetry, corners)
        : [];

      // Load ML predictions
      await analyticsEngine.loadMLPredictions();

      // Generate prediction
      const recentLaps = Array.from(telemetryByLap.values()).slice(-5);
      const prediction = recentLaps.length > 0
        ? analyticsEngine.predictNextLap(recentLaps, lapTimes, telemetryByLap.size)
        : null;

      // Construct optimal lap
      const allLaps = Array.from(telemetryByLap.values());
      const optimalLap = allLaps.length > 0
        ? analyticsEngine.constructOptimalLap(allLaps)
        : null;

      // Create session data
      const sessionData: RealSessionData = {
        track: {
          name: trackGeometry.trackName,
          length: trackGeometry.length,
          corners,
          sectors: 3,
        },
        telemetry: telemetryByLap,
        lapTimes,
        weather: [],
        bestLaps: [],
        insights,
        prediction,
        optimalLap,
        vehicleNumbers: [0],
      };

      setSessionData(sessionData);
      setDataLoaded(true);

      // Set initial laps
      setCurrentLap(lapTimes.length);
      setSelectedLap(bestLapData.lap);

      console.log(`Uploaded telemetry processed: ${cleanedData.telemetry.length} points, ${lapTimes.length} laps`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process uploaded telemetry');
      console.error('Error processing upload:', err);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLapTelemetry = (): TelemetryPoint[] | null => {
    if (!sessionData) return null;
    return sessionData.telemetry.get(currentLap) || null;
  };

  const getSelectedLapTelemetry = (): TelemetryPoint[] | null => {
    if (!sessionData) return null;
    return sessionData.telemetry.get(selectedLap) || null;
  };

  const getBestLapTelemetry = (): TelemetryPoint[] | null => {
    if (!sessionData || sessionData.lapTimes.length === 0) return null;

    const bestLap = sessionData.lapTimes.reduce((best, lap) =>
      lap.lapTime < best.lapTime ? lap : best
    );

    return sessionData.telemetry.get(bestLap.lap) || null;
  };

  const getTrackPDFPath = (trackId: string): string => {
    const pdfPaths: Record<string, string> = {
      'barber': 'Barber_Circuit_Map.pdf',
      'cota': 'COTA_Circuit_Map.pdf',
      'indianapolis': 'Indy_Circuit_Map.pdf',
      'road-america': 'Road_America_Map.pdf',
      'sebring': 'Sebring_Track_Sector_Map.pdf',
      'sonoma': 'Sonoma_Map.pdf',
      'vir': 'VIR_map.pdf',
    };
    return pdfPaths[trackId] || 'track.pdf';
  };

  const getTrackInfo = (trackId: string): { name: string } => {
    const trackNames: Record<string, string> = {
      'barber': 'Barber Motorsports Park',
      'cota': 'Circuit of the Americas',
      'indianapolis': 'Indianapolis Motor Speedway',
      'road-america': 'Road America',
      'sebring': 'Sebring International Raceway',
      'sonoma': 'Sonoma Raceway',
      'vir': 'Virginia International Raceway',
    };
    return { name: trackNames[trackId] || trackId };
  };

  const value: RaceDataContextType = {
    sessionData,
    trackGeometry,
    loading,
    error,
    currentLap,
    setCurrentLap,
    selectedLap,
    setSelectedLap,
    comparisonLap,
    setComparisonLap,
    getCurrentLapTelemetry,
    getSelectedLapTelemetry,
    getBestLapTelemetry,
    loadRaceData,
    loadDatabaseSession,
    loadTrackOnly,
    uploadTelemetryData,
    dataLoaded,
    trackLoaded,
    selectedTrackId,
  };

  return (
    <RaceDataContext.Provider value={value}>
      {children}
    </RaceDataContext.Provider>
  );
};
