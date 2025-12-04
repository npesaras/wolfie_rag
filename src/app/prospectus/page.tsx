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
    <div className="min-h-screen bg-slate-50">
      {/* Content wrapper */}
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header Section - Pink gradient */}
        <div className="bg-gradient-to-br from-primary/10 to-sidebar/10 rounded-xl p-8 border border-primary/20">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Prospectus
          </h1>
          <p className="text-muted-foreground">
            Download free prospectus and program information for all our
            degree programs
          </p>
        </div>

        {/* Main Content Panel */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
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
