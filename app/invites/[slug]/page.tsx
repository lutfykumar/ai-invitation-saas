import { Metadata } from "next"
import { notFound } from "next/navigation"
import { InvitationViewClient } from "@/components/invitation-view-client"
import { getInvitationBySlug } from "@/lib/db/utils"

interface InvitationPageProps {
  params: {
    slug: string
  }
}

export async function generateMetadata(
  { params }: InvitationPageProps
): Promise<Metadata> {
  try {
    const invitation = await getInvitationBySlug(params.slug)

    if (!invitation) {
      return {
        title: "Undangan Tidak Ditemukan",
        description: "Undangan yang Anda cari tidak tersedia.",
      }
    }

    return {
      title: invitation.title,
      description: invitation.content.substring(0, 160) + "...",
      openGraph: {
        title: invitation.title,
        description: invitation.content.substring(0, 160) + "...",
        type: "website",
        url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://invitationai.vercel.app'}/invites/${params.slug}`,
      },
      twitter: {
        card: "summary_large_image",
        title: invitation.title,
        description: invitation.content.substring(0, 160) + "...",
      },
    }
  } catch (error) {
    console.error("Error generating metadata:", error)
    return {
      title: "InvitationAI",
      description: "Buat undangan digital yang menakjubkan dengan AI",
    }
  }
}

export default async function InvitationPage({ params }: InvitationPageProps) {
  try {
    const invitation = await getInvitationBySlug(params.slug)

    if (!invitation) {
      notFound()
    }

    return <InvitationViewClient invitation={invitation} />
  } catch (error) {
    console.error("Error fetching invitation:", error)
    notFound()
  }
}