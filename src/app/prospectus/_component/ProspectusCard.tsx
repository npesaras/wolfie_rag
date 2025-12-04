"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export interface ProspectusCardProps {
  title: string;
  description: string;
  learnMoreHref?: string;
  icon?: ReactNode;
}

export function ProspectusCard({
  title,
  description,
  learnMoreHref = "#",
}: ProspectusCardProps) {
  return (
    <Link href={learnMoreHref} className="group">
      <Card className="flex flex-col h-full overflow-hidden border border-gray-200 bg-white shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative">
        <CardHeader className="pb-4 border-b border-gray-100">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <CardTitle className="text-xl font-bold bg-linear-to-r from-primary to-primary/70 bg-clip-text text-transparent group-hover:from-primary group-hover:to-primary/50">
                {title}
              </CardTitle>
              <CardDescription className="text-xs font-semibold text-muted-foreground/70 mt-1">
                Program Information
              </CardDescription>
            </div>
            <div className="text-2xl opacity-60 group-hover:opacity-100 transition-opacity">
              📚
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 py-4 relative">
          <p className="text-sm text-gray-700 leading-relaxed pr-4 pb-12 group-hover:text-gray-900 transition-colors">
            {description}
          </p>

          <div className="absolute bottom-4 left-4 right-4 flex items-center gap-2 text-primary font-medium text-sm group-hover:gap-3 transition-all">
            <span>Learn more</span>
            <span className="transition-transform group-hover:translate-x-1">
              →
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
