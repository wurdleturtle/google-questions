import LoggedIn from "@/lib/LoggedIn";
import { cookies } from "next/headers";

export default async function Dashboard() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("sessionToken");
  const userid = await LoggedIn(sessionToken ? sessionToken.value : null);

  console.log("User ID:", userid);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-800">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <p className="text-gray-200">Welcome, {userid}!</p>
    </div>
  );
}
