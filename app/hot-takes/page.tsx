import { redirect } from "next/navigation";

export default function HotTakesPage() {
  redirect("/?sort=comments");
}
