import "server-only";

import { z } from "zod";
import { getGeminiClient, getGeminiModel } from "./client";

export async function generateGeminiJson<T>(
  prompt: string,
  schema: z.ZodType<T>
): Promise<T> {
  try {
    const response = await getGeminiClient().models.generateContent({
      model: getGeminiModel(),
      contents: prompt,
      config: {
        temperature: 0.2,
        responseMimeType: "application/json",
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("Gemini returned an empty response.");
    }

    const parsed = JSON.parse(extractJson(text));
    return schema.parse(parsed);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error("Gemini response did not match the expected schema.");
    }

    if (error instanceof SyntaxError) {
      throw new Error("Gemini response was not valid JSON.");
    }

    throw error;
  }
}

function extractJson(text: string): string {
  const trimmed = text.trim();
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) return trimmed;

  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    return trimmed.slice(firstBrace, lastBrace + 1);
  }

  return trimmed;
}

