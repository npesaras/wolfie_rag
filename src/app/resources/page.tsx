import { ResourceCard } from "./_component/ResourceCard";

interface Resource {
  title: string;
  fileId: string;
  code: string;
}

export default function ResourcesPage() {
  const BUCKET_ID = "69400c1500007e51a60a";

  const resources: Resource[] = [
    {
      title: "Application for Advance Credit",
      fileId: "application-for-advance-credit",
      code: "FM-MSU-IIT-RGTR-001",
    },
    {
      title: "Application for Leave of Absence",
      fileId: "application-for-leave-of-absence",
      code: "FM-MSU-IIT-RGTR-002",
    },
    {
      title: "Request Form",
      fileId: "request-form",
      code: "FM-MSU-IIT-RGTR-003",
    },
    {
      title: "OTR and F137A Request Form",
      fileId: "otr-and-f137a-request-form",
      code: "FM-MSU-IIT-RGTR-004",
    },
    {
      title: "Returnees Application Form",
      fileId: "returnees-application-form",
      code: "FM-MSU-IIT-RGTR-005",
    },
    {
      title: "Shifters Application Form",
      fileId: "shifters-application-form",
      code: "FM-MSU-IIT-RGTR-006",
    },
    {
      title: "Promissory Note",
      fileId: "promissory-note",
      code: "FM-MSU-IIT-RGTR-007",
    },
    {
      title: "Academic Load Revision Permit",
      fileId: "academic-load-revision-permit",
      code: "FM-MSU-IIT-RGTR-008",
    },
    {
      title: "Permit to Cross Enroll",
      fileId: "permit-to-cross-enroll",
      code: "FM-MSU-IIT-RGTR-009",
    },
    {
      title: "Request for Validation",
      fileId: "request-for-validation",
      code: "FM-MSU-IIT-RGTR-010",
    },
    {
      title: "Completion",
      fileId: "completion",
      code: "FM-MSU-IIT-RGTR-011",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Content wrapper */}
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header Section - Pink gradient */}
        <div className="bg-gradient-to-br from-primary/10 to-sidebar/10 rounded-xl p-8 border border-primary/20">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            CCS Resources
          </h1>
          <p className="text-muted-foreground">
            Download free worksheets and resources to supercharge your
            innovation process
          </p>
        </div>

        {/* Main Content Panel */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {resources.map((resource) => (
              <ResourceCard
                key={resource.fileId}
                title={resource.title}
                fileId={resource.fileId}
                bucketId={BUCKET_ID}
                code={resource.code}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
