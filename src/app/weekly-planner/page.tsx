
"use client";

import { useState } from 'react';
import { generateWeeklyContentPlan, type GenerateWeeklyContentPlanInput, type GenerateWeeklyContentPlanOutput } from '@/ai/flows/generate-weekly-content-plan';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Wand2, AlertCircle, CalendarCheck2, Edit3, Lightbulb, Type, CheckSquare, Palette, Eye } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import ReactMarkdown from 'react-markdown';

const companyTypeOptions = [
  "B2C (Business-to-Consumer)", 
  "B2B (Business-to-Business)", 
  "Non-profit", 
  "Personal Brand", 
  "E-commerce", 
  "Service Provider", 
  "Local Business",
  "Startup",
  "Educational Institution",
  "Content Creator"
];

const postGoalOptions = [
  "Increase Brand Awareness", 
  "Drive Website Traffic", 
  "Generate Leads", 
  "Boost Engagement", 
  "Promote Product/Service", 
  "Build Community",
  "Educate Audience",
  "Entertain Audience"
];

type DailyPlan = GenerateWeeklyContentPlanOutput['weeklyPlan'][0];

export default function WeeklyPlannerPage() {
  const [companyDescription, setCompanyDescription] = useState('');
  const [companyType, setCompanyType] = useState('');
  const [mainNiche, setMainNiche] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [postGoal, setPostGoal] = useState('');

  const [weeklyPlan, setWeeklyPlan] = useState<DailyPlan[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateInputs = () => {
    if (!companyDescription.trim()) {
      setError("Please enter a Company Description.");
      return false;
    }
    if (!companyType.trim()) {
      setError("Please select a Company Type.");
      return false;
    }
    if (!mainNiche.trim()) {
      setError("Please enter the Main Niche.");
      return false;
    }
    setError(null);
    return true;
  };

  const handleGeneratePlan = async () => {
    if (!validateInputs()) return;

    setIsLoading(true);
    setError(null);
    setWeeklyPlan(null);

    try {
      const input: GenerateWeeklyContentPlanInput = {
        companyDescription,
        companyType,
        mainNiche,
        targetAudience: targetAudience || undefined,
        postGoal: postGoal || undefined,
      };
      const result = await generateWeeklyContentPlan(input);
      if (result && result.weeklyPlan) {
        setWeeklyPlan(result.weeklyPlan);
      } else {
        throw new Error("AI failed to generate a weekly plan. The response was empty or invalid.");
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "An unknown error occurred during plan generation.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <header className="mb-6 md:mb-10 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-primary flex items-center justify-center">
          <CalendarCheck2 className="h-8 w-8 md:h-10 md:w-10 mr-3 text-accent" />
          AI Weekly Content Planner
        </h1>
        <p className="text-muted-foreground mt-2 text-base md:text-lg">
          Let AI craft your 7-day social media strategy!
        </p>
      </header>

      {error && (
        <Alert variant="destructive" className="mb-6 max-w-3xl mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="shadow-lg mb-8">
        <CardHeader>
          <CardTitle className="text-xl md:text-2xl flex items-center">
            <Edit3 className="mr-2 h-5 w-5 md:h-6 md:w-6 text-primary" />
            Tell Us About Your Business
          </CardTitle>
          <CardDescription>Provide details for AI to generate a tailored content plan.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 md:space-y-6">
          <div className="space-y-2">
            <Label htmlFor="companyDescription" className="text-base font-medium">Company Description <span className="text-destructive">*</span></Label>
            <Textarea
              id="companyDescription"
              placeholder="e.g., We are a cozy local bakery specializing in artisanal bread and pastries, using organic ingredients..."
              value={companyDescription}
              onChange={(e) => setCompanyDescription(e.target.value)}
              rows={4}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="companyType" className="text-base font-medium">Company Type <span className="text-destructive">*</span></Label>
              <Select value={companyType} onValueChange={setCompanyType}>
                <SelectTrigger id="companyType">
                  <SelectValue placeholder="Select company type" />
                </SelectTrigger>
                <SelectContent>
                  {companyTypeOptions.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="mainNiche" className="text-base font-medium">Main Niche <span className="text-destructive">*</span></Label>
              <Input
                id="mainNiche"
                placeholder="e.g., Artisanal Bakery, SaaS Solutions, Sustainable Fashion"
                value={mainNiche}
                onChange={(e) => setMainNiche(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="targetAudience" className="text-base font-medium">Target Audience (Optional)</Label>
              <Input
                id="targetAudience"
                placeholder="e.g., Young professionals, Health-conscious families, Small business owners"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="postGoal" className="text-base font-medium">Primary Post Goal (Optional)</Label>
              <Select value={postGoal} onValueChange={setPostGoal}>
                <SelectTrigger id="postGoal">
                  <SelectValue placeholder="Select primary goal for the week" />
                </SelectTrigger>
                <SelectContent>
                  {postGoalOptions.map(goal => (
                    <SelectItem key={goal} value={goal}>{goal}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={handleGeneratePlan} disabled={isLoading} className="w-full text-base py-3 md:text-lg md:py-4 bg-primary hover:bg-primary/90">
            {isLoading ? (
              <>
                <Wand2 className="mr-2 h-5 w-5 animate-spin" />
                Generating Plan...
              </>
            ) : (
              <>
                <Wand2 className="mr-2 h-5 w-5" />
                Generate 7-Day Plan
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(7)].map((_, i) => (
            <Card key={i} className="shadow-md">
              <CardHeader>
                <Skeleton className="h-6 w-1/3 mb-1" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {weeklyPlan && (
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-primary mb-6 text-center">Your 7-Day Content Plan</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {weeklyPlan.map((dayPlan) => (
              <Card key={dayPlan.dayOfWeek} className="shadow-md flex flex-col">
                <CardHeader>
                  <CardTitle className="text-xl text-accent flex items-center">
                     {dayPlan.dayOfWeek}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 flex-grow">
                  <div>
                    <Label className="text-sm font-semibold flex items-center text-muted-foreground"><Lightbulb className="w-4 h-4 mr-2 text-primary/70" />Post Topic</Label>
                    <p className="text-sm">{dayPlan.postTopic}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold flex items-center text-muted-foreground"><Type className="w-4 h-4 mr-2 text-primary/70" />Post Type</Label>
                    <p className="text-sm">{dayPlan.postType}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold flex items-center text-muted-foreground"><Palette className="w-4 h-4 mr-2 text-primary/70" />Niche Focus</Label>
                    <p className="text-sm">{dayPlan.nicheFocus}</p>
                  </div>
                   <div>
                    <Label className="text-sm font-semibold flex items-center text-muted-foreground"><CheckSquare className="w-4 h-4 mr-2 text-primary/70" />Content Outline</Label>
                    <div className="text-sm prose prose-sm max-w-none prose-p:my-0.5 prose-ul:my-1">
                        <ReactMarkdown>{dayPlan.contentOutline}</ReactMarkdown>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold flex items-center text-muted-foreground"><Type className="w-4 h-4 mr-2 text-primary/70" />Suggested Hook (for Image)</Label>
                    <p className="text-sm italic">"{dayPlan.suggestedHook}"</p>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold flex items-center text-muted-foreground"><Eye className="w-4 h-4 mr-2 text-primary/70" />Visual Suggestion</Label>
                    <p className="text-sm">{dayPlan.visualSuggestion}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
