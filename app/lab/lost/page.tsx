import type { Metadata } from "next";
import LostPage from "@/components/organisms/LostPage/LostPage";
import "../chrome.css";

// Preview of the redesign's 404. The live site keeps app/not-found.tsx until
// the redesign replaces it; then that file renders <LostPage home="/" />.
export const metadata: Metadata = {
  title: "Lab · Not found",
  robots: { index: false, follow: false },
};

export default function LostPreview() {
  return <LostPage home="/lab/home" />;
}
