import { currentUser } from "@clerk/nextjs/server";
import { DashboardCard } from "./_components/DashboardCard";

/**
 * Dashboard home page
 */

export default async function DashboardPage() {
  const user = await currentUser();

  return (
    <div className="relative w-full">
      {/* Improved Dreamy Sky Gradient - Fixed to cover entire page */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(circle at 30% 70%, rgba(173, 216, 230, 0.25), transparent 50%),
            radial-gradient(circle at 70% 30%, rgba(255, 182, 193, 0.3), transparent 50%),
            radial-gradient(circle at 50% 50%, rgba(240, 240, 255, 0.4), transparent 70%)`,
        }}
      />

      {/* Content wrapper with relative positioning */}
      <div className="relative z-10">
        <div className="space-y-10 pb-8">
          {/* Welcome Section */}
          <div className="bg-linear-to-br from-primary/10 to-sidebar/10 rounded-xl p-8 border border-primary/20">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-5xl font-bold text-foreground mb-2">
                  Welcome, {user?.firstName}! 👋
                </h1>
                <p className="text-lg text-muted-foreground">
                  Welcome to the CCS Hub
                </p>
                <p className="text-sm text-muted-foreground/70 mt-3">
                  Explore programs, get AI assistance, and discover resources to
                  enhance your learning journey.
                </p>
              </div>
              <div className="text-7xl opacity-20">🎓</div>
            </div>
          </div>

          {/* Dashboard Cards Grid */}
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-6">
              Quick Access
            </h2>
            <div className="grid gap-6 md:grid-cols-3">
              <DashboardCard
                title="Explore Department Prospectus"
                description="Upgrade your knowledge and skills on innovation with our transformative online programs"
                actionHref="/prospectus"
              />
              <DashboardCard
                title="Ask Wolfie"
                description="Download free resources and tools to help jumpstart your innovation projects"
                actionHref="/wolfie"
              />
              <DashboardCard
                title="Explore CCS Resources"
                description="Join the community and find potential collaborators to bring your ideas to life"
                actionHref="/prospectus"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
