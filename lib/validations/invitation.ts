import { z } from "zod";

export const createInvitationSchema = z.object({
  title: z.string().min(1, "Judul undangan harus diisi").max(200, "Judul terlalu panjang"),
  content: z.string().min(1, "Konten undangan harus diisi"),
  eventDate: z.string().optional().transform(val => val ? new Date(val) : undefined),
  eventLocation: z.string().optional(),
  recipientEmail: z.string().email("Email tidak valid").optional().or(z.literal("")),
  recipientName: z.string().optional(),
  senderName: z.string().optional(),
  customMessage: z.string().optional(),
  categoryId: z.string().uuid("ID kategori tidak valid"),
  themeId: z.string().uuid("ID tema tidak valid"),
});

export const updateInvitationSchema = createInvitationSchema.partial().extend({
  isPublished: z.boolean().optional(),
});

export const publishInvitationSchema = z.object({
  isPublished: z.boolean(),
});

export type CreateInvitationInput = z.infer<typeof createInvitationSchema>;
export type UpdateInvitationInput = z.infer<typeof updateInvitationSchema>;
export type PublishInvitationInput = z.infer<typeof publishInvitationSchema>;