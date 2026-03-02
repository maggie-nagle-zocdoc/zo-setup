/**
 * Default Page Starter
 * 
 * A standard page layout with navigation header and full-width content area.
 * Best for: dashboards, listings, and general content pages.
 * 
 * Features:
 * - Sticky navigation with logo and CTA button
 * - Full-width content area (max 1440px)
 * - Page header with title
 * 
 * @example
 * // Copy this file and customize for your needs
 * // Rename to your-page-name.tsx
 */

"use client"

import {
  Nav,
  Logo,
  Button,
  Header,
  Container,
} from "@/components/vibezz"

export default function DefaultPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--background-default-white)]">
      {/* Navigation Header */}
      <Nav
        sticky={true}
        variant="default"
        left={<Logo size="small" />}
        right={<Button>Get started</Button>}
      />

      {/* Main Content */}
      <main className="flex-1">
        <Container>
          <div className="py-12">
            {/* Page Header */}
            <Header title="Page Title" />

            {/* 
              Add your page content here
              
              Examples:
              - Data tables
              - Card grids
              - List views
              - Dashboard widgets
            */}
            <div className="mt-8">
              {/* Your content goes here */}
            </div>
          </div>
        </Container>
      </main>
    </div>
  )
}



