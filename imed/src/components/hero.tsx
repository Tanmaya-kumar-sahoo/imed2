import { Button } from "@/components/ui/button";
import Link from "next/link";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-background py-24 md:py-32">
      <div className="container px-4 md:px-6">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-12">
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary">
                AI-Powered Medicine Recommendations
              </div>
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                Get intelligent medicine recommendations with IMED
              </h1>
              <p className="max-w-[600px] text-muted-foreground md:text-xl">
                Our AI-powered platform provides personalized medicine recommendations based on your symptoms and health profile.
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg">
                <Link href="#medicine-form">Get Recommendations</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/about">Learn More</Link>
              </Button>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-1 text-muted-foreground">
                <svg
                  className="h-5 w-5 fill-current"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM10 14.17L15.88 8.29L17.3 9.71L10 17L6.83 13.83L8.24 12.42L10 14.17Z"
                  />
                </svg>
                <span>Privacy-focused</span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <svg
                  className="h-5 w-5 fill-current"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM10 14.17L15.88 8.29L17.3 9.71L10 17L6.83 13.83L8.24 12.42L10 14.17Z"
                  />
                </svg>
                <span>Evidence-based</span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <svg
                  className="h-5 w-5 fill-current"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM10 14.17L15.88 8.29L17.3 9.71L10 17L6.83 13.83L8.24 12.42L10 14.17Z"
                  />
                </svg>
                <span>Free access</span>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="relative h-full w-full">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/30 to-blue-700/30 rounded-lg blur-3xl opacity-50"></div>
              <div className="relative bg-card p-8 rounded-lg border shadow-lg">
                <div className="space-y-2 text-center mb-6">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                    <svg
                      className="h-8 w-8 text-primary"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                      ></path>
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold">How it works</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-white">
                      1
                    </div>
                    <div className="ml-4">
                      <h4 className="font-semibold">Enter your symptoms</h4>
                      <p className="text-sm text-muted-foreground">
                        Describe what you're experiencing in detail
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-white">
                      2
                    </div>
                    <div className="ml-4">
                      <h4 className="font-semibold">Add health information</h4>
                      <p className="text-sm text-muted-foreground">
                        Include relevant details about your health
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-white">
                      3
                    </div>
                    <div className="ml-4">
                      <h4 className="font-semibold">Get recommendations</h4>
                      <p className="text-sm text-muted-foreground">
                        Receive evidence-based medicine suggestions
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}