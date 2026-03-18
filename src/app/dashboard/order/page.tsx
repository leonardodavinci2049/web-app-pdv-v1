import { redirect } from "next/navigation";

export default function SalesPage() {
  // Immediately redirect to the report page
  redirect("/dashboard/sales/panel");
}
