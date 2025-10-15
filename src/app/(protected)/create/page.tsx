"use client"
import React, { useState } from 'react'
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { api } from '~/trpc/react';
import { useRouter } from 'next/navigation';
import { Label } from '~/components/ui/label';
import { Github, ArrowRight, Info, Layers, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Spinner } from '~/components/ui/spinner';

type FormInput= {
    repoUrl: string;
    projectName: string;
    gitHubToken?: string;
}

const Create = () => {
    const router = useRouter();
    const [isRedirecting, setIsRedirecting] = useState(false);
    const {register, handleSubmit, formState: { errors }}= useForm<FormInput>()
    const createProject= api.project.createProject.useMutation();

    function onSubmit(data: FormInput){
        const {projectName, repoUrl, gitHubToken}= data;
        
        // Validate GitHub URL format
        const githubUrlPattern = /^https:\/\/github\.com\/[\w-]+\/[\w-]+\/?$/;
        if (!githubUrlPattern.test(repoUrl)) {
            toast.error("Invalid GitHub URL", {
                description: "Please enter a valid GitHub repository URL (e.g., https://github.com/owner/repo)"
            });
            return;
        }

        const loadingToast = toast.loading("Setting up workspace...", {
            description: "Analyzing repository and configuring environment"
        });

        createProject.mutate({name: projectName, repoUrl, gitHubToken},{
            onSuccess: () => {
                toast.dismiss(loadingToast);
                toast.success("Workspace launched successfully!", {
                    description: "Your project is ready. Redirecting to dashboard...",
                    icon: <CheckCircle2 className="h-4 w-4" />
                });
                setIsRedirecting(true);
                setTimeout(() => {
                    router.push('/dashboard');
                }, 1000);
            },
            onError: (error) => {
                toast.dismiss(loadingToast);
                console.error("Project creation error:", error);
                const errorMessage = error.message || "Unable to create workspace";
                
                // Check for specific duplicate errors
                let errorTitle = "Workspace creation failed";
                let errorDescription = "Please try again";
                
                if (errorMessage.includes("project with the name")) {
                    errorTitle = "Project name already exists";
                    errorDescription = errorMessage;
                } else if (errorMessage.includes("project accessing this repository")) {
                    errorTitle = "Repository already connected";
                    errorDescription = errorMessage;
                } else if (errorMessage.includes("already exists")) {
                    errorTitle = "Duplicate project detected";
                    errorDescription = errorMessage;
                } else {
                    errorDescription = "Please check your repository URL and try again";
                }
                
                toast.error(errorTitle, {
                    description: errorDescription,
                    duration: 6000
                });
            }
        })
        
        return true;
    }

  return (
    <div className='container mx-auto max-w-6xl px-4 py-12 animate-fade-in relative'>
        {/* Loading Overlay */}
        {(createProject.isPending || isRedirecting) && (
            <div className="fixed inset-0 z-50 loading-overlay flex items-center justify-center">
                <div className="rounded-3xl border border-border bg-card/95 p-8 shadow-2xl backdrop-blur-sm flex flex-col items-center gap-4">
                    <Spinner className="h-8 w-8" />
                    <div className="text-center">
                        <p className="font-semibold">{isRedirecting ? "Redirecting to dashboard..." : "Setting up workspace..."}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                            {isRedirecting ? "Your project is ready" : "Analyzing repository structure"}
                        </p>
                    </div>
                </div>
            </div>
        )}
        
        <div className='grid items-start gap-10 lg:grid-cols-[minmax(0,0.95fr),minmax(0,1fr)]'>
            {/* Left side - Narrative */}
            <div className="space-y-8">
                <div className="space-y-4">
                    <span className="inline-flex items-center rounded-full border border-border/60 bg-accent/40 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-foreground/70">
                        Launch workspace
                    </span>
                    <h1 className='text-3xl font-semibold md:text-4xl'>
                        Connect GitWit to the systems that run your product team.
                    </h1>
                    <p className='max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base'>
                        Bring your repository online to unlock code comprehension, decision logs, and execution analytics. It
                        takes less than five minutes, and we guide you the whole way.
                    </p>
                </div>

                <div className="space-y-4">
                    <div className="flex items-start gap-3 rounded-3xl border border-border/70 bg-card/70 p-5">
                        <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-primary/12 text-primary">
                            <Layers className="h-5 w-5" />
                        </span>
                        <div className="space-y-1">
                            <p className="text-sm font-semibold text-foreground">Stack-aware automation</p>
                            <p className="text-sm text-muted-foreground">We parse architecture, tests, and rituals so every
                                recommendation fits your reality.</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3 rounded-3xl border border-border/70 bg-card/70 p-5">
                        <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-primary/12 text-primary">
                            <ShieldCheck className="h-5 w-5" />
                        </span>
                        <div className="space-y-1">
                            <p className="text-sm font-semibold text-foreground">Security-first setup</p>
                            <p className="text-sm text-muted-foreground">Keep data residency, SSO, and audit requirements satisfied from day one.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right side - Form */}
            <div className="space-y-6 rounded-3xl border border-border/70 bg-card/70 p-6 shadow-lg shadow-primary/5">
                <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">Project intake</p>
                    <h2 className='text-2xl font-semibold'>Repository details</h2>
                    <p className='text-sm text-muted-foreground'>
                        Share a GitHub URL and optional token so GitWit can ingest context and stay within rate limits.
                    </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="projectName">Project name</Label>
                        <Input 
                            id="projectName"
                            {...register('projectName', {required: true})} 
                            placeholder='Growth Platform Refresh' 
                            className="rounded-full border border-border/70 bg-background/80 px-4 py-2 text-sm focus:border-primary focus:shadow-[0_0_0_2px_rgba(240,182,112,0.35)]"
                            required 
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="repoUrl">Repository URL</Label>
                        <Input 
                            id="repoUrl"
                            {...register('repoUrl', {required: true})} 
                            type='url' 
                            placeholder='https://github.com/org/repository' 
                            className="rounded-full border border-border/70 bg-background/80 px-4 py-2 text-sm focus:border-primary focus:shadow-[0_0_0_2px_rgba(240,182,112,0.35)]"
                            required 
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="gitHubToken" className="flex items-center gap-2">
                            GitHub access token
                            <span className="text-xs text-muted-foreground">Optional</span>
                        </Label>
                        <Input 
                            id="gitHubToken"
                            {...register('gitHubToken')} 
                            type="password"
                            placeholder='ghp_xxxxxxxxxxxx' 
                            className="rounded-full border border-border/70 bg-background/80 px-4 py-2 text-sm focus:border-primary focus:shadow-[0_0_0_2px_rgba(240,182,112,0.35)]"
                        />
                        <div className="flex items-start gap-2 rounded-2xl border border-border/60 bg-background/70 p-3 text-xs text-muted-foreground">
                            <Info className="mt-0.5 h-4 w-4 text-primary" />
                            Provide a token to analyze private repositories or to extend API limits during large imports.
                        </div>
                    </div>

                    <Button 
                        type='submit' 
                        className="w-full gap-2 rounded-full transition-all" 
                        size="lg"
                        disabled={createProject.isPending || isRedirecting}
                    >
                        {createProject.isPending ? (
                            <>
                                <Spinner className="h-4 w-4 animate-spin-slow" />
                                Launching workspace…
                            </>
                        ) : isRedirecting ? (
                            <>
                                <CheckCircle2 className="h-4 w-4 animate-success-pulse" />
                                Redirecting…
                            </>
                        ) : (
                            <>
                                Launch workspace
                                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                            </>
                        )}
                    </Button>
                </form>
            </div>
        </div>
    </div>
  )
}

export default Create