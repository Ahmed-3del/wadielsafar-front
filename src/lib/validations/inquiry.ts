import { z } from "zod";
import { SERVICE_TYPES } from "@/lib/constants/service-types";
import { todayIso } from "@/lib/utils/dates";
import { isValidPhone, normalizePhone } from "@/lib/utils/phone";

export const inquiryFormSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.email(),
  // Normalized first, then held to the API's own rule: a length check alone
  // accepted "aaaaaaa" here and "+966 50 123 4567" was refused at the API.
  phone: z
    .string()
    .trim()
    .transform(normalizePhone)
    .refine(isValidPhone, { message: "phone" }),
  service_type: z.enum(SERVICE_TYPES),
  destination: z.number().int().positive().nullable(),
  travel_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    // ISO dates compare as strings, so no parsing and no timezone to get
    // wrong. A trip that starts before today is a typo the API rejects too.
    .refine((value) => value >= todayIso(), { message: "past" })
    .nullable(),
  message: z.string().trim().min(10).max(2000),
});

export type InquiryFormValues = z.infer<typeof inquiryFormSchema>;
