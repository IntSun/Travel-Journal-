import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import notFoundIllustration from '@assets/generated_images/lost_traveler_illustration_for_404_page.png';

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4">
      <div className="max-w-lg w-full text-center space-y-8">
        <div className="relative aspect-square max-w-sm mx-auto">
             <img src={notFoundIllustration} alt="Lost Traveler" className="w-full h-full object-contain mix-blend-multiply" />
        </div>
        
        <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground">Off the Map</h1>
            <p className="text-lg text-muted-foreground">
                Oops! Looks like you've wandered into uncharted territory. This page doesn't exist on our map.
            </p>
        </div>
        
        <Link href="/">
            <Button size="lg" className="rounded-full px-8">Return to Safety</Button>
        </Link>
      </div>
    </div>
  );
}
