import { LoaderOne } from "@/components/ui/loader";

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <LoaderOne />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}
