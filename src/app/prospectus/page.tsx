import { ProspectusCard } from "@/app/prospectus/_component/ProspectusCard";

export default function ProspectusPage() {
  const programs = [
    {
      title: "BS-Computer Science",
      program: "computer-science",
      description:
        "A comprehensive program covering core computer science principles, algorithms, data structures, software engineering, and advanced computing theory.",
    },
    {
      title: "BS-Information Technology",
      program: "information-technology",
      description:
        "Focus on IT infrastructure, systems management, networking, cybersecurity, and enterprise technology solutions for modern businesses.",
    },
    {
      title: "BS-Information System",
      program: "information-system",
      description:
        "Blend of business and technology focusing on information systems design, database management, business process improvement, and IT strategy.",
    },
    {
      title: "BS-Computer Application",
      program: "computer-application",
      description:
        "Application-focused program emphasizing software development, mobile applications, web technologies, and practical programming skills.",
    },
  ];

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

      <div className="relative z-10 min-h-screen p-6">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Prospectus
            </h1>
            <p className="text-muted-foreground">
              Download free prospectus and program information for all our
              degree programs
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
            {programs.map((program) => (
              <ProspectusCard
                key={program.program}
                title={program.title}
                description={program.description}
                learnMoreHref={`/prospectus/${program.program}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
