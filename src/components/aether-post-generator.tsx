
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { generatePostContent, type GeneratePostContentInput, type GeneratePostContentOutput } from "@/ai/flows/generate-post-content";
import { generatePostImage, type GeneratePostImageInput } from "@/ai/flows/generate-post-image";
import { generateOverlayHook, type GenerateOverlayHookInput } from "@/ai/flows/generate-overlay-hook";
import { generateTopicSuggestion, type GenerateTopicSuggestionInput } from "@/ai/flows/generate-topic-suggestion";
import { generateVisualDescriptionSuggestion, type GenerateVisualDescriptionSuggestionInput } from "@/ai/flows/generate-visual-description-suggestion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Download, ImageIcon, Instagram, Facebook, Twitter, Edit3, RotateCcw, AlertCircle, Wand2, Info, MessageSquareQuote, Quote, Palette, AlignCenter, Type as TypeIcon, Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";


type Platform = "instagram" | "facebook" | "x";
interface GeneratedPost extends GeneratePostContentOutput {
  imageUri: string;
  hookText: string;
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
  "Illustration",
  "Photography",
  "3D Render",
  "Flat Design",
  "Collage",
  "Animated GIF / Short Clip",
  "Quote Post",
  "Infographic",
  "Carousel / Slider",
  "Before & After",
  "Step-by-Step / How-To",
  "Product Showcase",
  "User-Generated Content",
  "Behind-the-Scenes",
  "Promo / Sale Banner",
  "Event Highlight",
  "Minimalist",
  "Luxury / Premium",
  "Bold & Vibrant",
  "Whimsical / Playful",
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
  "Memes",
];

const overlayFontStyleOptions = [
  "Modern & Clean",
  "Elegant Script",
  "Bold Impactful",
  "Playful Casual",
  "Retro Vintage",
  "Magazine Headline",
  "Handwritten",
  "Futuristic Techy",
  "Minimalist Sans-Serif",
  "Classic Serif",
];

const overlayAlignmentOptions = [
  "Top Left", "Top Center", "Top Right",
  "Middle Left", "Middle Center", "Middle Right",
  "Bottom Left", "Bottom Center", "Bottom Right",
];

const overlayFontSizeOptions = [
  "Small", "Medium",
];


export default function AetherPostGenerator() {
  const [postTopic, setPostTopic] = useState<string>("");
  const [topicSuggestion, setTopicSuggestion] = useState<string | null>(null);
  const [isTopicSuggestionLoading, setIsTopicSuggestionLoading] = useState<boolean>(false);

  const [imageVisualDescription, setImageVisualDescription] = useState<string>("");
  const [visualDescriptionSuggestion, setVisualDescriptionSuggestion] = useState<string | null>(null);
  const [isVisualDescriptionSuggestionLoading, setIsVisualDescriptionSuggestionLoading] = useState<boolean>(false);

  const [aiGeneratedHook, setAiGeneratedHook] = useState<string>("");
  const [niche, setNiche] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [imageType, setImageType] = useState<string>(imageTypeOptions[0]);
  const [postType, setPostType] = useState<string>("");

  const [overlayFontStyle, setOverlayFontStyle] = useState<string>(overlayFontStyleOptions[0]);
  const [overlayAlignment, setOverlayAlignment] = useState<string>(overlayAlignmentOptions[4]); // Middle Center
  const [overlayFontSize, setOverlayFontSize] = useState<string>(overlayFontSizeOptions[1]); // Medium

  const [platform, setPlatform] = useState<Platform>("instagram");
  const [generatedPost, setGeneratedPost] = useState<GeneratedPost | null>(null);
  const [editedPostText, setEditedPostText] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isImageLoading, setIsImageLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string>("");

  useEffect(() => {
    setCurrentImageUrl("https://placehold.co/600x400.png?text=Your+AI+Image+Here");
  }, []);

  // Debounced effect for topic suggestions
  useEffect(() => {
    if (postTopic.trim().length < 3) {
      setTopicSuggestion(null);
      return;
    }

    const handler = setTimeout(async () => {
      setIsTopicSuggestionLoading(true);
      try {
        const result = await generateTopicSuggestion({ partialTopic: postTopic });
        if (result && result.suggestedTopic && result.suggestedTopic.toLowerCase() !== postTopic.toLowerCase()) {
          setTopicSuggestion(result.suggestedTopic);
        } else {
          setTopicSuggestion(null);
        }
      } catch (error) {
        console.error("Failed to fetch topic suggestion:", error);
        setTopicSuggestion(null);
      } finally {
        setIsTopicSuggestionLoading(false);
      }
    }, 1000); // 1-second debounce

    return () => {
      clearTimeout(handler);
      setIsTopicSuggestionLoading(false);
    };
  }, [postTopic]);

  const handlePostTopicKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Tab' && topicSuggestion) {
      event.preventDefault();
      setPostTopic(topicSuggestion);
      setTopicSuggestion(null);
    }
  };

  const applyTopicSuggestion = () => {
    if (topicSuggestion) {
      setPostTopic(topicSuggestion);
      setTopicSuggestion(null);
    }
  };

  // Debounced effect for image visual description suggestions
  useEffect(() => {
    if (imageVisualDescription.trim().length < 3) {
      setVisualDescriptionSuggestion(null);
      return;
    }

    const handler = setTimeout(async () => {
      setIsVisualDescriptionSuggestionLoading(true);
      try {
        const result = await generateVisualDescriptionSuggestion({ partialVisualDescription: imageVisualDescription });
        if (result && result.suggestedVisualDescription && result.suggestedVisualDescription.toLowerCase() !== imageVisualDescription.toLowerCase()) {
          setVisualDescriptionSuggestion(result.suggestedVisualDescription);
        } else {
          setVisualDescriptionSuggestion(null);
        }
      } catch (error) {
        console.error("Failed to fetch visual description suggestion:", error);
        setVisualDescriptionSuggestion(null);
      } finally {
        setIsVisualDescriptionSuggestionLoading(false);
      }
    }, 1000); // 1-second debounce

    return () => {
      clearTimeout(handler);
      setIsVisualDescriptionSuggestionLoading(false);
    };
  }, [imageVisualDescription]);

  const handleVisualDescriptionKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Tab' && visualDescriptionSuggestion) {
      event.preventDefault();
      setImageVisualDescription(visualDescriptionSuggestion);
      setVisualDescriptionSuggestion(null);
    }
  };

  const applyVisualDescriptionSuggestion = () => {
    if (visualDescriptionSuggestion) {
      setImageVisualDescription(visualDescriptionSuggestion);
      setVisualDescriptionSuggestion(null);
    }
  };


  const validateInputs = (isRegeneratingImage = false) => {
    if (!postTopic.trim()) {
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
    setEditedPostText("");
    setAiGeneratedHook("");
    setCurrentImageUrl("https://placehold.co/600x400.png?text=Generating...");

    try {
      const hookInput: GenerateOverlayHookInput = {
        postTopic,
        niche,
        category,
        postType: postType || undefined,
      };
      const hookResult = await generateOverlayHook(hookInput);
      if (!hookResult || !hookResult.hookText) {
        throw new Error("Failed to generate image overlay hook.");
      }
      const currentHookText = hookResult.hookText;
      setAiGeneratedHook(currentHookText);

      const contentInput: GeneratePostContentInput = {
        description: postTopic,
        postType: postType || undefined,
      };
      const contentResult = await generatePostContent(contentInput);
      if (!contentResult || !contentResult.postText) {
        throw new Error("Failed to generate post text.");
      }
      setEditedPostText(contentResult.postText);

      const imageInput: GeneratePostImageInput = {
        imageVisualPrompt: imageVisualDescription,
        overlayText: currentHookText,
        niche,
        category,
        imageType,
        postTopic: postTopic,
        postType: postType || undefined,
        overlayFontStyle: overlayFontStyle || undefined,
        overlayAlignment: overlayAlignment || undefined,
        overlayFontSize: overlayFontSize || undefined,
      };

      const imageResult = await generatePostImage(imageInput);

      if (imageResult && imageResult.imageUri) {
        setGeneratedPost({ ...contentResult, imageUri: imageResult.imageUri, hookText: currentHookText });
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

    setIsImageLoading(true);
    setError(null);
    const oldImageUrl = currentImageUrl;
    setCurrentImageUrl("https://placehold.co/600x400.png?text=Regenerating...");
    let currentHookText = generatedPost?.hookText || aiGeneratedHook;

    try {
      if (!currentHookText) {
        const hookInput: GenerateOverlayHookInput = {
            postTopic,
            niche,
            category,
            postType: postType || undefined,
        };
        const hookResult = await generateOverlayHook(hookInput);
        if (!hookResult || !hookResult.hookText) {
            throw new Error("Failed to regenerate image overlay hook for image regeneration.");
        }
        currentHookText = hookResult.hookText;
        setAiGeneratedHook(currentHookText);
      }

      const imageInput: GeneratePostImageInput = {
        imageVisualPrompt: imageVisualDescription,
        overlayText: currentHookText,
        niche,
        category,
        imageType,
        postTopic: postTopic,
        postType: postType || undefined,
        overlayFontStyle: overlayFontStyle || undefined,
        overlayAlignment: overlayAlignment || undefined,
        overlayFontSize: overlayFontSize || undefined,
      };
      const imageResult = await generatePostImage(imageInput);
      if (imageResult && imageResult.imageUri) {
        setCurrentImageUrl(imageResult.imageUri);
        if (generatedPost) {
          setGeneratedPost(prev => prev ? {...prev, imageUri: imageResult.imageUri, hookText: currentHookText!} : null);
        } else if (editedPostText) { // If there was previous text content but no full generatedPost object yet
          setGeneratedPost({
            postText: editedPostText,
            hashtags: generatedPost?.hashtags || [],
            imageUri: imageResult.imageUri,
            hookText: currentHookText!
          });
        }
      } else {
        throw new Error("Failed to regenerate image.");
      }
    } catch (err)
     {
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
    if (imageVisualDescription) {
        hint = imageVisualDescription.toLowerCase().split(/\s+/).slice(0, 2).join(" ");
    }
    if (!hint && postTopic) {
        hint = postTopic.toLowerCase().split(/\s+/).slice(0, 2).join(" ");
    }
     if (hint.length === 0) {
        if (niche) hint += niche.toLowerCase().split(" ")[0] + " ";
        if (category) hint += category.toLowerCase().split(" ")[0];
    }

    if (hint.trim().length === 0 && platform) {
       switch(platform) {
        case 'instagram': hint = "lifestyle social"; break;
        case 'facebook': hint = "community connect"; break;
        case 'x': hint = "news update"; break;
        default: hint = "social media";
      }
    }
    return hint.trim().split(/\s+/).slice(0, 2).join(" ") || "abstract background";
  }

  return (
    <TooltipProvider>
    <div className="min-h-screen bg-background p-4 md:p-8">
      <header className="mb-6 md:mb-10 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-primary flex items-center justify-center">
          <Wand2 className="h-8 w-8 md:h-10 md:w-10 mr-3 text-accent" />
          <span>AetherPost</span>
        </h1>
        <p className="text-muted-foreground mt-2 text-base md:text-lg">AI-Powered Social Media Content Creation</p>
      </header>

      {error && (
        <Alert variant="destructive" className="mb-6 max-w-3xl mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 md:gap-8 max-w-7xl mx-auto">
        <Card className="shadow-lg lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-xl md:text-2xl flex items-center"><Edit3 className="mr-2 h-5 w-5 md:h-6 md:w-6 text-primary" />Create Your Post</CardTitle>
            <CardDescription>Describe your ideal post and let AI do the magic!</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 md:space-y-6">
            <div className="space-y-1">
              <Label htmlFor="postTopic" className="text-base font-medium flex items-center">
                Post Topic/Idea <span className="text-destructive ml-1">*</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="ml-2 h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">The main theme for your post's text content, hashtags, and AI-generated image hook. Start typing for AI suggestions!</p>
                  </TooltipContent>
                </Tooltip>
              </Label>
              <Textarea
                id="postTopic"
                placeholder="e.g., Grand opening of 'The Cozy Corner' cafe."
                value={postTopic}
                onChange={(e) => { setPostTopic(e.target.value); if (topicSuggestion) setTopicSuggestion(null);}}
                onKeyDown={handlePostTopicKeyDown}
                rows={3}
                required
                className="text-sm"
              />
              {isTopicSuggestionLoading && <p className="text-xs text-muted-foreground mt-1 flex items-center"><Sparkles className="h-3 w-3 mr-1 animate-pulse text-accent" />Loading suggestion...</p>}
              {topicSuggestion && !isTopicSuggestionLoading && (
                <div className="text-xs text-muted-foreground mt-1 p-2 bg-accent/10 rounded-md">
                  Suggestion: <button type="button" className="text-primary hover:underline font-medium" onClick={applyTopicSuggestion}>{topicSuggestion}</button>
                  <span className="ml-1 text-muted-foreground/80">(Press Tab or click to apply)</span>
                </div>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="imageVisualDescription" className="text-base font-medium flex items-center">
                Image Visual Description <span className="text-destructive ml-1">*</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="ml-2 h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">Describe what you want the image to look like. Be specific for best results. Start typing for AI suggestions!</p>
                  </TooltipContent>
                </Tooltip>
              </Label>
              <Textarea
                id="imageVisualDescription"
                placeholder="e.g., A steaming latte art heart on a rustic wooden table, soft morning light, a few coffee beans scattered around."
                value={imageVisualDescription}
                onChange={(e) => { setImageVisualDescription(e.target.value); if (visualDescriptionSuggestion) setVisualDescriptionSuggestion(null);}}
                onKeyDown={handleVisualDescriptionKeyDown}
                rows={3}
                required
                className="text-sm"
              />
              {isVisualDescriptionSuggestionLoading && <p className="text-xs text-muted-foreground mt-1 flex items-center"><Sparkles className="h-3 w-3 mr-1 animate-pulse text-accent" />Loading suggestion...</p>}
              {visualDescriptionSuggestion && !isVisualDescriptionSuggestionLoading && (
                <div className="text-xs text-muted-foreground mt-1 p-2 bg-accent/10 rounded-md">
                  Suggestion: <button type="button" className="text-primary hover:underline font-medium" onClick={applyVisualDescriptionSuggestion}>{visualDescriptionSuggestion}</button>
                  <span className="ml-1 text-muted-foreground/80">(Press Tab or click to apply)</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="niche" className="text-base font-medium">Niche <span className="text-destructive ml-1">*</span></Label>
                <Input
                  id="niche"
                  placeholder="e.g., Food, Travel, Tech"
                  value={niche}
                  onChange={(e) => setNiche(e.target.value)}
                  required
                  className="text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category" className="text-base font-medium">Category <span className="text-destructive ml-1">*</span></Label>
                <Input
                  id="category"
                  placeholder="e.g., Coffee Shop, Mountain Landscape"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                  className="text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="postType" className="text-base font-medium flex items-center">
                  Post Type
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="ml-2 h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">Select the type of post to guide AI for content tone, style, and image hook.</p>
                    </TooltipContent>
                  </Tooltip>
                </Label>
                <Select value={postType} onValueChange={(value: string) => setPostType(value === "---" ? "" : value)}>
                  <SelectTrigger id="postType" className="w-full">
                    <SelectValue placeholder="Select post type (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="---" className="text-muted-foreground">Clear selection</SelectItem>
                    {postTypeOptions.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="imageType" className="text-base font-medium">Image Type <span className="text-destructive ml-1">*</span></Label>
                <Select value={imageType} onValueChange={(value: string) => setImageType(value)}>
                  <SelectTrigger id="imageType" className="w-full">
                    <SelectValue placeholder="Select image type" />
                  </SelectTrigger>
                  <SelectContent>
                    {imageTypeOptions.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />
            <div>
                <h3 className="text-base font-semibold mb-3 flex items-center"><Palette className="mr-2 h-5 w-5 text-primary" />Overlay Text Styling</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="overlayFontStyle" className="text-sm font-medium flex items-center">
                            Font Style
                            <Tooltip>
                                <TooltipTrigger asChild><Info className="ml-1 h-4 w-4 text-muted-foreground cursor-help" /></TooltipTrigger>
                                <TooltipContent><p className="max-w-xs">Suggests a font style for the text on the image.</p></TooltipContent>
                            </Tooltip>
                        </Label>
                        <Select value={overlayFontStyle} onValueChange={setOverlayFontStyle}>
                            <SelectTrigger id="overlayFontStyle" className="w-full">
                                <SelectValue placeholder="Select font style" />
                            </SelectTrigger>
                            <SelectContent>
                                {overlayFontStyleOptions.map((style) => (
                                <SelectItem key={style} value={style}>{style}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="overlayAlignment" className="text-sm font-medium flex items-center">
                            Alignment
                             <Tooltip>
                                <TooltipTrigger asChild><Info className="ml-1 h-4 w-4 text-muted-foreground cursor-help" /></TooltipTrigger>
                                <TooltipContent><p className="max-w-xs">Suggests where the text should be placed on the image.</p></TooltipContent>
                            </Tooltip>
                        </Label>
                        <Select value={overlayAlignment} onValueChange={setOverlayAlignment}>
                            <SelectTrigger id="overlayAlignment" className="w-full">
                                <SelectValue placeholder="Select alignment" />
                            </SelectTrigger>
                            <SelectContent>
                                {overlayAlignmentOptions.map((align) => (
                                <SelectItem key={align} value={align}>{align}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="overlayFontSize" className="text-sm font-medium flex items-center">
                            Font Size
                             <Tooltip>
                                <TooltipTrigger asChild><Info className="ml-1 h-4 w-4 text-muted-foreground cursor-help" /></TooltipTrigger>
                                <TooltipContent><p className="max-w-xs">Suggests a relative size for the text on the image.</p></TooltipContent>
                            </Tooltip>
                        </Label>
                        <Select value={overlayFontSize} onValueChange={setOverlayFontSize}>
                            <SelectTrigger id="overlayFontSize" className="w-full">
                                <SelectValue placeholder="Select font size" />
                            </SelectTrigger>
                            <SelectContent>
                                {overlayFontSizeOptions.map((size) => (
                                <SelectItem key={size} value={size}>{size}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>
            <Separator />


            <div className="space-y-2">
              <Label htmlFor="platform" className="text-base font-medium">Social Media Platform</Label>
              <Select value={platform} onValueChange={(value: Platform) => setPlatform(value)}>
                <SelectTrigger id="platform" className="w-full">
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(platformIcons).map((key) => {
                    const pKey = key as Platform;
                    const IconComponent = platformIcons[pKey];
                    return (
                      <SelectItem key={pKey} value={pKey}>
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

            <Button 
              onClick={handleGeneratePost} 
              disabled={isLoading || isImageLoading || isTopicSuggestionLoading || isVisualDescriptionSuggestionLoading} 
              className="w-full text-base py-3 md:text-lg md:py-4 bg-primary hover:bg-primary/90"
            >
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

        <Card className="shadow-lg lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-xl md:text-2xl flex items-center"><ImageIcon className="mr-2 h-5 w-5 md:h-6 md:w-6 text-primary" />Post Preview &amp; Edit</CardTitle>
             <CardDescription>Review and refine your AI-generated content.</CardDescription>
          </CardHeader>
          <CardContent>
            {(!generatedPost && !isLoading) ? (
              <div className="text-center py-10 text-muted-foreground">
                <ImageIcon size={48} className="mx-auto mb-2" />
                <p>Your generated post preview will appear here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column: Image Preview & Controls */}
                <div className="space-y-4">
                  <Label className="text-base font-medium mb-2 block">Image Preview ({platform})</Label>
                  <div className={`w-full rounded-md border border-dashed border-border overflow-hidden bg-muted/30 ${platformAspectRatios[platform]}`}>
                    {(isLoading && !generatedPost) || isImageLoading ? (
                       <Skeleton className={`w-full h-full ${platformAspectRatios[platform]}`} />
                    ) : (
                      <Image
                        src={currentImageUrl || `https://placehold.co/600x400.png?text=Your+AI+Image+Here`}
                        alt="Generated post image"
                        width={600}
                        height={platform === 'instagram' ? 600 : (platform === 'facebook' ? Math.round(600 / 1.91) : Math.round(600 * 9/16)) }
                        className="object-cover w-full h-full"
                        data-ai-hint={getPlaceholderDataAiHint()}
                        onError={() => setCurrentImageUrl(`https://placehold.co/600x400.png?text=Error+Loading+Image`)}
                        unoptimized={currentImageUrl.startsWith('data:image')}
                      />
                    )}
                  </div>
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                    <Button 
                      onClick={handleRegenerateImage} 
                      variant="outline" 
                      disabled={isLoading || isImageLoading || !imageVisualDescription || !niche || !category || isTopicSuggestionLoading || isVisualDescriptionSuggestionLoading} 
                      className="flex-1"
                    >
                      {isImageLoading ? (
                         <>
                          <RotateCcw className="mr-2 h-4 w-4 animate-spin" />
                          Regenerating...
                        </>
                      ) : (
                        <>
                          <RotateCcw className="mr-2 h-4 w-4" />
                          Regenerate Image &amp; Hook
                        </>
                      )}
                    </Button>
                    <Button onClick={handleDownloadImage} variant="outline" disabled={isLoading || isImageLoading || !generatedPost || currentImageUrl.startsWith("https://placehold.co")} className="flex-1">
                      <Download className="mr-2 h-4 w-4" />
                      Download Image
                    </Button>
                  </div>
                </div>

                {/* Right Column: Generated Hook, Post Text, Hashtags */}
                <div className="space-y-6">
                  {(isLoading && !generatedPost && !aiGeneratedHook) ? <Skeleton className="h-16 w-full" /> :
                    ((generatedPost && generatedPost.hookText) || aiGeneratedHook) && (
                      <div className="p-3 bg-accent/10 rounded-md">
                        <Label className="text-sm font-medium flex items-center text-accent-foreground/80">
                           <Quote className="mr-2 h-4 w-4 text-accent" />
                           AI-Generated Hook (on image):
                        </Label>
                        <p className="text-sm text-accent-foreground mt-1 italic">"{generatedPost?.hookText || aiGeneratedHook}"</p>
                      </div>
                  )}

                  <div>
                    <Label htmlFor="editedPostText" className="text-base font-medium flex items-center">
                      <MessageSquareQuote className="mr-2 h-5 w-5 text-primary" />
                      Generated Post Text
                       <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="ml-2 h-4 w-4 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">This is the main text content for your social media post. You can edit it here. This text is NOT directly on the image.</p>
                          </TooltipContent>
                        </Tooltip>
                    </Label>
                    {(isLoading && !generatedPost) ? <Skeleton className="h-32 w-full mt-2" /> :
                      <Textarea
                        id="editedPostText"
                        value={editedPostText}
                        onChange={(e) => setEditedPostText(e.target.value)}
                        rows={6}
                        className="mt-2 text-sm"
                        placeholder="Edit your generated post content here."
                        disabled={!generatedPost && !isLoading && !editedPostText}
                      />
                    }
                  </div>

                  <div>
                    <Label className="text-base font-medium">Hashtags</Label>
                    {(isLoading && !generatedPost) ? <Skeleton className="h-12 w-full mt-2" /> :
                    <div className="mt-2">
                      {generatedPost?.hashtags && generatedPost.hashtags.length > 0 ? (
                        <p className="text-sm text-muted-foreground p-2 bg-secondary/30 rounded-md break-words">
                          {generatedPost.hashtags.map(tag => `#${tag.replace(/^#/, '')}`).join(' ')}
                        </p>
                      ) : (
                        (generatedPost || editedPostText) && <p className="text-sm text-muted-foreground">No hashtags generated.</p>
                      )}
                    </div>
                    }
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
    </TooltipProvider>
  );
}

    
