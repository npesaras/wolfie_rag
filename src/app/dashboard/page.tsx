import { currentUser } from "@clerk/nextjs/server";
import { DashboardCard } from "./_components/DashboardCard";
import { Input } from "@/components/ui/input";

/**
 * Dashboard home page
 */

export default async function DashboardPage() {
  const user = await currentUser();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Content wrapper */}
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Welcome Section - Header with gradient */}
        <div className="bg-gradient-to-br from-primary/10 to-sidebar/10 rounded-xl p-8 border border-primary/20">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-5xl font-bold text-foreground mb-2">
                Welcome, {user?.firstName}! 👋
              </h1>
              <p className="text-sm text-muted-foreground/70 mt-3">
                Explore programs, get AI assistance, and discover resources to
                enhance your learning journey.
              </p>
            </div>
          </div>
        </div>

        {/* Main Content Panel */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
          {/* Dashboard Cards Grid */}
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-8">
              Quick Access
            </h2>
            <div className="grid gap-6 md:grid-cols-3">
              <DashboardCard
                title="Explore Department Prospectus"
                description="Upgrade your knowledge and skills on innovation with our transformative online programs"
                actionHref="/prospectus"
                icon="📄"
              />
              <DashboardCard
                title="Ask Wolfie"
                description="Get instant answers to your questions and guidance on your coursework from our AI assistant."
                actionHref="/wolfie"
                icon="🐺"
              />
              <DashboardCard
                title="Explore CCS Resources"
                description="Access the digital library, download software tools, and view study guides."
                actionHref="/prospectus"
                icon="📂"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
