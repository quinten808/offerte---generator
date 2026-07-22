"use client";

import { useSyncExternalStore } from "react";
import { getCustomers, getServerCustomers, subscribeToCustomers } from "@/app/lib/customer-storage";

export function useCustomers() {
  return useSyncExternalStore(subscribeToCustomers, getCustomers, getServerCustomers);
}
