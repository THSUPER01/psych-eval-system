import { redirect } from "next/navigation"

// Temporary redirect to the psychologist namespace where the real
// configuration page lives. This makes `/dashboard/selection/configuracion`
// functional while keeping the canonical route under `/psychologist`.
export default function Page() {
  redirect("/psychologist/dashboard/selection/configuracion")
}
