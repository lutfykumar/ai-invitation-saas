import { Suspense } from "react"
import { Plus, Mail, Eye, Palette } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { InvitationsOverview } from "@/components/invitations-overview"
import { RecentInvitations } from "@/components/recent-invitations"

export default function DashboardPage() {
  return (
    <div className="flex-1 flex flex-col gap-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Kelola semua undangan digital Anda dengan AI
          </p>
        </div>
        <Link href="/dashboard/invitations/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Buat Undangan Baru
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Undangan</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div className="text-2xl font-bold">...</div>}>
              <InvitationsOverview />
            </Suspense>
            <p className="text-xs text-muted-foreground">
              +20% dari bulan lalu
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dipublikasi</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              +2 dari minggu lalu
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">
              +180 dari minggu lalu
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tema Aktif</CardTitle>
            <Palette className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">
              3 tema baru
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Invitations */}
      <div className="grid gap-4 md:gap-8 lg:grid-cols-7 xl:grid-cols-8">
        <Card className="lg:col-span-4 xl:col-span-6">
          <CardHeader>
            <CardTitle>Undangan Terbaru</CardTitle>
            <CardDescription>
              Undangan yang baru saja Anda buat atau perbarui
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div>Loading...</div>}>
              <RecentInvitations />
            </Suspense>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 xl:col-span-2">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/dashboard/invitations/new">
              <Button className="w-full justify-start gap-2" variant="outline">
                <Plus className="h-4 w-4" />
                Buat Undangan Baru
              </Button>
            </Link>
            <Link href="/dashboard/invitations">
              <Button className="w-full justify-start gap-2" variant="outline">
                <Mail className="h-4 w-4" />
                Lihat Semua Undangan
              </Button>
            </Link>
            <Link href="/dashboard/themes">
              <Button className="w-full justify-start gap-2" variant="outline">
                <Palette className="h-4 w-4" />
                Kelola Tema
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}