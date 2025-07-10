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

        <Tabs defaultValue="recommendations" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            <TabsTrigger value="settings">Profile Settings</TabsTrigger>
          </TabsList>
          <TabsContent value="recommendations" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Medicine Recommendations</CardTitle>
                <CardDescription>
                  View your past medicine recommendations and their details
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center h-40">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : recommendations.length > 0 ? (
                  <div className="space-y-4">
                    {recommendations.map((rec, index) => (
                      <Card key={index} className="overflow-hidden">
                        <CardHeader className="bg-muted/30 py-3">
                          <div className="flex justify-between items-center">
                            <CardTitle className="text-lg">{rec.condition}</CardTitle>
                            <span className="text-xs text-muted-foreground">
                              {rec.createdAt
                                ? (() => {
                                    if (typeof rec.createdAt === "number") {
                                      // If it's a UNIX timestamp in seconds, convert to ms
                                      const ms = rec.createdAt < 1e12 ? rec.createdAt * 1000 : rec.createdAt;
                                      return new Date(ms).toLocaleDateString();
                                    } else if (typeof rec.createdAt === "string") {
                                      return new Date(rec.createdAt).toLocaleDateString();
                                    } else {
                                      return "N/A";
                                    }
                                  })()
                                : "N/A"}
                            </span>
                          </div>
                        </CardHeader>
                        <CardContent className="py-4">
                          <p className="font-medium mb-2">Symptoms:</p>
                          <p className="text-muted-foreground mb-4">{rec.symptoms}</p>
                          
                          <p className="font-medium mb-2">Severity:</p>
                          <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                            rec.severity === "severe" ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"
                          }`}>
                            {rec.severity || "Normal"}
                          </div>
                          
                          {rec.doctorVisitRecommended && (
                            <div className="mt-4 p-2 bg-blue-50 text-blue-700 text-sm rounded-md">
                              Doctor visit was recommended
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <p className="text-muted-foreground mb-4">You haven&apos;t received any recommendations yet.</p>
                    <Button asChild>
                      <Link href="/#medicine-form">Get Recommendations</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
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