import { TransactionsBlock } from "../../components/Transactions";

export default function TransactionsPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Transacciones</h1>
      <TransactionsBlock />
    </div>
  );
}