"use client";

import {
  MiniKit,
  tokenToDecimals,
  Tokens,
  PayCommandInput,
} from "@worldcoin/minikit-js";
import { useState, useEffect } from "react";
import { isValidAddress } from "../../lib/blockchain";

declare global {
  interface Window {
    MiniKit: any;
  }
}

interface Recipient {
  id: number;
  wallet: string;
  name: string;
  phone: string;
  bankName: string;
  bankAccount: string;
  accountType: string;
}

interface Agent {
  id: number;
  recipientId: number;
  name: string;
  phone: string;
  email?: string;
}

interface SenderDetails {
  name: string;
  whatsapp: string;
  bankAccount: string;
  bankName: string;
  accountType: string;
  dni: string;
}

const sendPayment = async (to: string, amount: number, senderDetails: SenderDetails, recipientName: string, agentId: string | null, exchangeRate: number, brokerCommissionUSD: number, agentCommissionUSD: number, netAmountUSD: number, setStatus: (status: string) => void, setTransactionHash: (hash: string) => void) => {
  try {
    setStatus("Iniciando transacción...");
    const res = await fetch(`/api/initiate-payment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to, amount, senderDetails, agentId, exchangeRate, brokerCommissionUSD, agentCommissionUSD, netAmountUSD }),
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
      description: `Pago a ${recipientName} - Hash: ${hash}`,
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
  // Cotización del momento (WLD → USD) - Se puede integrar con API más adelante
  const [exchangeRate, setExchangeRate] = useState<number>(0);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [selectedRecipient, setSelectedRecipient] = useState<string>("");
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string>("");
  const [selectedToken, setSelectedToken] = useState<'WLD' | 'USDC'>('WLD');
  const [amount, setAmount] = useState<number>(0);
  const [priceError, setPriceError] = useState<string | null>(null);
  const [senderDetails, setSenderDetails] = useState<SenderDetails>({
    name: "",
    whatsapp: "",
    bankAccount: "",
    bankName: "",
    accountType: "",
    dni: "",
  });
  const [status, setStatus] = useState<string>("");
  const [transactionHash, setTransactionHash] = useState<string>("");
  const [transactionId, setTransactionId] = useState<string>("");
  const [walletBalances, setWalletBalances] = useState<{
    WLD: string;
    USDC: string;
  } | null>(null);
  const [walletError, setWalletError] = useState<string | null>(null);
  const [loadingBalances, setLoadingBalances] = useState<boolean>(false);

  // Cálculos de comisión (15% para broker, 5% para agente - solo informativo)
  const brokerCommissionRate = 0.15;
  const agentCommissionRate = 0.05;
  const totalUSD = amount * exchangeRate;
  const brokerCommissionUSD = totalUSD * brokerCommissionRate;
  const agentCommissionUSD = totalUSD * agentCommissionRate;
  // El agente recibe su comisión del broker, no se descuenta del usuario
  const netAmountUSD = totalUSD - brokerCommissionUSD;
  const netAmountWLD = netAmountUSD / exchangeRate;

  useEffect(() => {
    // Fetch precio en tiempo real
    const fetchPrice = async () => {
      try {
        const res = await fetch('/api/price');
        const data = await res.json();
        if (data.price && data.price > 0) {
          setExchangeRate(data.price);
          setPriceError(null);
        } else {
          setPriceError('Error al obtener cotización');
          setExchangeRate(0);
        }
      } catch (err) {
        console.error('Error fetching price:', err);
        setPriceError('Error al obtener cotización');
        setExchangeRate(0);
      }
    };
    fetchPrice();
    // Refresh cada 60 segundos
    const interval = setInterval(fetchPrice, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchWalletBalances = async () => {
    setLoadingBalances(true);
    setWalletError(null);
    try {
      if (MiniKit.isInstalled()) {
        const res = await fetch('/api/nonce');
        const { nonce } = await res.json();
        const { finalPayload } = await MiniKit.commandsAsync.walletAuth({
          nonce: nonce,
          requestId: 'balance-check',
          expirationTime: new Date(Date.now() + 5 * 60 * 1000),
          notBefore: new Date(),
          statement: 'Checking wallet balances.',
        });
        if (finalPayload.status === 'success' && finalPayload.address) {
          const walletAddress = finalPayload.address;
          const apiRes = await fetch(`/api/balances?address=${walletAddress}`);
          if (!apiRes.ok) {
            throw new Error('Failed to fetch balances from API');
          }
          const balances = await apiRes.json();
          setWalletBalances({
            WLD: balances.WLD,
            USDC: balances.USDC,
          });
          setWalletError(null);
        } else {
          throw new Error('Wallet auth failed');
        }
      } else {
        setWalletError('MiniKit no disponible');
        setWalletBalances({
          WLD: '0',
          USDC: '0',
        });
      }
    } catch (err) {
      setWalletError(`Error: ${err instanceof Error ? err.message : 'Desconocido'}`);
      setWalletBalances({
        WLD: '0',
        USDC: '0',
      });
    } finally {
      setLoadingBalances(false);
    }
  };

  useEffect(() => {
    // Fetch recipients from API
    fetch('/api/recipients')
      .then(res => res.json())
      .then(data => {
        setRecipients(data);
        if (data.length > 0) {
          setSelectedRecipient(data[0].wallet);
        }
      })
      .catch(err => console.error('Error fetching recipients:', err));
  }, []);

  useEffect(() => {
    // Fetch agents for selected recipient
    if (selectedRecipient) {
      const recipient = recipients.find(r => r.wallet === selectedRecipient);
      if (recipient) {
        fetch(`/api/agents?recipientId=${recipient.id}`)
          .then(res => res.json())
          .then(data => {
            setAgents(data);
            if (data.length > 0) {
              setSelectedAgent(data[0].id.toString());
            } else {
              setSelectedAgent("");
            }
          })
          .catch(err => console.error('Error fetching agents:', err));
      }
    }
  }, [selectedRecipient, recipients]);

  const handlePay = async () => {
    const selected = recipients.find(r => r.wallet === selectedRecipient);
    if (!selected) {
      setStatus("Por favor selecciona un destinatario");
      return;
    }

    const result = await sendPayment(
      selectedRecipient,
      amount,
      senderDetails,
      selected.name,
      selectedAgent,
      exchangeRate,
      brokerCommissionUSD,
      agentCommissionUSD,
      netAmountUSD,
      setStatus,
      setTransactionHash
    );

    const response = result?.finalPayload;
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
        setTransactionId(payment.transactionId);
      } else {
        setStatus("Pago fallido");
      }
    } else {
      setStatus("Pago cancelado o fallido");
    }
  };

  return (
    <div className="p-4 border rounded w-full overflow-x-hidden">
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
      </ddiv className="flex gap-2 mb-2">
          <button
            onClick={() => {
              setSelectedToken('WLD');
              if (walletBalances?.WLD) {
                const balance = parseFloat(walletBalances.WLD);
                setAmount(balance);
              }
            }}
            className={`flex-1 p-3 rounded font-bold transition-colors ${
              selectedToken === 'WLD'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            WLD {walletBalances?.WLD ? `(${parseFloat(walletBalances.WLD).toFixed(4)})` : ''}
          </button>
          <button
            onClick={() => {
              setSelectedToken('USDC');
              if (walletBalances?.USDC) {
                const balance = parseFloat(walletBalances.USDC);
                setAmount(balance);
              }
            }}
            className={`flex-1 p-3 rounded font-bold transition-colors ${
              selectedToken === 'USDC'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            USDC {walletBalances?.USDC ? `(${parseFloat(walletBalances.USDC).toFixed(4)})` : ''}
          </button>
        </div>
        <button
          onClick={fetchWalletBalances}
          disabled={loadingBalances}
          className="w-full p-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400 text-sm"
        >
          {loadingBalances ? 'Obteniendo saldos...' : 'Obtener Saldos de Wallet'}
        </button>
        {walletError && <p className="mt-2 text-red-500 text-sm">{walletError}</p>}me="border p-2 w-full"
        >
          <option value="WLD">WLD</option>
          <option value="USDC">USDC</option>
        </select>
      </div>

      {agents.length > 0 && (
        <div className="mb-4">
          <label className="block mb-2">Agente:</label>
          <select
            value={selectedAgent}
            onChange={(e) => setSelectedAgent(e.target.value)}
            className="border p-2 w-full"
          >
            {agents.map((agent) => (
              <option key={agent.id} value={agent.id.toString()}>
                {agent.name}
              </option>
            ))}
          </select>
        </div>
      )}
      <div className="mb-4">
        <label className="block mb-2">Monto ({selectedToken}):</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(parseFloat(e.target.value))}
          className="border p-2 w-full"
          min="0"
          step="0.01"
        />
      </div>
      
      {priceError ? (
        <div className="mb-4 p-3 bg-red-100 rounded border border-red-400">
          <p className="text-red-700 font-bold text-center">{priceError}</p>
          <p className="text-red-600 text-xs text-center mt-2">Por favor, intenta nuevamente más tarde o recarga la página</p>
        </div>
      ) : (
        <div className="mb-4 p-3 bg-gray-100 rounded">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold">Cotización del Día</h3>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
            <label className="block">1 {selectedToken} = USD:</label>
            <span className="border p-2 bg-white font-bold text-sm break-all">${selectedToken === 'USDC' ? '1.00000000' : exchangeRate.toFixed(8)}</span>
          </div>
          <div className="text-sm space-y-1">
            <p>Monto en USD: <strong>${totalUSD.toFixed(2)}</strong></p>
            <p className="text-red-500">Comisión (15%): <strong>-${brokerCommissionUSD.toFixed(2)}</strong></p>
            <p className="text-green-500 font-bold">Total a recibir: <strong>${netAmountUSD.toFixed(2)}</strong></p>
            <p className="text-gray-500 text-xs">Equivalente a <strong>{netAmountWLD.toFixed(4)} WLD</strong></p>
          </div>
        </div>
      )}

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
        <label className="block mb-2">DNI:</label>
        <input
          type="text"
          value={senderDetails.dni}
          onChange={(e) => setSenderDetails({ ...senderDetails, dni: e.target.value })}
          className="border p-2 w-full"
          placeholder="Documento de Identidad"
        />
      </div>
      <div className="mb-4">
        <label className="block mb-2">Formas de pago:</label>
        <select
          value={senderDetails.accountType}
          onChange={(e) => setSenderDetails({ ...senderDetails, accountType: e.target.value })}
          className="border p-2 w-full"
        >
          <option value="">Seleccionar</option>
          <option value="ahorros">Cuenta de Ahorros</option>
          <option value="corriente">Cuenta Corriente</option>
          <option value="movil">Efectivo Móvil</option>
        </select>
      </div>
      {senderDetails.accountType === "ahorros" || senderDetails.accountType === "corriente" ? (
        <>
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
              onChange={(e) => setSenderDetails({ ...senderDetails, bankName disabled:bg-gray-400" onClick={handlePay} disabled={priceError !== null || exchangeRate === 0
              className="border p-2 w-full"
            />
          </div>
        </>
      ) : null}
      <button className="bg-blue-500 text-white p-4 rounded w-full font-bold" onClick={handlePay}>
        Enviar Pago
      </button>
      {status && <p className="mt-4 text-center text-sm break-words">{status}</p>}
      {transactionHash && (
        <div className="mt-4 w-full space-y-3">DNI: ${senderDetails.dni}\n
          <div className="p-3 bg-gray-50 rounded break-all">
            <p className="text-xs font-bold mb-1">Hash de Transacción:</p>
            <p className="text-xs">{transactionHash}</p>
          </div>
          <div className="flex flex-col gap-2">
            {(() => {
              const recipient = recipients.find(r => r.wallet === selectedRecipient);
              return (
                <a
                  href={`https://wa.me/${recipient?.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hash de transacción: ${transactionHash}\n\nDatos del remitente:\nNombre: ${senderDetails.name}\nWhatsApp: ${senderDetails.whatsapp}\nCuenta bancaria: ${senderDetails.bankAccount}\nBanco: ${senderDetails.bankName}\nTipo de cuenta: ${senderDetails.accountType}\n\nDatos de la transacción:\nMonto enviado en WLD: ${amount}\nComisión del broker (15%): $${brokerCommissionUSD.toFixed(2)}\nComisión del agente (5%): $${agentCommissionUSD.toFixed(2)} (pagada por el broker)\nTotal a recibir en USD: $${netAmountUSD.toFixed(2)}\nTotal a recibir en WLD: ${netAmountWLD.toFixed(4)}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-green-500 text-white px-4 py-2 rounded text-center w-full break-words"
                >
                  Compartir con {recipient?.name}
                </a>
              );
            })()}
            {transactionId && (
              <a
                href={`https://polygonscan.com/tx/${transactionId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-500 text-white px-4 py-2 rounded text-center w-full break-words"
              >
                Ver en Blockchain
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
