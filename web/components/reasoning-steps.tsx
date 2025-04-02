import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StepUpdate {
  type: "reasoning_step";
  title: string;
  content: string;
  nextStep: "continue" | "finalAnswer";
}

interface ReasoningStepsProps {
  steps: StepUpdate[];
  className?: string;
}

export function ReasoningSteps({ steps, className }: ReasoningStepsProps) {
  if (steps.length === 0) return null;

  return (
    <div className={cn("space-y-4", className)}>
      <h3 className="text-lg font-semibold">Reasoning Steps</h3>
      <div className="space-y-3">
        {steps.map((step, index) => (
          <Card
            key={index}
            className={cn(
              "border",
              step.nextStep === "finalAnswer"
                ? "border-green-500"
                : "border-blue-200"
            )}
          >
            <CardHeader className="py-3">
              <CardTitle className="text-sm font-medium">
                {step.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="py-2">
              <p className="text-sm whitespace-pre-wrap">{step.content}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
