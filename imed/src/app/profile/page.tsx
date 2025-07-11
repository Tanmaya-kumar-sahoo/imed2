"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Redirect if not logged in
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  // Fetch user recommendations
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      setLoading(true);
      fetch("/api/recommendations")
        .then(res => res.json())
        .then(data => {
          setRecommendations(data.recommendations || []);
          setLoading(false);
        })
        .catch(err => {
          console.error("Failed to fetch recommendations", err);
          setRecommendations([]);
          setLoading(false);
        });
    } else if (status === "unauthenticated") {
      setRecommendations([]);
      setLoading(false);
    }
  }, [session, status]);

  // Show loading state while checking authentication or firebase user
  if (status === "loading" || !session) {
    return (
      <div className="container py-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center space-x-4 mb-8">
          {session.user?.image ? (
            <img 
              src={session.user.image} 
              alt={session.user.name || "User"} 
              className="h-16 w-16 rounded-full object-cover" 
            />
          ) : (
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-2xl font-bold text-primary">
                {session.user?.name?.charAt(0) || "U"}
              </span>
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold">{session.user?.name || "User"}</h1>
            <p className="text-muted-foreground">{session.user?.email}</p>
            {session.user?.email === "koushikchodraju008@gmail.com" && (
              <span className="inline-block mt-1 bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground rounded-sm">
                ADMIN
              </span>
            )}
          </div>
        </div>

        {/* Only show Profile Settings tab */}
        <Tabs defaultValue="settings" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="settings">Profile Settings</TabsTrigger>
          </TabsList>
          <TabsContent value="settings" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
                <CardDescription>
                  Manage your account settings and preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium">Personal Information</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Your personal information is managed through your IMED account
                    </p>
                    <div className="grid gap-4">
                      <div>
                        <p className="text-sm font-medium mb-1">Name</p>
                        <p className="text-muted-foreground">{session.user?.name || "Not provided"}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-1">Email</p>
                        <p className="text-muted-foreground">{session.user?.email || "Not provided"}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-medium mb-4">Account Management</h3>
                    <Button variant="destructive" onClick={() => router.push("/auth/signout")}>
                      Sign Out
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 