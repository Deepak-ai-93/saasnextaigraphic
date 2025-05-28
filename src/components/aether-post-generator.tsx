
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { generatePostContent, type GeneratePostContentInput, type GeneratePostContentOutput } from "@/ai/flows/generate-post-content";
import { generatePostImage, type GeneratePostImageInput } from "@/ai/flows/generate-post-image";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Download, ImageIcon, Instagram, Facebook, Twitter, Edit3, RotateCcw, AlertCircle, Wand2, Info, MessageSquareQuote } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";


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

const imageTypeOptions = [
  "Photography",
  "Illustration",
  "3D Render",
  "Abstract Art",
  "Minimalist Design",
  "Vintage Style",
  "Futuristic Design",
  "Watercolor Art",
  "Cartoon / Comic Style",
  "Pop Art",
  "Surrealism",
  "Graffiti Style",
];

const postTypeOptions = [
  "Tips & Tricks",
  "Educational",
  "Awareness",
  "Promotional",
  "Inspirational",
  "Question / Poll",
  "Behind the Scenes",
  "User-Generated Content Feature",
  "News / Update",
  "Storytelling",
];

export default function AetherPostGenerator() {
  const [postTopic, setPostTopic] = useState<string>("");
  const [imageVisualDescription, setImageVisualDescription] = useState<string>("");
  const [niche, setNiche] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [imageType, setImageType] = useState<string>(imageTypeOptions[0]);
  const [postType, setPostType] = useState<string>("");
  const [platform, setPlatform] = useState<Platform>("instagram");
  const [generatedPost, setGeneratedPost] = useState<GeneratedPost | null>(null);
  const [editedText, setEditedText] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isImageLoading, setIsImageLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string>("");

  useEffect(() => {
    setCurrentImageUrl("https://placehold.co/600x400.png?text=Your+AI+Image+Here");
  }, []);

  const validateInputs = (isRegeneratingImage = false) => {
    if (!isRegeneratingImage && !postTopic.trim()) {
      setError("Please enter a Post Topic/Idea.");
      return false;
    }
    if (!imageVisualDescription.trim()) {
      setError("Please enter an Image Visual Description.");
      return false;
    }
    if (!niche.trim()) {
      setError("Niche is required.");
      return false;
    }
    if (!category.trim()) {
      setError("Category is required.");
      return false;
    }
    setError(null);
    return true;
  };

  const handleGeneratePost = async () => {
    if (!validateInputs()) return;

    setIsLoading(true);
    setError(null);
    setGeneratedPost(null);
    setEditedText("");
    setCurrentImageUrl("https://placehold.co/600x400.png?text=Generating...");

    try {
      const contentInput: GeneratePostContentInput = { 
        description: postTopic,
        postType: postType || undefined, // Pass postType if selected
      };
      const contentResult = await generatePostContent(contentInput);
      if (!contentResult || !contentResult.postText) {
        throw new Error("Failed to generate post text.");
      }
      setEditedText(contentResult.postText);

      const imageInput: GeneratePostImageInput = {
        imageVisualPrompt: imageVisualDescription,
        overlayText: contentResult.postText,
        niche,
        category,
        imageType,
        postTopic: postTopic,
        postType: postType || undefined, // Pass postType if selected
      };

      const imageResult = await generatePostImage(imageInput);

      if (imageResult && imageResult.imageUri) {
        setGeneratedPost({ ...contentResult, imageUri: imageResult.imageUri });
        setCurrentImageUrl(imageResult.imageUri);
      } else {
        throw new Error("Failed to generate image for the post.");
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
    if (!validateInputs(true)) return;

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
      const imageInput: GeneratePostImageInput = {
        imageVisualPrompt: imageVisualDescription,
        overlayText: textForImageRegen,
        niche,
        category,
        imageType,
        postTopic: postTopic,
        postType: postType || undefined, // Pass postType if selected
      };
      const imageResult = await generatePostImage(imageInput);
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
    let hint = "";
    if (imageType) hint += imageType.toLowerCase().split(" ")[0] + " ";
    if (niche) hint += niche.toLowerCase().split(" ")[0] + " ";
    if (postType) hint += postType.toLowerCase().split(" ")[0];
    if (!hint && platform) {
       switch(platform) {
        case 'instagram': hint = "lifestyle social"; break;
        case 'facebook': hint = "community connection"; break;
        case 'x': hint = "news update"; break;
        default: hint = "social media";
      }
    }
    return hint.trim() || "abstract background";
  }

  return (
    <TooltipProvider>
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
              <Label htmlFor="postTopic" className="text-lg flex items-center">
                Post Topic/Idea <span className="text-destructive ml-1">*</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="ml-2 h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">The main theme or subject for your post's text content and hashtags.</p>
                  </TooltipContent>
                </Tooltip>
              </Label>
              <Textarea
                id="postTopic"
                placeholder="e.g., Grand opening of 'The Cozy Corner' cafe."
                value={postTopic}
                onChange={(e) => setPostTopic(e.target.value)}
                rows={3}
                className="text-base"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="imageVisualDescription" className="text-lg flex items-center">
                Image Visual Description <span className="text-destructive ml-1">*</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="ml-2 h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">Describe what you want the image to look like. Be specific for best results.</p>
                  </TooltipContent>
                </Tooltip>
              </Label>
              <Textarea
                id="imageVisualDescription"
                placeholder="e.g., A steaming latte art heart on a rustic wooden table, soft morning light, a few coffee beans scattered around."
                value={imageVisualDescription}
                onChange={(e) => setImageVisualDescription(e.target.value)}
                rows={4}
                className="text-base"
                required
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="niche" className="text-lg">Niche <span className="text-destructive ml-1">*</span></Label>
                <Input
                  id="niche"
                  placeholder="e.g., Food, Travel, Tech"
                  value={niche}
                  onChange={(e) => setNiche(e.target.value)}
                  className="text-base"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category" className="text-lg">Category <span className="text-destructive ml-1">*</span></Label>
                <Input
                  id="category"
                  placeholder="e.g., Coffee Shop, Mountain Landscape"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="text-base"
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="postType" className="text-lg flex items-center">
                  Post Type
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="ml-2 h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">Select the type of post to guide AI for content tone and style.</p>
                    </TooltipContent>
                  </Tooltip>
                </Label>
                <Select value={postType} onValueChange={(value: string) => setPostType(value)}>
                  <SelectTrigger id="postType" className="w-full text-base">
                    <SelectValue placeholder="Select post type (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {postTypeOptions.map((type) => (
                      <SelectItem key={type} value={type} className="text-base">
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="imageType" className="text-lg">Image Type <span className="text-destructive ml-1">*</span></Label>
                <Select value={imageType} onValueChange={(value: string) => setImageType(value)}>
                  <SelectTrigger id="imageType" className="w-full text-base">
                    <SelectValue placeholder="Select image type" />
                  </SelectTrigger>
                  <SelectContent>
                    {imageTypeOptions.map((type) => (
                      <SelectItem key={type} value={type} className="text-base">
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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
                    height={platform === 'instagram' ? 600 : (platform === 'facebook' ? 315 : 338) }
                    className="object-cover w-full h-full"
                    data-ai-hint={getPlaceholderDataAiHint()}
                    onError={() => setCurrentImageUrl(`https://placehold.co/600x400.png?text=Error+Loading+Image`)}
                    unoptimized={currentImageUrl.startsWith('data:image')}
                  />
                )}
              </div>
              <div className="mt-4 flex space-x-3">
                <Button onClick={handleRegenerateImage} variant="outline" disabled={isLoading || isImageLoading || !imageVisualDescription || !niche || !category} className="flex-1">
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
                  <Label htmlFor="editedText" className="text-lg flex items-center">
                    Post Text (Overlay on Image)
                     <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="ml-2 h-4 w-4 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">This text will be overlaid on the generated image. You can edit it here. Regenerate the image to see changes.</p>
                        </TooltipContent>
                      </Tooltip>
                  </Label>
                  {isLoading && !generatedPost ? <Skeleton className="h-24 w-full mt-2" /> :
                    <Textarea
                      id="editedText"
                      value={editedText}
                      onChange={(e) => setEditedText(e.target.value)}
                      rows={6}
                      className="mt-2 text-base"
                      placeholder="This text will be overlaid on the image. Edit if needed."
                    />
                  }
                </div>
                <div>
                  <Label className="text-lg">Hashtags</Label>
                  {isLoading && !generatedPost ? <Skeleton className="h-8 w-full mt-2" /> :
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
    </TooltipProvider>
  );
}
