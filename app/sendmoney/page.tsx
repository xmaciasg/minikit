import { PayBlock } from "@/components/Pay";

export default function SendMoney() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 gap-y-3 w-full overflow-x-hidden">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Mini App de Pagos</h1>
        <PayBlock />
      </div>
    </main>
  );
}
