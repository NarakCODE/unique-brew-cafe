"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { usePublicAnnouncements } from "@/hooks/use-public-announcements"
import {
  trackAnnouncementClick,
  trackAnnouncementView,
} from "@/api/announcement"

export function AnnouncementBar() {
  const { announcements } = usePublicAnnouncements()
  const [dismissed, setDismissed] = useState(false)

  const announcement = useMemo(() => {
    if (!announcements.length) return null

    return [...announcements].sort((a, b) => b.priority - a.priority)[0]
  }, [announcements])

  useEffect(() => {
    if (!announcement?.id || dismissed) return

    trackAnnouncementView(announcement.id).catch(() => {
      // Non-blocking analytics call
    })
  }, [announcement?.id, dismissed])

  if (!announcement || dismissed) {
    return null
  }

  const handleClick = () => {
    trackAnnouncementClick(announcement.id).catch(() => {
      // Non-blocking analytics call
    })
  }

  const renderAction = () => {
    if (!announcement.actionType || announcement.actionType === "none") {
      return null
    }

    if (announcement.actionType === "promo_code" && announcement.actionValue) {
      return (
        <Button
          size="sm"
          variant="secondary"
          onClick={async () => {
            handleClick()
            if (typeof navigator !== "undefined" && navigator.clipboard) {
              try {
                await navigator.clipboard.writeText(announcement.actionValue || "")
              } catch {
                // ignore clipboard failure
              }
            }
          }}
          className="h-7"
        >
          Copy Code
        </Button>
      )
    }

    if (announcement.actionType === "external_url" && announcement.actionValue) {
      return (
        <a
          href={announcement.actionValue}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleClick}
        >
          <Button size="sm" variant="secondary" className="h-7">
            Learn More
          </Button>
        </a>
      )
    }

    if (announcement.actionType === "deep_link" && announcement.actionValue) {
      return (
        <Link href={announcement.actionValue} onClick={handleClick}>
          <Button size="sm" variant="secondary" className="h-7">
            Open
          </Button>
        </Link>
      )
    }

    return null
  }

  return (
    <section className="border-b bg-primary/10">
      <div className="container mx-auto flex items-center justify-between gap-3 px-4 py-2 text-sm sm:px-6 lg:px-8">
        <div className="min-w-0">
          <p className="truncate font-semibold text-foreground">
            {announcement.title}
          </p>
          <p className="hidden truncate text-xs text-muted-foreground md:block">
            {announcement.description}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {renderAction()}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDismissed(true)}
            className="h-7 px-2"
            aria-label="Dismiss announcement"
          >
            Dismiss
          </Button>
        </div>
      </div>
    </section>
  )
}
