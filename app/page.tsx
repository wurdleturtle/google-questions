import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import crypto from "crypto";
import LoggedIn from "@/lib/LoggedIn";

async function registerUser(formData: FormData) {
  "use server";
  const email = formData.get("email");
  const password = formData.get("password");

  const emailAlreadyExists = await prisma.user.findUnique({
    where: {
      email: email as string,
    },
  });

  if (emailAlreadyExists) {
    redirect("/");
  }

  if (typeof password !== "string") {
    throw new Error("Password is required and must be a string.");
  }

  const hashedPassword = await hash(password, 10);

  const createUser = await prisma.user.create({
    data: {
      email: email as string,
      password: hashedPassword,
    },
  });

  const sessionToken = crypto.randomUUID();

  const cookieStore = await cookies();
  cookieStore.set("sessionToken", sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
  });

  await prisma.session.create({
    data: {
      token: sessionToken,
      userId: createUser.id,
    },
  });

  if (!createUser) {
    throw new Error("Failed to create user.");
  }

  redirect("/dashboard");
}

export default async function Home() {
  //Check if user is already logged in
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("sessionToken");

  const userId = await LoggedIn(sessionToken?.value ?? null);
  if (userId) {
    redirect("/dashboard");
  }

  return (
    <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start h-screen">
      <h1 className="text-5xl mt-10 mx-auto">Not Google Questions</h1>
      <p className="text-lg mx-auto">A google form, but for one question.</p>
      <div className="flex gap-2 w-50 max-w-xs mx-auto justify-center">
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="default"
              className="mt-4 w-full max-w-xs mx-auto shadow-md"
            >
              Login
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Login</DialogTitle>
              <DialogDescription>Please log in to continue.</DialogDescription>
            </DialogHeader>
            <form className="flex flex-col gap-4 mt-4">
              <div>
                <label
                  htmlFor="email"
                  className="block mb-1 text-sm font-medium"
                >
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="block mb-1 text-sm font-medium"
                >
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  required
                />
              </div>
              <Button type="submit" className="mt-2 w-full">
                Log In
              </Button>
            </form>
          </DialogContent>
        </Dialog>
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="secondary"
              className="mt-4 w-full max-w-xs mx-auto shadow-md"
            >
              Signup
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Signup</DialogTitle>
              <DialogDescription>
                Please create an account to continue.
              </DialogDescription>
            </DialogHeader>
            <form className="flex flex-col gap-4 mt-4" action={registerUser}>
              <div>
                <label
                  htmlFor="email"
                  className="block mb-1 text-sm font-medium"
                >
                  Email
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="block mb-1 text-sm font-medium"
                >
                  Password
                </label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  required
                />
              </div>
              <Button type="submit" className="mt-2 w-full">
                Sign Up
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </main>
  );
}
