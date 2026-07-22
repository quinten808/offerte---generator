"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import type { CustomerInput } from "@/app/types/customer";

type CustomerFormProps = {
  initialValues?: CustomerInput;
  submitLabel: string;
  onSubmit: (values: CustomerInput) => void;
};

type FormErrors = Partial<Record<keyof CustomerInput, string>>;

const emptyCustomer: CustomerInput = {
  name: "",
  company: "",
  email: "",
  phone: "",
  streetAndNumber: "",
  postalCode: "",
  city: "",
};

function validate(values: CustomerInput): FormErrors {
  const errors: FormErrors = {};

  if (!values.name.trim()) errors.name = "Vul de naam van de klant in.";
  if (!values.email.trim()) {
    errors.email = "Vul een e-mailadres in.";
  } else if (!/^\S+@\S+\.\S+$/.test(values.email)) {
    errors.email = "Vul een geldig e-mailadres in.";
  }
  if (!values.streetAndNumber.trim()) errors.streetAndNumber = "Vul straat en huisnummer in.";
  if (!values.postalCode.trim()) errors.postalCode = "Vul een postcode in.";
  if (!values.city.trim()) errors.city = "Vul een plaats in.";

  return errors;
}

const fieldClassName = "mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-950 shadow-sm outline-none transition focus:border-blue-700 focus:ring-2 focus:ring-blue-100";

export function CustomerForm({ initialValues = emptyCustomer, submitLabel, onSubmit }: CustomerFormProps) {
  const [values, setValues] = useState<CustomerInput>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});

  function updateField(field: keyof CustomerInput, value: string) {
    setValues((currentValues) => ({ ...currentValues, [field]: value }));
    setErrors((currentErrors) => ({ ...currentErrors, [field]: undefined }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedValues = Object.fromEntries(
      Object.entries(values).map(([key, value]) => [key, value.trim()]),
    ) as CustomerInput;
    const validationErrors = validate(trimmedValues);

    setErrors(validationErrors);
    if (Object.keys(validationErrors).length === 0) {
      onSubmit(trimmedValues);
    }
  }

  return (
    <form className="space-y-6" noValidate onSubmit={handleSubmit}>
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="sm:col-span-2">
          <span className="text-sm font-medium text-slate-700">Naam <span className="text-red-600">*</span></span>
          <input aria-describedby={errors.name ? "name-error" : undefined} aria-invalid={Boolean(errors.name)} className={fieldClassName} name="name" onChange={(event) => updateField("name", event.target.value)} value={values.name} />
          {errors.name && <span className="mt-1.5 block text-sm text-red-700" id="name-error">{errors.name}</span>}
        </label>
        <label className="sm:col-span-2">
          <span className="text-sm font-medium text-slate-700">Bedrijfsnaam <span className="text-slate-400">(optioneel)</span></span>
          <input className={fieldClassName} name="company" onChange={(event) => updateField("company", event.target.value)} value={values.company} />
        </label>
        <label>
          <span className="text-sm font-medium text-slate-700">E-mail <span className="text-red-600">*</span></span>
          <input aria-describedby={errors.email ? "email-error" : undefined} aria-invalid={Boolean(errors.email)} className={fieldClassName} name="email" onChange={(event) => updateField("email", event.target.value)} type="email" value={values.email} />
          {errors.email && <span className="mt-1.5 block text-sm text-red-700" id="email-error">{errors.email}</span>}
        </label>
        <label>
          <span className="text-sm font-medium text-slate-700">Telefoonnummer</span>
          <input className={fieldClassName} name="phone" onChange={(event) => updateField("phone", event.target.value)} type="tel" value={values.phone} />
        </label>
        <label className="sm:col-span-2">
          <span className="text-sm font-medium text-slate-700">Straat en huisnummer <span className="text-red-600">*</span></span>
          <input aria-describedby={errors.streetAndNumber ? "street-error" : undefined} aria-invalid={Boolean(errors.streetAndNumber)} className={fieldClassName} name="streetAndNumber" onChange={(event) => updateField("streetAndNumber", event.target.value)} value={values.streetAndNumber} />
          {errors.streetAndNumber && <span className="mt-1.5 block text-sm text-red-700" id="street-error">{errors.streetAndNumber}</span>}
        </label>
        <label>
          <span className="text-sm font-medium text-slate-700">Postcode <span className="text-red-600">*</span></span>
          <input aria-describedby={errors.postalCode ? "postal-code-error" : undefined} aria-invalid={Boolean(errors.postalCode)} className={fieldClassName} name="postalCode" onChange={(event) => updateField("postalCode", event.target.value)} value={values.postalCode} />
          {errors.postalCode && <span className="mt-1.5 block text-sm text-red-700" id="postal-code-error">{errors.postalCode}</span>}
        </label>
        <label>
          <span className="text-sm font-medium text-slate-700">Plaats <span className="text-red-600">*</span></span>
          <input aria-describedby={errors.city ? "city-error" : undefined} aria-invalid={Boolean(errors.city)} className={fieldClassName} name="city" onChange={(event) => updateField("city", event.target.value)} value={values.city} />
          {errors.city && <span className="mt-1.5 block text-sm text-red-700" id="city-error">{errors.city}</span>}
        </label>
      </div>
      <button className="inline-flex items-center justify-center rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2" type="submit">
        {submitLabel}
      </button>
    </form>
  );
}
