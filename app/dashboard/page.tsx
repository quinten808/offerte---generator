import Link from "next/link";

const overviewCards = [
  { label: "Klanten", value: "12", description: "klanten in uw overzicht" },
  { label: "Offertes", value: "8", description: "lopende offertes" },
  { label: "Concepten", value: "3", description: "klaar om af te ronden" },
];

export default function DashboardPage() {
  return (
    <>
      <header className="flex flex-col gap-5 border-b border-slate-200 pb-7 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-sm font-medium text-blue-700">Dashboard</p>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Goedemorgen</h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600 sm:text-base">Hier vindt u straks in één oogopslag de voortgang van uw klanten en offertes.</p>
        </div>
        <Link className="inline-flex items-center justify-center rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2" href="/offertes">
          Nieuwe offerte
        </Link>
      </header>

      <section aria-label="Overzicht" className="mt-8 grid gap-4 sm:grid-cols-3">
        {overviewCards.map((card) => (
          <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm" key={card.label}>
            <p className="text-sm font-medium text-slate-600">{card.label}</p>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{card.value}</p>
            <p className="mt-2 text-sm text-slate-500">{card.description}</p>
          </article>
        ))}
      </section>

      <section className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-950">Klaar voor de volgende stap?</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">In de volgende fase kunt u hier klanten toevoegen en offertes opstellen. Deze basis houdt het overzicht alvast rustig en toegankelijk.</p>
      </section>
    </>
  );
}
