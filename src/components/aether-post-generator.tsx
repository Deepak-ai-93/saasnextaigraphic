
"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { generatePostContent, type GeneratePostContentOutput } from "@/ai/flows/generate-post-content";
import { generatePostImage, type GeneratePostImageOutput } from "@/ai/flows/generate-post-image";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Download, ImageIcon, Instagram, Facebook, Twitter, Edit3, RotateCcw, AlertCircle, Wand2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

type Platform = "instagram" | "facebook" | "x";
interface GeneratedPost extends GeneratePostContentOutput {
  imageUri: string;
}

const platformIcons: Record<Platform, React.ElementType> = {
  instagram: Instagram,
  facebook: Facebook,
  x: Twitter,
};

const platformAspectRatios: Record<Platform, string> = {
  instagram: "aspect-square", // 1:1
  facebook: "aspect-[1.91/1]", // ~1.91:1
  x: "aspect-video", // 16:9
};

export default function AetherPostGenerator() {
  const [description, setDescription] = useState<string>("");
  const [platform, setPlatform] = useState<Platform>("instagram");
  const [generatedPost, setGeneratedPost] = useState<GeneratedPost | null>(null);
  const [editedText, setEditedText] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isImageLoading, setIsImageLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string>("");

  useEffect(() => {
    // Set initial placeholder image
    setCurrentImageUrl("https://placehold.co/600x400.png?text=Your+AI+Image+Here");
  }, []);

  const handleGeneratePost = async () => {
    if (!description.trim()) {
      setError("Please enter a post description.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setGeneratedPost(null); // Clear previous results
    setCurrentImageUrl("https://placehold.co/600x400.png?text=Generating...");

    try {
      const contentResult = await generatePostContent({ description });
      if (!contentResult || !contentResult.postText) {
        throw new Error("Failed to generate post text.");
      }

      // Use the generated post text as overlay text for the image
      const imageResult = await generatePostImage({
        postDescription: description,
        overlayText: contentResult.postText,
      });

      if (imageResult && imageResult.imageUri) {
        setGeneratedPost({ ...contentResult, imageUri: imageResult.imageUri });
        setEditedText(contentResult.postText);
        setCurrentImageUrl(imageResult.imageUri);
      } else {
        throw new Error("Failed to generate complete post content or image.");
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "An unknown error occurred during generation.");
      setCurrentImageUrl("https://placehold.co/600x400.png?text=Error+Generating");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerateImage = async () => {
    if (!description.trim()) {
      setError("Original description is missing for image regeneration.");
      return;
    }

    let textForImageRegen = editedText.trim();
    if (!textForImageRegen && generatedPost) {
        textForImageRegen = generatedPost.postText.trim();
    }

    if (!textForImageRegen) {
        setError("Please provide text for the image overlay in the 'Post Text' field before regenerating the image.");
        return;
    }

    setIsImageLoading(true);
    setError(null);
    const oldImageUrl = currentImageUrl;
    setCurrentImageUrl("https://placehold.co/600x400.png?text=Regenerating...");

    try {
      const imageResult = await generatePostImage({ 
        postDescription: description,
        overlayText: textForImageRegen
      });
      if (imageResult && imageResult.imageUri) {
        setCurrentImageUrl(imageResult.imageUri);
        if (generatedPost) {
          setGeneratedPost(prev => prev ? {...prev, imageUri: imageResult.imageUri} : null);
        }
      } else {
        throw new Error("Failed to regenerate image.");
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "An unknown error occurred during image regeneration.");
      setCurrentImageUrl(oldImageUrl); // Revert to old image on error
    } finally {
      setIsImageLoading(false);
    }
  };

  const handleDownloadImage = () => {
    if (!currentImageUrl || currentImageUrl.startsWith("https://placehold.co")) {
      setError("No image available to download or image is a placeholder.");
      return;
    }
    const link = document.createElement("a");
    link.href = currentImageUrl;
    const filename = `aetherpost-${platform}-${Date.now()}.png`;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const getPlaceholderDataAiHint = () => {
    switch(platform) {
      case 'instagram': return "lifestyle social";
      case 'facebook': return "community connection";
      case 'x': return "news update";
      default: return "social media";
    }
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <header className="mb-8 text-center">
        <h1 className="text-5xl font-bold text-primary flex items-center justify-center space-x-2">
          <Wand2 size={48} className="text-accent" />
          <span>AetherPost</span>
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">AI-Powered Social Media Content Creation</p>
      </header>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-7xl mx-auto">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center"><Edit3 className="mr-2 h-6 w-6 text-primary" />Create Your Post</CardTitle>
            <CardDescription>Describe your ideal post and let AI do the magic!</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="description" className="text-lg">Post Description</Label>
              <Textarea
                id="description"
                placeholder="e.g., A vibrant post about a new coffee shop opening, highlighting its cozy atmosphere and specialty drinks."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                className="text-base"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="platform" className="text-lg">Social Media Platform</Label>
              <Select value={platform} onValueChange={(value: Platform) => setPlatform(value)}>
                <SelectTrigger id="platform" className="w-full text-base">
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(platformIcons).map((key) => {
                    const pKey = key as Platform;
                    const IconComponent = platformIcons[pKey];
                    return (
                      <SelectItem key={pKey} value={pKey} className="text-base">
                        <div className="flex items-center">
                          <IconComponent className="mr-2 h-5 w-5" />
                          {pKey.charAt(0).toUpperCase() + pKey.slice(1)}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleGeneratePost} disabled={isLoading || isImageLoading} className="w-full text-lg py-6 bg-primary hover:bg-primary/90">
              {isLoading ? (
                <>
                  <RotateCcw className="mr-2 h-5 w-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-5 w-5" />
                  Generate Post
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center"><ImageIcon className="mr-2 h-6 w-6 text-primary" />Post Preview & Edit</CardTitle>
             <CardDescription>Review and refine your AI-generated content.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label className="text-lg mb-2 block">Image Preview ({platform})</Label>
              <div className={`w-full rounded-md border border-dashed border-border overflow-hidden bg-muted/30 ${platformAspectRatios[platform]}`}>
                {isLoading || isImageLoading ? (
                   <Skeleton className={`w-full h-full ${platformAspectRatios[platform]}`} />
                ) : (
                  <Image
                    src={currentImageUrl || `https://placehold.co/600x400.png?text=Your+AI+Image+Here`}
                    alt="Generated post image"
                    width={600}
                    height={platform === 'instagram' ? 600 : (platform === 'facebook' ? 315 : 338) } // Approximate heights for aspect ratios
                    className="object-cover w-full h-full"
                    data-ai-hint={getPlaceholderDataAiHint()}
                    onError={() => setCurrentImageUrl(`https://placehold.co/600x400.png?text=Error+Loading+Image`)}
                    unoptimized={currentImageUrl.startsWith('data:image')} // Prevent optimization for data URIs
                  />
                )}
              </div>
              <div className="mt-4 flex space-x-3">
                <Button onClick={handleRegenerateImage} variant="outline" disabled={isLoading || isImageLoading || !description} className="flex-1">
                  {isImageLoading ? (
                     <>
                      <RotateCcw className="mr-2 h-4 w-4 animate-spin" />
                      Regenerating...
                    </>
                  ) : (
                    <>
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Regenerate Image
                    </>
                  )}
                </Button>
                <Button onClick={handleDownloadImage} variant="outline" disabled={isLoading || isImageLoading || !generatedPost || currentImageUrl.startsWith("https://placehold.co")} className="flex-1">
                  <Download className="mr-2 h-4 w-4" />
                  Download Image
                </Button>
              </div>
            </div>

            {generatedPost || isLoading ? (
              <>
                <div>
                  <Label htmlFor="editedText" className="text-lg">Post Text</Label>
                  {isLoading ? <Skeleton className="h-24 w-full mt-2" /> :
                    <Textarea
                      id="editedText"
                      value={editedText}
                      onChange={(e) => setEditedText(e.target.value)}
                      rows={6}
                      className="mt-2 text-base"
                      placeholder="Generated post text will appear here... This text will be overlaid on the image."
                    />
                  }
                </div>
                <div>
                  <Label className="text-lg">Hashtags</Label>
                  {isLoading ? <Skeleton className="h-8 w-full mt-2" /> :
                  <div className="mt-2 flex flex-wrap gap-2">
                    {generatedPost?.hashtags && generatedPost.hashtags.length > 0 ? (
                      generatedPost.hashtags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-sm bg-accent/20 text-accent-foreground hover:bg-accent/30">{tag}</Badge>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No hashtags generated.</p>
                    )}
                  </div>
                  }
                </div>
              </>
            ) : (
              <div className="text-center py-10 text-muted-foreground">
                <ImageIcon size={48} className="mx-auto mb-2" />
                <p>Your generated post preview will appear here.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

