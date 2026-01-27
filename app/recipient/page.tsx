"use client";
import { useState } from "react";
import { ClosedNav } from "../../components/Navigation/ClosedNav";

interface Transaction {
  id: string;
  hash: string;
  senderName: string;
  senderWhatsapp: string;
  senderBankAccount: string;
  senderBankName: string;
  senderAccountType: string;
  amount: number;
  status: string;
  transactionId: string | null;
  recipientCompleted: boolean;
  createdAt: string;
}

export default function RecipientPage() {
  const [wallet, setWallet] = useState("");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTransactions = async () => {
    if (!wallet) {
      alert("Ingresa una wallet");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/transactions/recipient/${wallet}`);
      if (res.ok) {
        const data = await res.json();
        setTransactions(data);
        if (data.length === 0) {
          alert("No hay transacciones para esta wallet");
        }
      } else {
        const error = await res.json();
        alert(`Error: ${error.error || "Error al obtener transacciones"}`);
      }
    } catch (error) {
      console.error(error);
      alert("Error de conexión");
    }
    setLoading(false);
  };

  const markCompleted = async (id: string) => {
    try {
      const res = await fetch(`/api/transactions/${id}/complete`, {
        method: "POST",
      });
      if (res.ok) {
        setTransactions(transactions.map(t => t.id === id ? { ...t, recipientCompleted: true } : t));
      } else {
        alert("Error al marcar como completada");
      }
    } catch (error) {
      console.error(error);
      alert("Error");
    }
  };

  return (
    <>
      <ClosedNav />
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-6">Vista de Destinatario</h1>
      <div className="mb-4">
        <label className="block mb-2">Ingresa tu wallet:</label>
        <input
          type="text"
          value={wallet}
          onChange={(e) => setWallet(e.target.value)}
          className="border p-2 w-full"
          placeholder="0x..."
        />
        <button
          onClick={fetchTransactions}
          className="bg-blue-500 text-white px-4 py-2 mt-2 rounded"
          disabled={loading}
        >
          {loading ? "Cargando..." : "Ver Transacciones"}
        </button>
      </div>
      <div>
        {transactions.map((t) => (
          <div key={t.id} className="border p-4 mb-4 rounded">
            <p><strong>Hash:</strong> {t.hash}</p>
            <p><strong>Remitente:</strong> {t.senderName}</p>
            <p><strong>WhatsApp:</strong> {t.senderWhatsapp}</p>
            <p><strong>Cuenta:</strong> {t.senderBankAccount} ({t.senderAccountType})</p>
            <p><strong>Banco:</strong> {t.senderBankName}</p>
            <p><strong>Monto:</strong> {t.amount} WLD</p>
            <p><strong>Estado:</strong> {t.status}</p>
            <p><strong>Completada:</strong> {t.recipientCompleted ? "Sí" : "No"}</p>
            {t.transactionId && (
              <a
                href={`https://polygonscan.com/tx/${t.transactionId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 underline"
              >
                Ver en Blockchain
              </a>
            )}
            {!t.recipientCompleted && (
              <button
                onClick={() => markCompleted(t.id)}
                className="bg-green-500 text-white px-4 py-2 mt-2 rounded"
              >
                Marcar como Completada
              </button>
            )}
          </div>
        ))}
      </div>
    </>
  );
}