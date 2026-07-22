import type { Customer, CustomerInput } from "@/app/types/customer";

const storageKey = "offertegenerator.customers.v1";
const serverCustomers: Customer[] = [];
const invalidCustomers: Customer[] = [];

const initialCustomers: Customer[] = [
  {
    id: "klant-jan-de-vries",
    name: "Jan de Vries",
    company: "De Vries Onderhoud",
    email: "jan@devriesonderhoud.nl",
    phone: "06 12345678",
    streetAndNumber: "Lindelaan 12",
    postalCode: "1234 AB",
    city: "Utrecht",
    createdAt: "2026-07-01T09:00:00.000Z",
  },
  {
    id: "klant-sophie-jansen",
    name: "Sophie Jansen",
    company: "",
    email: "sophie.jansen@example.nl",
    phone: "06 23456789",
    streetAndNumber: "Parkstraat 48",
    postalCode: "3512 KK",
    city: "Utrecht",
    createdAt: "2026-07-05T09:00:00.000Z",
  },
  {
    id: "klant-bakery-bakker",
    name: "Mark Bakker",
    company: "Bakkerij De Molen",
    email: "mark@bakkerijdemolen.nl",
    phone: "030 7654321",
    streetAndNumber: "Molenweg 7",
    postalCode: "3701 BC",
    city: "Zeist",
    createdAt: "2026-07-10T09:00:00.000Z",
  },
];

let cachedCustomers: Customer[] | null = null;
let cachedStorageValue: string | null | undefined;

function isBrowser() {
  return typeof window !== "undefined";
}

function writeCustomers(customers: Customer[]) {
  if (isBrowser()) {
    const serializedCustomers = JSON.stringify(customers);
    cachedCustomers = customers;
    cachedStorageValue = serializedCustomers;
    window.localStorage.setItem(storageKey, serializedCustomers);
    window.dispatchEvent(new Event("customers-changed"));
  }
}

export function subscribeToCustomers(callback: () => void) {
  const handleStorageChange = (event: StorageEvent) => {
    if (event.key === storageKey) callback();
  };

  window.addEventListener("customers-changed", callback);
  window.addEventListener("storage", handleStorageChange);

  // Startgegevens worden pas na de eerste render vastgelegd. Daardoor blijft
  // getSnapshot tijdens renderen een pure, stabiele leesfunctie.
  if (window.localStorage.getItem(storageKey) === null) {
    writeCustomers(initialCustomers);
  }

  return () => {
    window.removeEventListener("customers-changed", callback);
    window.removeEventListener("storage", handleStorageChange);
  };
}

export function getServerCustomers(): Customer[] {
  return serverCustomers;
}

export function getCustomers(): Customer[] {
  if (!isBrowser()) {
    return serverCustomers;
  }

  const storedCustomers = window.localStorage.getItem(storageKey);

  if (storedCustomers === cachedStorageValue && cachedCustomers !== null) {
    return cachedCustomers;
  }

  if (storedCustomers === null) {
    cachedStorageValue = null;
    cachedCustomers = initialCustomers;
    return initialCustomers;
  }

  try {
    const customers: unknown = JSON.parse(storedCustomers);
    cachedStorageValue = storedCustomers;
    cachedCustomers = Array.isArray(customers) ? (customers as Customer[]) : invalidCustomers;
    return cachedCustomers;
  } catch {
    cachedStorageValue = storedCustomers;
    cachedCustomers = invalidCustomers;
    return cachedCustomers;
  }
}

export function getCustomer(id: string): Customer | undefined {
  return getCustomers().find((customer) => customer.id === id);
}

export function createCustomer(input: CustomerInput): Customer {
  const newCustomer: Customer = {
    ...input,
    id: window.crypto?.randomUUID?.() ?? `klant-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  const customers = [...getCustomers(), newCustomer];
  writeCustomers(customers);
  return newCustomer;
}

export function updateCustomer(id: string, input: CustomerInput): Customer | undefined {
  const customers = getCustomers();
  const existingCustomer = customers.find((customer) => customer.id === id);

  if (!existingCustomer) {
    return undefined;
  }

  const updatedCustomer = { ...existingCustomer, ...input };
  writeCustomers(customers.map((customer) => (customer.id === id ? updatedCustomer : customer)));
  return updatedCustomer;
}

export function deleteCustomer(id: string): boolean {
  const customers = getCustomers();
  const remainingCustomers = customers.filter((customer) => customer.id !== id);

  if (remainingCustomers.length === customers.length) {
    return false;
  }

  writeCustomers(remainingCustomers);
  return true;
}
