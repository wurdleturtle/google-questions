import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import LoggedIn from "@/lib/LoggedIn";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import QuestionsAccordion from "@/components/QuestionsAccordion";

export default async function Dashboard() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("sessionToken");
  const userid = await LoggedIn(sessionToken ? sessionToken.value : null);
  const email = await prisma.user.findUnique({
    where: {
      id: typeof userid === "string" ? userid : undefined,
    },
    select: {
      email: true,
    },
  });
  const questions = await prisma.question.findMany({
    where: {
      userId: typeof userid === "string" ? userid : undefined,
    },
    select: {
      title: true,
      content: true,
      id: true,
    },
  });

  console.log("User ID:", userid);

  async function createQuestion(formData: FormData) {
    "use server";

    const title = formData.get("title");
    const content = formData.get("body");

    if (typeof title !== "string" || typeof content !== "string") {
      throw new Error("Title and content are required.");
    }

    if (typeof userid !== "string") {
      throw new Error("User not authenticated.");
    }

    await prisma.question.create({
      data: {
        title: title,
        content: content,
        userId: userid,
      },
    });

    redirect("/dashboard");
  }

  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-gray-800 pt-24">
      <h1 className="text-2xl font-bold mb-4">Google Questions</h1>
      <p className="text-gray-200">Welcome, {email ? email.email : "Guest"}!</p>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant={"outline"} className="mt-5">
            Create a Question
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogTitle>Create a Question</DialogTitle>
          <form action={createQuestion}>
            <Input
              placeholder="Question Title"
              className="mb-4"
              name="title"
              required
            />
            <Input
              placeholder="Question Body"
              className="mb-4"
              name="body"
              required
            />
            <Input type="submit" value="Create Question" className="mt-4" />
          </form>
        </DialogContent>
      </Dialog>

      <p className="mt-10 text-gray-200 text-lg font-medium">
        Your questions, {email ? email.email : "Guest"}!
      </p>
      <div className="w-full max-w-2xl mt-6">
        <QuestionsAccordion questions={questions} />
      </div>
    </div>
  );
}
