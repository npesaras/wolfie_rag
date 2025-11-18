import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface ProgramDetails {
  title: string;
  program: string;
  description: string;
  overview: string;
  keyFeatures: string[];
  careerProspects: string[];
  duration: string;
  units: string;
}

const programData: Record<string, ProgramDetails> = {
  "computer-science": {
    title: "BS-Computer Science",
    program: "computer-science",
    description:
      "A comprehensive program covering core computer science principles, algorithms, data structures, software engineering, and advanced computing theory.",
    overview:
      "Established in 1984, the Department of Computer Science leads in theoretical and practical computing education. With a specialized faculty and continuously improving curriculum, the department has produced professionals holding key roles in academe, industry, and government.",
    keyFeatures: [
      "Advanced algorithms and data structures",
      "Software engineering and design patterns",
      "Artificial intelligence and machine learning basics",
      "Database systems and management",
      "Computer networks and cybersecurity fundamentals",
      "Capstone project with real-world applications",
    ],
    careerProspects: [
      "Software Developer",
      "Systems Architect",
      "AI/ML Engineer",
      "Database Administrator",
      "Solutions Architect",
    ],
    duration: "4 years",
    units: "145 (15)",
  },
  "information-technology": {
    title: "BS-Information Technology",
    program: "information-technology",
    description:
      "Focus on IT infrastructure, systems management, networking, cybersecurity, and enterprise technology solutions for modern businesses.",
    overview:
      "The program aspires for students to develop software applications in desktop, web, mobile and various platforms as well as identify and implement methods and practices to manage data infrastructure in IT. It also covers designing, implementing, and evaluating computer-based systems and processes to meet information technology-based needs of industries.",
    keyFeatures: [
      "Network administration and management",
      "Cybersecurity and information security",
      "Cloud computing and virtualization",
      "IT project management",
      "Enterprise systems and ERP",
      "IT support and service management",
    ],
    careerProspects: [
      "IT Manager",
      "Network Administrator",
      "Security Analyst",
      "Cloud Architect",
      "Systems Administrator",
    ],
    duration: "4 years",
    units: "120",
  },
  "information-system": {
    title: "BS-Information System",
    program: "information-system",
    description:
      "Blend of business and technology focusing on information systems design, database management, business process improvement, and IT strategy.",
    overview:
      "The field of Information Systems is an area of concentration in the computing discipline that complements both Computer Science and Information Technology. Of prime importance is its utility in the conceptualization, design, development and evaluation of the technical systems used in the society.",
    keyFeatures: [
      "Business process analysis and improvement",
      "Database design and management",
      "Systems analysis and requirements gathering",
      "Business intelligence and data analytics",
      "IT strategy and governance",
      "Enterprise resource planning",
    ],
    careerProspects: [
      "Business Analyst",
      "Systems Analyst",
      "Data Analyst",
      "IT Business Manager",
      "Systems Designer",
    ],
    duration: "4 years",
    units: "120",
  },
  "computer-application": {
    title: "BS-Computer Application",
    program: "computer-application",
    description:
      "Application-focused program emphasizing software development, mobile applications, web technologies, and practical programming skills.",
    overview:
      "Understand the design & development of hardware devices and software programs through specialized skills in Embedded System and Internet of Things (IoT). To sharpen the mathematical analysis and produce patentable innovations to cater the demands of Information and Communication Technology (ICT) in helping to solve the emerging and future global problems.",
    keyFeatures: [
      "Web application development",
      "Mobile app development (iOS & Android)",
      "Frontend frameworks and libraries",
      "Backend systems and APIs",
      "User interface and experience design",
      "Application deployment and DevOps",
    ],
    careerProspects: [
      "Web Developer",
      "Mobile App Developer",
      "Full Stack Developer",
      "UI/UX Developer",
      "Application Engineer",
    ],
    duration: "4 years",
    units: "120",
  },
};

interface ProgramPageProps {
  params: Promise<{
    program: string;
  }>;
}

export default async function ProgramPage({ params }: ProgramPageProps) {
  const { program: programKey } = await params;
  const program = programData[programKey];

  if (!program) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Program Not Found
          </h1>
          <Link href="/prospectus">
            <Button>Back to Programs</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Link href="/prospectus" className="inline-flex items-center mb-6">
          <Button variant="ghost" className="pl-0">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Programs
          </Button>
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            {program.title}
          </h1>
          <p className="text-lg text-muted-foreground">{program.description}</p>
        </div>

        {/* Program Info Cards */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-card p-4 rounded-lg border border-border shadow-sm">
            <p className="text-sm text-muted-foreground">Duration</p>
            <p className="text-2xl font-bold text-foreground">
              {program.duration}
            </p>
          </div>
          <div className="bg-card p-4 rounded-lg border border-border shadow-sm">
            <p className="text-sm text-muted-foreground">Program Units</p>
            <p className="text-2xl font-bold text-foreground">
              {program.units}
            </p>
          </div>
        </div>

        {/* Overview Section */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">Overview</h2>
          <p className="text-muted-foreground leading-relaxed">
            {program.overview}
          </p>
        </section>

        {/* Key Features */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Key Features
          </h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {program.keyFeatures.map((feature) => (
              <li
                key={feature}
                className="flex items-start gap-3 bg-card p-3 rounded-lg border border-border"
              >
                <span className="text-primary font-bold mt-1">✓</span>
                <span className="text-muted-foreground">{feature}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Career Prospects */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Career Prospects
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {program.careerProspects.map((career) => (
              <div
                key={career}
                className="bg-card p-3 rounded-lg border border-border text-center"
              >
                <p className="text-muted-foreground text-sm">{career}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <div className="bg-card border border-border rounded-lg p-6 text-center">
          <h3 className="text-xl font-bold text-foreground mb-2">
            Ready to Apply?
          </h3>
          <p className="text-muted-foreground mb-4">
            Start your journey in {program.title}
          </p>
          <Button className="bg-sidebar text-sidebar-foreground hover:bg-sidebar/90">
            Download Prospectus
          </Button>
        </div>
      </div>
    </div>
  );
}
