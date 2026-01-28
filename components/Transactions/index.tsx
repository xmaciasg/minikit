"use client";

import { useState, useEffect } from "react";

interface Transaction {
  id: string;
  hash: string;
  amount: number;
  exchangeRate: number;
  totalUSD: number;
  brokerCommissionUSD: number;
  agentCommissionUSD: number;
  netAmountUSD: number;
  netAmountWLD: number;
  status: string;
  createdAt: string;
  agentId: number | null;
  agentName: string | null;
  recipientId: number;
  recipientName: string;
}

interface Agent {
  id: number;
  name: string;
}

export const TransactionsBlock = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  useEffect(() => {
    // Fetch agents
    fetch("/api/agents")
      .then((res) => res.json())
      .then((data) => {
        setAgents(data);
      });
  }, []);

  useEffect(() => {
    // Fetch transactions based on filters
    const params = new URLSearchParams();
    if (selectedAgent) {
      params.append("agentId", selectedAgent);
    }
    if (startDate) {
      params.append("startDate", startDate);
    }
    if (endDate) {
      params.append("endDate", endDate);
    }

    fetch(`/api/transactions?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setTransactions(data);
      });
  }, [selectedAgent, startDate, endDate]);

  return (
    <div className="p-4 border rounded">
      <h2 className="text-lg font-bold mb-4">Listado de Transacciones</h2>

      <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block mb-2">Agente:</label>
          <select
            value={selectedAgent}
            onChange={(e) => setSelectedAgent(e.target.value)}
            className="border p-2 w-full"
          >
            <option value="">Todos los agentes</option>
            {agents.map((agent) => (
              <option key={agent.id} value={agent.id.toString()}>
                {agent.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-2">Fecha de Inicio:</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border p-2 w-full"
          />
        </div>

        <div>
          <label className="block mb-2">Fecha de Fin:</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border p-2 w-full"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border">
          <thead>
            <tr>
              <th className="py-2 px-4 border">ID</th>
              <th className="py-2 px-4 border">Fecha</th>
              <th className="py-2 px-4 border">Agente</th>
              <th className="py-2 px-4 border">Destinatario</th>
              <th className="py-2 px-4 border">Monto (WLD)</th>
              <th className="py-2 px-4 border">Total (USD)</th>
              <th className="py-2 px-4 border">Broker (USD)</th>
              <th className="py-2 px-4 border">Agente (USD)</th>
              <th className="py-2 px-4 border">Neto (USD)</th>
              <th className="py-2 px-4 border">Neto (WLD)</th>
              <th className="py-2 px-4 border">Estado</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => (
              <tr key={transaction.id}>
                <td className="py-2 px-4 border">{transaction.id}</td>
                <td className="py-2 px-4 border">
                  {new Date(transaction.createdAt).toLocaleString()}
                </td>
                <td className="py-2 px-4 border">
                  {transaction.agentName || "N/A"}
                </td>
                <td className="py-2 px-4 border">{transaction.recipientName}</td>
                <td className="py-2 px-4 border">{transaction.amount}</td>
                <td className="py-2 px-4 border">${transaction.totalUSD.toFixed(2)}</td>
                <td className="py-2 px-4 border text-red-500">
                  -${transaction.brokerCommissionUSD.toFixed(2)}
                </td>
                <td className="py-2 px-4 border text-orange-500">
                  -${transaction.agentCommissionUSD.toFixed(2)}
                </td>
                <td className="py-2 px-4 border text-green-500">
                  ${transaction.netAmountUSD.toFixed(2)}
                </td>
                <td className="py-2 px-4 border">
                  {transaction.netAmountWLD.toFixed(4)}
                </td>
                <td className="py-2 px-4 border">{transaction.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};