'use client';

import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FormProgressProps {
  currentStep: number;
  steps: { title: string; description: string }[];
}

export default function FormProgress({ currentStep, steps }: FormProgressProps) {
  return (
    <div className="w-full py-6">
      <div className="relative flex justify-between items-center max-w-4xl mx-auto">
        {/* Background Line */}
        <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-border -translate-y-1/2 z-0" />
        
        {/* Active Progress Line */}
        <div
          className="absolute top-1/2 left-0 h-[1.5px] bg-accent -translate-y-1/2 z-0 transition-all duration-500 ease-in-out"
          style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
        />

        {/* Step Circles */}
        {steps.map((step, idx) => {
          const isCompleted = idx < currentStep;
          const isActive = idx === currentStep;

          return (
            <div key={idx} className="relative z-10 flex flex-col items-center">
              <div
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full border text-xs font-bold transition-all duration-300 backdrop-blur-xs",
                  isCompleted
                    ? "border-accent bg-accent text-white shadow-md shadow-accent/15"
                    : isActive
                    ? "border-accent bg-card text-accent ring-4 ring-accent/10 shadow-xs"
                    : "border-border bg-card text-muted-foreground"
                )}
              >
                {isCompleted ? (
                  <Check className="h-4.5 w-4.5 animate-scale-in" />
                ) : (
                  <span>{idx + 1}</span>
                )}
              </div>
              
              {/* Labels - hidden on extra small screens */}
              <div className="absolute top-11 flex flex-col items-center text-center w-24">
                <span
                  className={cn(
                    "text-[10px] font-bold tracking-tight whitespace-nowrap transition-colors duration-300",
                    isActive ? "text-foreground font-black" : isCompleted ? "text-accent" : "text-muted-foreground"
                  )}
                >
                  {step.title}
                </span>
                <span className="hidden md:block text-[9px] font-medium text-muted-foreground/80 mt-0.5 whitespace-nowrap">
                  {step.description}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Visual spacer to prevent content overlapping step labels */}
      <div className="h-8" />
    </div>
  );
}
