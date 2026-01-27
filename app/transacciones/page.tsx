import { TransactionsBlock } from "../../components/Transactions";
import { ClosedNav } from "../../components/Navigation/ClosedNav";

export default function TransactionsPage() {
  return (
    <>
      <ClosedNav />
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Transacciones</h1>
        <TransactionsBlock />
      </div>
    </>
  );
}