"use client";

import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const errorDescription = getErrorDescription(error);

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[450px]">
        <Card>
          <CardHeader>
            <CardTitle className="text-destructive">Authentication Error</CardTitle>
            <CardDescription>
              There was a problem signing you in.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="rounded-md bg-destructive/10 p-4">
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <p className="text-sm font-medium text-destructive">Error: {error || "Unknown error"}</p>
                  <p className="text-sm text-muted-foreground mt-2">{errorDescription}</p>
                </div>
              </div>
            </div>
            
            <div className="text-sm text-muted-foreground">
              <p>Common solutions:</p>
              <ul className="list-disc pl-5 mt-2">
                <li>Check if you have cookies enabled</li>
                <li>Try using a different browser</li>
                <li>Clear your browser cache and cookies</li>
                <li>Try again later</li>
              </ul>
            </div>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/auth/signin">
                Try Again
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

function getErrorDescription(error: string | null): string {
  switch (error) {
    case "Configuration":
      return "There is a problem with the server configuration. Please contact support.";
    case "AccessDenied":
      return "You do not have permission to sign in.";
    case "Verification":
      return "The verification link may have been used or is no longer valid.";
    case "OAuthSignin":
      return "Error occurred while constructing the authorization URL.";
    case "OAuthCallback":
      return "Error occurred while handling the OAuth callback.";
    case "OAuthCreateAccount":
      return "Could not create OAuth provider account.";
    case "EmailCreateAccount":
      return "Could not create email provider account.";
    case "Callback":
      return "Error occurred during the OAuth callback.";
    case "OAuthAccountNotLinked":
      return "This email is already associated with another account.";
    case "EmailSignin":
      return "Error sending the email verification link.";
    case "CredentialsSignin":
      return "The login credentials provided are invalid.";
    case "SessionRequired":
      return "You must be signed in to access this page.";
    default:
      return "An unexpected error occurred. Please try again later.";
  }
} 