"use client";

import { useAppSelector } from "@/store/hooks";
import { CreateTestForm } from "@/components/settings/create-test-form";
import { AdminSubjects } from "@/components/settings/admin-subjects";
import { AdminUsers } from "@/components/settings/admin-users";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SettingsPage() {
  const user = useAppSelector((state) => state.auth.user);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Settings</h1>

      {user?.role === "ADMIN" && (
        <Tabs defaultValue="subjects">
          <TabsList>
            <TabsTrigger value="subjects">Subjects</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
          </TabsList>
          <TabsContent value="subjects" className="pt-4">
            <AdminSubjects />
          </TabsContent>
          <TabsContent value="users" className="pt-4">
            <AdminUsers />
          </TabsContent>
        </Tabs>
      )}

      {user?.role === "TEACHER" && <CreateTestForm />}

      {user?.role === "USER" && (
        <p className="text-sm text-muted-foreground">
          You don&apos;t have access to this section.
        </p>
      )}
    </div>
  );
}
