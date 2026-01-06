import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import { Link, useLocation } from "wouter";
import { Layout } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, MapPin, Compass, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import type { Entry } from "@shared/schema";
import "leaflet/dist/leaflet.css";

// Fix for Leaflet default icon not showing
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom styling for the map
const mapStyle = {
  height: "100%",
  width: "100%",
  borderRadius: "1.5rem",
  zIndex: 10
};

// Component to auto-fit map bounds to show all markers
function FitBounds({ positions }: { positions: [number, number][] }) {
  const map = useMap();
  
  useEffect(() => {
    if (positions.length > 0) {
      const bounds = L.latLngBounds(positions);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 5 });
    }
  }, [positions, map]);
  
  return null;
}

export default function MapPage() {
  const center: [number, number] = [30, 30]; // Initial center - will auto-adjust to fit all markers
  const [entries, setEntries] = useState<Entry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Redirect to auth if not logged in
    if (!user) {
      setLocation('/auth');
      return;
    }

    // Fetch user's entries from API
    const fetchEntries = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/entries/user/${user.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch entries');
        }
        const data = await response.json();
        setEntries(data);
      } catch (error) {
        console.error('Error fetching entries:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEntries();
  }, [user, setLocation]);

  // Sort entries by date to create a logical path
  // Filter out entries without valid coordinates
  const entriesWithCoords = entries.filter(entry => 
    entry.coordinates && 
    Array.isArray(entry.coordinates) && 
    entry.coordinates.length === 2 &&
    !isNaN(entry.coordinates[0]) && 
    !isNaN(entry.coordinates[1])
  );
  
  const sortedEntries = [...entriesWithCoords].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const polylinePositions = sortedEntries.map(entry => entry.coordinates);

  return (
    <Layout>
      <div className="space-y-8 pb-12 h-[calc(100vh-200px)] min-h-[600px] flex flex-col">
        <div className="flex flex-col md:flex-row items-end justify-between gap-4 px-2">
            <div>
                <motion.div
                   initial={{ opacity: 0, x: -20 }}
                   animate={{ opacity: 1, x: 0 }}
                   className="flex items-center gap-2 text-primary font-medium mb-2"
                >
                    <Compass className="w-5 h-5" />
                    <span className="text-sm uppercase tracking-wider">World Explorer</span>
                </motion.div>
                <motion.h1 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-4xl md:text-5xl font-serif font-bold"
                >
                    My Travel Map
                </motion.h1>
            </div>
            
            <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-muted-foreground max-w-md text-right hidden md:block"
            >
                Explore the footprint of your adventures across the globe.
                Select a pin to revisit the memories.
            </motion.p>
        </div>

        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex-1 relative rounded-3xl overflow-hidden border border-border/50 shadow-xl"
        >
            {isLoading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-muted/20 rounded-3xl">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
              </div>
            ) : sortedEntries.length === 0 ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted/20 rounded-3xl p-8 text-center">
                <MapPin className="w-16 h-16 text-muted-foreground mb-4" />
                <h3 className="text-2xl font-serif font-bold text-foreground mb-2">
                  No Locations Yet
                </h3>
                <p className="text-muted-foreground max-w-md mb-6">
                  Start creating journal entries with locations to see them appear on your travel map!
                </p>
                <Link href="/create">
                  <Button>Create Entry</Button>
                </Link>
              </div>
            ) : (
            <MapContainer center={center} zoom={2} style={mapStyle} scrollWheelZoom={true} className="z-0">
                {/* Using standard OpenStreetMap tiles for accurate geographical representation */}
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    maxZoom={19}
                />
                
                {/* Auto-fit bounds to show all markers */}
                <FitBounds positions={polylinePositions} />

                {/* Animated Path */}
                <Polyline 
                    positions={polylinePositions} 
                    pathOptions={{ 
                        color: 'hsl(150 25% 35%)', /* Primary Sage Green */
                        weight: 3,
                        dashArray: '10, 10', 
                        opacity: 0.7,
                        className: 'animated-path'
                    }} 
                />
                
                {sortedEntries.map((entry, index) => (
                    <Marker key={entry.id} position={entry.coordinates}>
                        <Popup className="custom-popup">
                            <div className="w-64 p-0">
                                <div className="relative h-32 rounded-t-lg overflow-hidden mb-3">
                                    <img src={entry.images[0]} alt={entry.title} className="w-full h-full object-cover" />
                                </div>
                                <div className="px-1 pb-2">
                                    <div className="flex items-center text-xs text-primary font-bold uppercase tracking-wider mb-1">
                                        <MapPin className="w-3 h-3 mr-1" /> {entry.location}
                                    </div>
                                    <h3 className="font-serif text-lg font-bold mb-2 leading-tight">{entry.title}</h3>
                                    <p className="text-xs text-muted-foreground mb-3 font-medium">Stop #{index + 1} • {new Date(entry.date).getFullYear()}</p>
                                    <Link href={`/entry/${entry.id}`}>
                                        <Button size="sm" className="w-full h-8 text-xs bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors">
                                            View Journal
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
            )}
            
            {/* Map Legend / Stats Overlay */}
            {!isLoading && (
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
              className="absolute bottom-6 left-6 z-[400] bg-white/90 dark:bg-black/80 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-border/50 max-w-xs hidden sm:block"
            >
                <div className="flex items-center justify-between gap-8 mb-2">
                    <span className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Total Journeys</span>
                    <span className="font-serif text-2xl font-bold text-primary">{entries.length}</span>
                </div>
                <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: entries.length > 0 ? '35%' : '0%' }}
                        transition={{ delay: 1, duration: 1 }}
                        className="h-full bg-primary rounded-full"
                    />
                </div>
                <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
                    {entries.length > 0 
                      ? `You've documented ${entries.length} ${entries.length === 1 ? 'journey' : 'journeys'}. Keep exploring!`
                      : 'Start your first journey today!'}
                </p>
            </motion.div>
            )}
        </motion.div>
      </div>
    </Layout>
  );
}
