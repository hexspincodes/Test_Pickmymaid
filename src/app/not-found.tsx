import { redirect } from "next/navigation";

// Temporary (307), not permanent: browsers cache a 308 indefinitely, so a
// page that was briefly missing would keep sending visitors home after it
// comes back.
export default function NotFound() {
  redirect("/");
}
