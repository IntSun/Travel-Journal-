import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Layout } from "@/components/layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarIcon, MapPin, Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export default function CreateEntry() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [date, setDate] = useState<Date>();
  const [images, setImages] = useState<string[]>([]);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState("");
  const [location, setLocationValue] = useState("");
  const [description, setDescription] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Redirect to auth if not logged in
    if (!user) {
      setLocation('/auth');
    }
  }, [user, setLocation]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, isCover = false) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          if (isCover) {
            setCoverImage(reader.result);
          } else {
            setImages([...images, reader.result]);
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create an entry",
        variant: "destructive",
      });
      return;
    }

    if (!date) {
      toast({
        title: "Error",
        description: "Please select a date for your entry",
        variant: "destructive",
      });
      return;
    }

    if (!location) {
      toast({
        title: "Error",
        description: "Please add a location",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Geocode the location to get coordinates
      let coordinates: [number, number] = [20, 0]; // Default fallback
      
      try {
        // Use OpenStreetMap Nominatim API (free, no API key required)
        const geocodeResponse = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}&limit=1`,
          {
            headers: {
              'User-Agent': 'Travel-Journal-App' // Required by Nominatim
            }
          }
        );
        
        if (geocodeResponse.ok) {
          const geocodeData = await geocodeResponse.json();
          if (geocodeData && geocodeData.length > 0) {
            const lat = parseFloat(geocodeData[0].lat);
            const lon = parseFloat(geocodeData[0].lon);
            if (!isNaN(lat) && !isNaN(lon)) {
              coordinates = [lat, lon];
            }
          }
        }
      } catch (geocodeError) {
        console.warn('Geocoding failed, using default coordinates:', geocodeError);
        // Continue with default coordinates if geocoding fails
      }

      // Combine cover image and gallery images
      const allImages = coverImage ? [coverImage, ...images] : images;

      const entryData = {
        userId: user.id,
        title,
        location,
        coordinates,
        date: date.toISOString(),
        description,
        images: allImages.slice(0, 3), // Max 3 images
      };

      const response = await fetch('/api/entries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entryData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create entry');
      }

      toast({
        title: "Story Published!",
        description: "Your adventure has been shared with the world.",
      });
      setLocation("/");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create entry",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto pb-20"
      >
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Cover Image Area */}
          <div className="relative group rounded-3xl overflow-hidden aspect-[21/9] bg-muted/20 border-2 border-dashed border-muted-foreground/10 hover:border-primary/30 transition-all cursor-pointer">
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={coverInputRef}
              onChange={(e) => handleImageUpload(e, true)}
            />
            
            {coverImage ? (
              <>
                <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                   <Button 
                     type="button" 
                     variant="secondary" 
                     onClick={() => coverInputRef.current?.click()}
                   >
                     Change Cover
                   </Button>
                </div>
              </>
            ) : (
              <div 
                className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground"
                onClick={() => coverInputRef.current?.click()}
              >
                <div className="p-4 bg-background rounded-full shadow-sm mb-4 group-hover:scale-110 transition-transform">
                  <ImageIcon className="w-8 h-8 text-primary/60" />
                </div>
                <span className="font-medium text-lg">Add a cover image</span>
                <span className="text-sm opacity-70 mt-1">Drag and drop or click to upload</span>
              </div>
            )}
          </div>

          <div className="space-y-8 px-4 md:px-12">
            {/* Title Input */}
            <Input 
              placeholder="Title of your story..." 
              className="text-5xl md:text-6xl font-serif font-bold border-none shadow-none px-0 placeholder:text-muted-foreground/40 h-auto py-4 bg-transparent focus-visible:ring-0"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            {/* Metadata Bar */}
            <div className="flex flex-wrap gap-4 items-center p-4 bg-card/50 backdrop-blur-sm rounded-xl border border-border/50">
                <div className="flex-1 min-w-[200px] relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                    <Input 
                      placeholder="Add Location" 
                      className="pl-9 bg-transparent border-none shadow-none focus-visible:ring-0 font-medium"
                      value={location}
                      onChange={(e) => setLocationValue(e.target.value)}
                      required
                    />
                </div>
                <div className="w-[1px] h-6 bg-border hidden sm:block"></div>
                <div className="flex-1 min-w-[200px]">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"ghost"}
                          className={cn(
                            "w-full justify-start text-left font-normal hover:bg-transparent pl-3",
                            !date && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                          {date ? format(date, "PPP") : <span>Add Date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 border-border/50 shadow-xl" align="start">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={setDate}
                          initialFocus
                          className="rounded-xl"
                        />
                      </PopoverContent>
                    </Popover>
                </div>
            </div>

            {/* Content Editor */}
            <div className="min-h-[400px] relative">
              <Textarea 
                placeholder="Tell your story..." 
                className="min-h-[400px] w-full resize-none border-none shadow-none focus-visible:ring-0 text-lg md:text-xl leading-loose font-light bg-transparent p-0 placeholder:text-muted-foreground/30"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            {/* Photo Grid */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-lg font-semibold">Photo Gallery</Label>
                <span className="text-sm text-muted-foreground">{images.length}/3 photos</span>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {images.map((img, index) => (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    key={index} 
                    className="relative aspect-square rounded-xl overflow-hidden group shadow-sm"
                  >
                    <img src={img} alt="Upload preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-black/50 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                ))}
                
                {images.length < 3 && (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-muted-foreground/10 hover:border-primary/40 hover:bg-primary/5 rounded-xl flex flex-col items-center justify-center aspect-square cursor-pointer transition-all group"
                  >
                    <div className="p-3 bg-muted rounded-full mb-2 group-hover:scale-110 transition-transform">
                      <Upload className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">Add Photo</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      ref={fileInputRef}
                      onChange={(e) => handleImageUpload(e)} 
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Action Bar */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 dark:bg-black/80 backdrop-blur-md border-t border-border/50 z-40 flex justify-center">
               <div className="container max-w-4xl flex justify-between items-center">
                  <Link href="/">
                    <Button variant="ghost" type="button" className="text-muted-foreground hover:text-foreground">Discard</Button>
                  </Link>
                  <div className="flex gap-3">
                    <Button variant="outline" type="button" disabled={isSubmitting}>Save Draft</Button>
                    <Button type="submit" size="lg" className="px-8 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground min-w-[140px]" disabled={isSubmitting}>
                      {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Publish Story"}
                    </Button>
                  </div>
               </div>
            </div>
          </div>
        </form>
      </motion.div>
    </Layout>
  );
}
