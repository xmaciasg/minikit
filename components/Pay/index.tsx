"use client";
import {
  MiniKit,
  tokenToDecimals,
  Tokens,
  PayCommandInput,
} from "@worldcoin/minikit-js";
import { useState } from "react";

// Hardcode recipients
const recipients = [
  { name: "Mauricio Calero", 
    wallet: "0x5660199c29ce99cadade93c80f95f1e7e7d05c57",
    phone: "+593 99 875 9222"}
];

interface SenderDetails {
  name: string;
  whatsapp: string;
  bankAccount: string;
  bankName: string;
  accountType: string;
}

const sendPayment = async (to: string, amount: number, senderDetails: SenderDetails, setStatus: (status: string) => void, setTransactionHash: (hash: string) => void) => {
  try {
    setStatus("Iniciando transacción...");
    const res = await fetch(`/api/initiate-payment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to, amount, senderDetails }),
    });

    const { id, hash } = await res.json();

    console.log(id, hash);
    setTransactionHash(hash);
    setStatus(`Transacción en curso...`);

    const payload: PayCommandInput = {
      reference: id,
      to,
      tokens: [
        {
          symbol: Tokens.WLD,
          token_amount: tokenToDecimals(amount, Tokens.WLD).toString(),
        },
      ],
      description: `Pago a ${recipients.find(r => r.wallet === to)?.name} - Hash: ${hash}`,
    };
    if (MiniKit.isInstalled()) {
      return await MiniKit.commandsAsync.pay(payload);
    }
    return null;
  } catch (error: unknown) {
    console.log("Error sending payment", error);
    return null;
  }
};

export const PayBlock = () => {
  const [selectedRecipient, setSelectedRecipient] = useState(recipients[0].wallet);
  const [amount, setAmount] = useState<number>(0);
  const [senderDetails, setSenderDetails] = useState<SenderDetails>({
    name: "",
    whatsapp: "",
    bankAccount: "",
    bankName: "",
    accountType: "",
  });
  const [status, setStatus] = useState<string>("");
  const [transactionHash, setTransactionHash] = useState<string>("");

  const handlePay = async () => {
    if (!MiniKit.isInstalled()) {
      setStatus("MiniKit no está instalado");
      return;
    }
    if (!amount || amount <= 0) {
      setStatus("Ingresa un monto válido");
      return;
    }
    if (!senderDetails.name || !senderDetails.whatsapp || !senderDetails.bankAccount || !senderDetails.bankName || !senderDetails.accountType) {
      setStatus("Completa todos los datos del remitente");
      return;
    }

    const sendPaymentResponse = await sendPayment(selectedRecipient, amount, senderDetails, setStatus, setTransactionHash);
    const response = sendPaymentResponse?.finalPayload;
    if (!response) {
      setStatus("Error en el pago");
      return;
    }

    if (response.status === "success") {
      const res = await fetch(`/api/confirm-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payload: response }),
      });
      const payment = await res.json();
      if (payment.success) {
        setStatus("Transacción completa");
        // transactionHash already set
      } else {
        setStatus("Pago fallido");
      }
    } else {
      setStatus("Pago cancelado o fallido");
    }
  };

  return (
    <div className="p-4 border rounded">
      <h2 className="text-lg font-bold mb-4">Enviar Pago</h2>
      <div className="mb-4">
        <label className="block mb-2">Destinatario:</label>
        <select
          value={selectedRecipient}
          onChange={(e) => setSelectedRecipient(e.target.value)}
          className="border p-2 w-full"
        >
          {recipients.map((r) => (
            <option key={r.wallet} value={r.wallet}>
              {r.name}
            </option>
          ))}
        </select>
      </div>
      <div className="mb-4">
        <label className="block mb-2">Monto (WLD):</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(parseFloat(e.target.value))}
          className="border p-2 w-full"
          min="0"
          step="0.01"
        />
      </div>
      <div className="mb-4">
        <label className="block mb-2">Nombre:</label>
        <input
          type="text"
          value={senderDetails.name}
          onChange={(e) => setSenderDetails({ ...senderDetails, name: e.target.value })}
          className="border p-2 w-full"
        />
      </div>
      <div className="mb-4">
        <label className="block mb-2">WhatsApp:</label>
        <input
          type="text"
          value={senderDetails.whatsapp}
          onChange={(e) => setSenderDetails({ ...senderDetails, whatsapp: e.target.value })}
          className="border p-2 w-full"
        />
      </div>
      <div className="mb-4">
        <label className="block mb-2">Número de Cuenta Bancaria:</label>
        <input
          type="text"
          value={senderDetails.bankAccount}
          onChange={(e) => setSenderDetails({ ...senderDetails, bankAccount: e.target.value })}
          className="border p-2 w-full"
        />
      </div>
      <div className="mb-4">
        <label className="block mb-2">Nombre del Banco:</label>
        <input
          type="text"
          value={senderDetails.bankName}
          onChange={(e) => setSenderDetails({ ...senderDetails, bankName: e.target.value })}
          className="border p-2 w-full"
        />
      </div>
      <div className="mb-4">
        <label className="block mb-2">Tipo de Cuenta:</label>
        <select
          value={senderDetails.accountType}
          onChange={(e) => setSenderDetails({ ...senderDetails, accountType: e.target.value })}
          className="border p-2 w-full"
        >
          <option value="">Seleccionar</option>
          <option value="ahorros">Ahorros</option>
          <option value="corriente">Corriente</option>
        </select>
      </div>
      <button className="bg-blue-500 text-white p-4 rounded" onClick={handlePay}>
        Enviar Pago
      </button>
      {status && <p className="mt-4">{status}</p>}
      {transactionHash && (
        <div className="mt-4">
          <p>Hash de Transacción: {transactionHash}</p>
          <div className="mt-2">
            {(() => {
              const recipient = recipients.find(r => r.wallet === selectedRecipient);
              return (
                <a
                  href={`https://wa.me/${recipient?.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hash de transacción: ${transactionHash}\n\nDatos del remitente:\nNombre: ${senderDetails.name}\nWhatsApp: ${senderDetails.whatsapp}\nCuenta bancaria: ${senderDetails.bankAccount}\nBanco: ${senderDetails.bankName}\nTipo de cuenta: ${senderDetails.accountType}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-green-500 text-white px-4 py-2 rounded inline-block"
                >
                  Compartir con {recipient?.name}
                </a>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};
