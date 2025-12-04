import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface DashboardCardProps {
  title: string;
  description: string;
  actionHref: string;
  icon?: string;
}

export function DashboardCard({
  title,
  description,
  actionHref,
  icon,
}: DashboardCardProps) {
  return (
    <Link href={actionHref} className="group">
      <Card className="flex flex-col h-full overflow-hidden border border-gray-200 bg-white shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
        <CardHeader className="pb-3 pt-4 px-4 border-b border-gray-100">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <CardTitle className="text-lg font-bold bg-linear-to-r from-primary to-primary/70 bg-clip-text text-transparent group-hover:from-primary group-hover:to-primary/50">
                {title}
              </CardTitle>
            </div>
            {icon && (
              <div className="text-xl opacity-60 group-hover:opacity-100 transition-opacity">
                {icon}
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col justify-between py-3 px-4">
          <p className="text-sm text-gray-700 leading-relaxed mb-4 group-hover:text-gray-900 transition-colors">
            {description}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-primary group-hover:text-primary/80 transition-colors">
              View →
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
