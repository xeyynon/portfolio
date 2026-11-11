import type { Metadata } from "next";
import LostPage from "@/components/organisms/LostPage/LostPage";

export const metadata: Metadata = {
  title: "Not found",
};

/** 404 for the whole site: the address was a branch, and it has been pruned. */
export default function NotFound() {
  return <LostPage home="/" />;
}
