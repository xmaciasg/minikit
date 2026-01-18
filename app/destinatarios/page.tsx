import { RecipientsBlock } from "../../components/Recipients";

export default function RecipientsPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Gestión de Destinatarios</h1>
      <RecipientsBlock />
    </div>
  );
}