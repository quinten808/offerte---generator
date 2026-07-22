export type Customer = {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  streetAndNumber: string;
  postalCode: string;
  city: string;
  createdAt: string;
};

export type CustomerInput = Omit<Customer, "id" | "createdAt">;
