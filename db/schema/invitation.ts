import { pgTable, text, timestamp, boolean, uuid, integer } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const category = pgTable("category", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull().unique(),
    description: text("description"),
    slug: text("slug").notNull().unique(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const theme = pgTable("theme", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    description: text("description"),
    slug: text("slug").notNull().unique(),
    cssVariables: text("css_variables").notNull(), // JSON string for CSS variables
    templateHtml: text("template_html").notNull(), // HTML template structure
    thumbnail: text("thumbnail"), // URL to theme thumbnail
    isActive: boolean("is_active").default(true).notNull(),
    categoryId: uuid("category_id")
        .notNull()
        .references(() => category.id, { onDelete: "restrict" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const invitation = pgTable("invitation", {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    content: text("content").notNull(),
    eventDate: timestamp("event_date"),
    eventLocation: text("event_location"),
    recipientEmail: text("recipient_email"),
    recipientName: text("recipient_name"),
    senderName: text("sender_name"),
    customMessage: text("custom_message"),
    slug: text("slug").notNull().unique(),
    isPublished: boolean("is_published").default(false).notNull(),
    viewCount: integer("view_count").default(0).notNull(),
    userId: text("user_id")
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),
    categoryId: uuid("category_id")
        .notNull()
        .references(() => category.id, { onDelete: "restrict" }),
    themeId: uuid("theme_id")
        .notNull()
        .references(() => theme.id, { onDelete: "restrict" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const invitationView = pgTable("invitation_view", {
    id: uuid("id").primaryKey().defaultRandom(),
    invitationId: uuid("invitation_id")
        .notNull()
        .references(() => invitation.id, { onDelete: "cascade" }),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    viewedAt: timestamp("viewed_at").defaultNow().notNull(),
});

// Relationships for easier querying
export type Category = typeof category.$inferSelect;
export type NewCategory = typeof category.$inferInsert;
export type Theme = typeof theme.$inferSelect;
export type NewTheme = typeof theme.$inferInsert;
export type Invitation = typeof invitation.$inferSelect;
export type NewInvitation = typeof invitation.$inferInsert;
export type InvitationView = typeof invitationView.$inferSelect;
export type NewInvitationView = typeof invitationView.$inferInsert;