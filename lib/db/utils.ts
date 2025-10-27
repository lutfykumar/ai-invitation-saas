import { db } from '@/db';
import { eq, and, desc, sql } from 'drizzle-orm';
import {
  invitation,
  category,
  theme,
  type Invitation,
  type NewInvitation,
  type Category,
  type Theme
} from '@/db';

// Invitation utilities
export async function getUserInvitations(userId: string) {
  return await db
    .select({
      id: invitation.id,
      title: invitation.title,
      content: invitation.content,
      eventDate: invitation.eventDate,
      eventLocation: invitation.eventLocation,
      slug: invitation.slug,
      isPublished: invitation.isPublished,
      viewCount: invitation.viewCount,
      createdAt: invitation.createdAt,
      updatedAt: invitation.updatedAt,
      category: {
        id: category.id,
        name: category.name,
        slug: category.slug,
      },
      theme: {
        id: theme.id,
        name: theme.name,
        slug: theme.slug,
        thumbnail: theme.thumbnail,
      },
    })
    .from(invitation)
    .leftJoin(category, eq(invitation.categoryId, category.id))
    .leftJoin(theme, eq(invitation.themeId, theme.id))
    .where(eq(invitation.userId, userId))
    .orderBy(desc(invitation.createdAt));
}

export async function getInvitationById(id: string) {
  const result = await db
    .select({
      id: invitation.id,
      title: invitation.title,
      content: invitation.content,
      eventDate: invitation.eventDate,
      eventLocation: invitation.eventLocation,
      recipientEmail: invitation.recipientEmail,
      recipientName: invitation.recipientName,
      senderName: invitation.senderName,
      customMessage: invitation.customMessage,
      slug: invitation.slug,
      isPublished: invitation.isPublished,
      viewCount: invitation.viewCount,
      createdAt: invitation.createdAt,
      updatedAt: invitation.updatedAt,
      userId: invitation.userId,
      category: {
        id: category.id,
        name: category.name,
        slug: category.slug,
      },
      theme: {
        id: theme.id,
        name: theme.name,
        slug: theme.slug,
        cssVariables: theme.cssVariables,
        templateHtml: theme.templateHtml,
      },
    })
    .from(invitation)
    .leftJoin(category, eq(invitation.categoryId, category.id))
    .leftJoin(theme, eq(invitation.themeId, theme.id))
    .where(eq(invitation.id, id))
    .limit(1);

  return result[0] || null;
}

export async function getInvitationBySlug(slug: string) {
  const result = await db
    .select({
      id: invitation.id,
      title: invitation.title,
      content: invitation.content,
      eventDate: invitation.eventDate,
      eventLocation: invitation.eventLocation,
      recipientName: invitation.recipientName,
      senderName: invitation.senderName,
      customMessage: invitation.customMessage,
      createdAt: invitation.createdAt,
      category: {
        id: category.id,
        name: category.name,
        slug: category.slug,
      },
      theme: {
        id: theme.id,
        name: theme.name,
        cssVariables: theme.cssVariables,
        templateHtml: theme.templateHtml,
      },
    })
    .from(invitation)
    .leftJoin(category, eq(invitation.categoryId, category.id))
    .leftJoin(theme, eq(invitation.themeId, theme.id))
    .where(and(eq(invitation.slug, slug), eq(invitation.isPublished, true)))
    .limit(1);

  return result[0] || null;
}

export async function createInvitation(data: NewInvitation) {
  const [result] = await db.insert(invitation).values(data).returning();
  return result;
}

export async function updateInvitation(id: string, data: Partial<NewInvitation>) {
  const [result] = await db
    .update(invitation)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(invitation.id, id))
    .returning();
  return result;
}

export async function deleteInvitation(id: string, userId: string) {
  const [result] = await db
    .delete(invitation)
    .where(and(eq(invitation.id, id), eq(invitation.userId, userId)))
    .returning();
  return result;
}

export async function incrementInvitationViewCount(id: string) {
  await db
    .update(invitation)
    .set({
      viewCount: sql`${invitation.viewCount} + 1`
    })
    .where(eq(invitation.id, id));
}

// Category utilities
export async function getCategories() {
  return await db
    .select()
    .from(category)
    .where(eq(category.isActive, true))
    .orderBy(category.name);
}

// Theme utilities
export async function getThemes(categoryId?: string) {
  const query = db
    .select({
      id: theme.id,
      name: theme.name,
      description: theme.description,
      slug: theme.slug,
      thumbnail: theme.thumbnail,
      categoryId: theme.categoryId,
      category: {
        id: category.id,
        name: category.name,
        slug: category.slug,
      },
    })
    .from(theme)
    .leftJoin(category, eq(theme.categoryId, category.id))
    .where(eq(theme.isActive, true));

  if (categoryId) {
    query.where(eq(theme.categoryId, categoryId));
  }

  return await query.orderBy(theme.name);
}

export async function getThemesByCategory(categoryId: string) {
  return await getThemes(categoryId);
}