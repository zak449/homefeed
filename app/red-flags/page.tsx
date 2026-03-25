import { redirect } from "next/navigation";

export default function RedFlagsPage() {
  redirect("/?sort=flags");
}
