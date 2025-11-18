import { Card } from "@/components/ui/card";

export default function Features() {
  return (
    <section>
      <div className="bg-muted/50 py-24">
        <div className="mx-auto max-w-5xl px-6">
          <div>
            <h2 className="text-foreground text-4xl font-semibold">
              Your Academic Support Hub
            </h2>
            <p className="text-muted-foreground mb-12 mt-4 text-balance text-lg">
              Access everything you need for academic success - from 24/7 AI
              assistance to comprehensive resources, faculty directories, and
              institutional knowledge.
            </p>
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 md:mt-16 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-4">
              <Card className="aspect-video overflow-hidden px-6 flex items-center justify-center bg-purple-50 dark:bg-purple-900/20">
                <svg
                  className="w-12 h-12 text-purple-600 dark:text-purple-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </Card>
              <div className="sm:max-w-sm">
                <h3 className="text-foreground text-xl font-semibold">
                  24/7 Chat Assistant
                </h3>
                <p className="text-muted-foreground my-4 text-lg">
                  Get instant answers to your questions anytime. Our AI
                  assistant is available round the clock to help with
                  coursework, campus information, and academic guidance.
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <Card className="aspect-video overflow-hidden p-6 flex items-center justify-center bg-orange-50 dark:bg-orange-900/20">
                <svg
                  className="w-12 h-12 text-orange-600 dark:text-orange-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </Card>
              <div className="sm:max-w-sm">
                <h3 className="text-foreground text-xl font-semibold">
                  Download College Prospectus
                </h3>
                <p className="text-muted-foreground my-4 text-lg">
                  Access comprehensive college brochures, course catalogs, and
                  program details. Download official prospectuses for all CCS
                  programs and departments.
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <Card className="aspect-video overflow-hidden p-6 flex items-center justify-center bg-blue-50 dark:bg-blue-900/20">
                <svg
                  className="w-12 h-12 text-blue-600 dark:text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </Card>
              <div className="sm:max-w-sm">
                <h3 className="text-foreground text-xl font-semibold">
                  Access CCS Knowledge Base
                </h3>
                <p className="text-muted-foreground my-4 text-lg">
                  Explore our comprehensive database of academic resources,
                  course materials, research papers, and institutional knowledge
                  curated for CCS students.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
