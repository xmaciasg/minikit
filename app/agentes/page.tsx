import { AgentsBlock } from "../../components/Agents";
import { ClosedNav } from "../../components/Navigation/ClosedNav";

export default function AgentsPage() {
  return (
    <>
      <ClosedNav />
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Gestión de Agentes</h1>
        <AgentsBlock />
      </div>
    </>
  );
}