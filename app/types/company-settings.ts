export type CompanySettings = {
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  website: string;
  street: string;
  houseNumber: string;
  postalCode: string;
  city: string;
  country: string;
  chamberOfCommerce: string;
  vatNumber: string;
  iban: string;
  defaultValidityDays: number;
  defaultPaymentTermDays: number;
  defaultVatRate: 0 | 9 | 21;
  defaultClosingText: string;
  terms: string;
  logoDataUrl: string | null;
};

export const defaultCompanySettings: CompanySettings = {
  companyName: "", contactName: "", email: "", phone: "", website: "", street: "", houseNumber: "", postalCode: "", city: "", country: "Nederland", chamberOfCommerce: "", vatNumber: "", iban: "", defaultValidityDays: 14, defaultPaymentTermDays: 14, defaultVatRate: 21, defaultClosingText: "", terms: "", logoDataUrl: null,
};
