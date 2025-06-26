"use client";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface Question {
  id: string;
  title: string;
  content: string;
}

export default function QuestionsAccordion({
  questions,
}: {
  questions: Question[];
}) {
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  return (
    <Accordion type="single" collapsible className="space-y-3">
      {questions.map((q, idx) => (
        <AccordionItem
          key={idx}
          value={`item-${idx}`}
          className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 hover:bg-gray-650 transition-colors duration-200"
        >
          <AccordionTrigger className="text-white hover:text-gray-200 font-medium text-left py-3">
            {q.title}
          </AccordionTrigger>
          <AccordionContent className="text-gray-300 pb-3 pt-1 text-sm leading-relaxed">
            <p>{q.content}</p>
            <Button
              variant={"outline"}
              className="mt-2"
              type="button"
              onClick={async () => {
                await navigator.clipboard.writeText(
                  `${window.location.origin}/q/${q.id}`
                );
                setCopiedIdx(idx);
              }}
            >
              {copiedIdx === idx ? <span>✓ Copied</span> : "Copy Link"}
            </Button>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
