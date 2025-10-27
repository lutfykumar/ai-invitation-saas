-- CreateEnum
CREATE TYPE "public"."category_enum" AS ENUM('wedding', 'meeting', 'birthday', 'holiday');

-- CreateTable
CREATE TABLE "category" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "description" TEXT,
    "slug" TEXT NOT NULL,
    "is_active" BOOLEAN DEFAULT true NOT NULL,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT "category_slug_unique" UNIQUE("slug")
);

-- CreateTable
CREATE TABLE "theme" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "description" TEXT,
    "slug" TEXT NOT NULL,
    "css_variables" TEXT NOT NULL,
    "template_html" TEXT NOT NULL,
    "thumbnail" TEXT,
    "is_active" BOOLEAN DEFAULT true NOT NULL,
    "category_id" UUID NOT NULL,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT "theme_slug_unique" UNIQUE("slug")
);

-- CreateTable
CREATE TABLE "invitation" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "event_date" TIMESTAMP,
    "event_location" TEXT,
    "recipient_email" TEXT,
    "recipient_name" TEXT,
    "sender_name" TEXT,
    "custom_message" TEXT,
    "slug" TEXT NOT NULL,
    "is_published" BOOLEAN DEFAULT false NOT NULL,
    "view_count" INTEGER DEFAULT 0 NOT NULL,
    "user_id" TEXT NOT NULL,
    "category_id" UUID NOT NULL,
    "theme_id" UUID NOT NULL,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT "invitation_slug_unique" UNIQUE("slug")
);

-- CreateTable
CREATE TABLE "invitation_view" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "invitation_id" UUID NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "viewed_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- CreateIndex
CREATE INDEX "invitation_user_id_idx" ON "invitation"("user_id");

-- CreateIndex
CREATE INDEX "invitation_category_id_idx" ON "invitation"("category_id");

-- CreateIndex
CREATE INDEX "invitation_theme_id_idx" ON "invitation"("theme_id");

-- CreateIndex
CREATE INDEX "invitation_slug_idx" ON "invitation"("slug");

-- CreateIndex
CREATE "theme_category_id_idx" ON "theme"("category_id");

-- CreateIndex
CREATE "invitation_view_invitation_id_idx" ON "invitation_view"("invitation_id");

-- AddForeignKey
ALTER TABLE "theme" ADD CONSTRAINT "theme_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "category"("id") ON DELETE restrict ON UPDATE no action;

-- AddForeignKey
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE cascade ON UPDATE no action;

-- AddForeignKey
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "category"("id") ON DELETE restrict ON UPDATE no action;

-- AddForeignKey
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_theme_id_fkey" FOREIGN KEY ("theme_id") REFERENCES "theme"("id") ON DELETE restrict ON UPDATE no action;

-- AddForeignKey
ALTER TABLE "invitation_view" ADD CONSTRAINT "invitation_view_invitation_id_fkey" FOREIGN KEY ("invitation_id") REFERENCES "invitation"("id") ON DELETE cascade ON UPDATE no action;