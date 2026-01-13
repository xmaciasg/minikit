"use client";

import { useState, useEffect } from "react";

interface Agent {
  id: number;
  recipientId: number;
  name: string;
  phone: string;
  email?: string;
}

interface Recipient {
  id: number;
  name: string;
  wallet: string;
  phone: string;
}

export const AgentsBlock = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [selectedRecipient, setSelectedRecipient] = useState<number | "">("");
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
  });
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);

  useEffect(() => {
    // Fetch recipients
    fetch("/api/recipients")
      .then((res) => res.json())
      .then((data) => {
        setRecipients(data);
        if (data.length > 0) {
          setSelectedRecipient(data[0].id);
        }
      });
  }, []);

  useEffect(() => {
    if (selectedRecipient) {
      // Fetch agents for selected recipient
      fetch(`/api/agents?recipientId=${selectedRecipient}`)
        .then((res) => res.json())
        .then((data) => setAgents(data));
    }
  }, [selectedRecipient]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedRecipient) {
      alert("Please select a recipient");
      return;
    }

    const agentData = {
      recipientId: selectedRecipient,
      ...formData,
    };

    if (editingAgent) {
      // Update agent
      const response = await fetch(`/api/agents?id=${editingAgent.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(agentData),
      });

      if (response.ok) {
        const updatedAgent = await response.json();
        setAgents(
          agents.map((agent) =>
            agent.id === updatedAgent.id ? updatedAgent : agent
          )
        );
        setEditingAgent(null);
      }
    } else {
      // Create agent
      const response = await fetch("/api/agents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(agentData),
      });

      if (response.ok) {
        const newAgent = await response.json();
        setAgents([...agents, newAgent]);
      }
    }

    setFormData({ name: "", phone: "", email: "" });
  };

  const handleEdit = (agent: Agent) => {
    setEditingAgent(agent);
    setFormData({
      name: agent.name,
      phone: agent.phone,
      email: agent.email || "",
    });
  };

  const handleDelete = async (id: number) => {
    const response = await fetch(`/api/agents?id=${id}`, {
      method: "DELETE",
    });

    if (response.ok) {
      setAgents(agents.filter((agent) => agent.id !== id));
    }
  };

  return (
    <div className="p-4 border rounded">
      <h2 className="text-lg font-bold mb-4">Gestionar Agentes</h2>

      <div className="mb-4">
        <label className="block mb-2">Seleccionar Destinatario:</label>
        <select
          value={selectedRecipient}
          onChange={(e) => setSelectedRecipient(parseInt(e.target.value))}
          className="border p-2 w-full"
        >
          {recipients.map((recipient) => (
            <option key={recipient.id} value={recipient.id}>
              {recipient.name}
            </option>
          ))}
        </select>
      </div>

      <form onSubmit={handleSubmit} className="mb-4">
        <div className="mb-4">
          <label className="block mb-2">Nombre:</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="border p-2 w-full"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2">Teléfono:</label>
          <input
            type="text"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="border p-2 w-full"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2">Email:</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="border p-2 w-full"
          />
        </div>

        <button type="submit" className="bg-blue-500 text-white p-2 rounded">
          {editingAgent ? "Actualizar Agente" : "Crear Agente"}
        </button>
        {editingAgent && (
          <button
            type="button"
            onClick={() => {
              setEditingAgent(null);
              setFormData({ name: "", phone: "", email: "" });
            }}
            className="bg-gray-500 text-white p-2 rounded ml-2"
          >
            Cancelar
          </button>
        )}
      </form>

      <div>
        <h3 className="text-md font-bold mb-2">Lista de Agentes</h3>
        <ul>
          {agents.map((agent) => (
            <li key={agent.id} className="mb-2 p-2 border rounded flex justify-between items-center">
              <div>
                <p className="font-bold">{agent.name}</p>
                <p>Teléfono: {agent.phone}</p>
                {agent.email && <p>Email: {agent.email}</p>}
              </div>
              <div>
                <button
                  onClick={() => handleEdit(agent)}
                  className="bg-yellow-500 text-white p-1 rounded mr-2"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(agent.id)}
                  className="bg-red-500 text-white p-1 rounded"
                >
                  Eliminar
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};