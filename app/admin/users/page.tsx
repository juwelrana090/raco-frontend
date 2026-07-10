"use client";
import UsersLayout from "@/modules/users/components/UsersLayout";
import { UsersProvider } from "@/modules/users/contexts/UsersContext";

export default function UsersPage() {
  return (
    <UsersProvider>
      <UsersLayout />
    </UsersProvider>
  );
}
