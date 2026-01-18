"use client";

import { useState, useEffect } from "react";

interface Recipient {
  id: number;
  name: string;
  wallet: string;
  phone: string;
}

export const RecipientsBlock = () => {
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    wallet: "",
    phone: "",
  });
  const [editingRecipient, setEditingRecipient] = useState<Recipient | null>(null);

  useEffect(() => {
    fetchRecipients();
  }, []);

  const fetchRecipients = async () => {
    const res = await fetch("/api/recipients");
    const data = await res.json();
    setRecipients(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingRecipient) {
      // Update recipient
      const response = await fetch(`/api/recipients/${editingRecipient.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const updatedRecipient = await response.json();
        setRecipients(
          recipients.map((recipient) =>
            recipient.id === updatedRecipient.id ? updatedRecipient : recipient
          )
        );
        setEditingRecipient(null);
      }
    } else {
      // Create recipient
      const response = await fetch("/api/recipients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const newRecipient = await response.json();
        setRecipients([...recipients, newRecipient]);
      }
    }

    setFormData({ name: "", wallet: "", phone: "" });
  };

  const handleEdit = (recipient: Recipient) => {
    setEditingRecipient(recipient);
    setFormData({
      name: recipient.name,
      wallet: recipient.wallet,
      phone: recipient.phone,
    });
  };

  const handleDelete = async (id: number) => {
    const response = await fetch(`/api/recipients/${id}`, {
      method: "DELETE",
    });

    if (response.ok) {
      setRecipients(recipients.filter((recipient) => recipient.id !== id));
    }
  };

  return (
    <div className="p-4 border rounded">
      <h2 className="text-lg font-bold mb-4">Gestionar Destinatarios</h2>

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
          <label className="block mb-2">Wallet:</label>
          <input
            type="text"
            value={formData.wallet}
            onChange={(e) => setFormData({ ...formData, wallet: e.target.value })}
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

        <button type="submit" className="bg-blue-500 text-white p-2 rounded">
          {editingRecipient ? "Actualizar Destinatario" : "Crear Destinatario"}
        </button>
        {editingRecipient && (
          <button
            type="button"
            onClick={() => {
              setEditingRecipient(null);
              setFormData({ name: "", wallet: "", phone: "" });
            }}
            className="bg-gray-500 text-white p-2 rounded ml-2"
          >
            Cancelar
          </button>
        )}
      </form>

      <div>
        <h3 className="text-md font-bold mb-2">Lista de Destinatarios</h3>
        <ul>
          {recipients.map((recipient) => (
            <li key={recipient.id} className="mb-2 p-2 border rounded flex justify-between items-center">
              <div>
                <p className="font-bold">{recipient.name}</p>
                <p>Wallet: {recipient.wallet}</p>
                <p>Teléfono: {recipient.phone}</p>
              </div>
              <div>
                <button
                  onClick={() => handleEdit(recipient)}
                  className="bg-yellow-500 text-white p-1 rounded mr-2"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(recipient.id)}
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