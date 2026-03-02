/**
 * Form Page Starter
 * 
 * A narrow centered layout for long-form content and multi-section forms.
 * Best for: registration forms, checkout flows, settings pages, wizards.
 * 
 * Features:
 * - Transparent navigation with secure indicator
 * - Narrow centered content (max 560px)
 * - Section-based form organization
 * - Terms checkbox and submit CTA
 * 
 * @example
 * // Copy this file and customize for your needs
 * // Rename to your-form-name.tsx
 */

"use client"

import {
  Nav,
  Logo,
  Header,
  Section,
  Button,
  TextField,
  TextareaField,
  RadioGroup,
  RadioField,
  Checkbox,
  Link,
} from "@/components/vibezz"

export default function FormPage() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
  }

  return (
    <div className="min-h-screen flex flex-col bg-[var(--background-default-white)] relative">
      {/* Navigation Header - Transparent with secure indicator */}
      <Nav
        variant="transparent"
        className="absolute top-0 left-0 right-0 z-10"
        left={<Logo size="small" />}
        right={<Button>Get started</Button>}
      />

      {/* Main Content - Narrow Centered */}
      <main className="flex-1">
        <form onSubmit={handleSubmit}>
          <div className="max-w-[560px] mx-auto px-4 sm:px-6 md:px-8 pt-[80px] pb-12">
            {/* Page Header */}
            <Header
              title="Form Title"
              subbody="Complete the form below to continue."
            />

            {/* Section 1: Basic Information */}
            <Section size="1">
              <div className="space-y-4">
                <h3 className="text-[18px] leading-[24px] font-semibold md:text-[20px] md:leading-[28px]">
                  Basic information
                </h3>
                <div className="space-y-4">
                  <TextField
                    id="fullname"
                    label="Full name"
                    placeholder="Enter your full name"
                    required
                  />
                  <TextField
                    id="email"
                    label="Email address"
                    placeholder="Enter your email"
                    type="email"
                    required
                  />
                  <TextField
                    id="phone"
                    label="Phone number"
                    placeholder="Enter your phone number"
                    type="tel"
                    required
                  />
                </div>
              </div>
            </Section>

            <hr className="border-[var(--stroke-default)]" />

            {/* Section 2: Preferences */}
            <Section size="1">
              <div className="space-y-4">
                <h3 className="text-[18px] leading-[24px] font-semibold md:text-[20px] md:leading-[28px]">
                  Preferences
                </h3>
                <RadioGroup defaultValue="option1" className="space-y-2" required>
                  <p className="text-[16px] leading-[26px] font-semibold">
                    Select an option
                  </p>
                  <div className="flex flex-col gap-2">
                    <RadioField id="opt1" value="option1" label="Option 1" />
                    <RadioField id="opt2" value="option2" label="Option 2" />
                    <RadioField id="opt3" value="option3" label="Option 3" />
                  </div>
                </RadioGroup>
              </div>
            </Section>

            <hr className="border-[var(--stroke-default)]" />

            {/* Section 3: Additional Details */}
            <Section size="1">
              <div className="space-y-4">
                <h3 className="text-[18px] leading-[24px] font-semibold md:text-[20px] md:leading-[28px]">
                  Additional details
                </h3>
                <TextareaField
                  id="comments"
                  label="Comments"
                  placeholder="Enter any additional information"
                  rows={4}
                />
              </div>
            </Section>

            {/* Terms and Submit */}
            <Section size="1" className="!pt-4">
              <div className="space-y-6">
                <div className="flex gap-3 items-start">
                  <Checkbox id="terms" required />
                  <label
                    htmlFor="terms"
                    className="text-[14px] leading-[20px] font-medium"
                  >
                    I agree to the{" "}
                    <Link href="#" size="small">
                      terms and conditions
                    </Link>{" "}
                    and{" "}
                    <Link href="#" size="small">
                      privacy policy
                    </Link>
                    .
                  </label>
                </div>
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full justify-center"
                >
                  Submit
                </Button>
              </div>
            </Section>
          </div>
        </form>
      </main>
    </div>
  )
}



