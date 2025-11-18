import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function ProgramLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/login");
  }

  return children;
}
