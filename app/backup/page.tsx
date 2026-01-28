"use client";

import { useState } from 'react';
import { BackupNav } from '../../components/Navigation/BackupNav';

export default function BackupPage() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string>('');
  const [selectedTable, setSelectedTable] = useState<string>('all');

  const handleBackup = async () => {
    setStatus('Descargando respaldo...');
    try {
      const res = await fetch('/api/backup');
      if (!res.ok) throw new Error('Error al descargar');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'backup.db';
      a.click();
      URL.revokeObjectURL(url);
      setStatus('Respaldo descargado');
    } catch (error) {
      setStatus('Error: ' + (error as Error).message);
    }
  };

  const handleRestore = async () => {
    if (!file) {
      setStatus('Selecciona un archivo');
      return;
    }
    setStatus('Restaurando...');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/backup', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('Error al restaurar');
      setStatus('Base de datos restaurada');
    } catch (error) {
      setStatus('Error: ' + (error as Error).message);
    }
  };

  const handleClear = async () => {
    setStatus('Limpiando...');
    try {
      const res = await fetch('/api/clear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table: selectedTable }),
      });
      if (!res.ok) throw new Error('Error al limpiar');
      const data = await res.json();
      setStatus(data.message);
    } catch (error) {
      setStatus('Error: ' + (error as Error).message);
    }
  };

  return (
    <>
      <BackupNav />
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Administrar Respaldos de Base de Datos</h1>

      <div className="mb-4">
        <button
          onClick={handleBackup}
          className="bg-blue-500 text-white p-2 rounded mr-4"
        >
          Descargar Respaldo
        </button>
      </div>

      <div className="mb-4">
        <input
          type="file"
          accept=".db"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="border p-2 mr-4"
        />
        <button
          onClick={handleRestore}
          className="bg-green-500 text-white p-2 rounded"
        >
          Restaurar desde Archivo
        </button>
      </div>

      <div className="mb-4">
        <select
          value={selectedTable}
          onChange={(e) => setSelectedTable(e.target.value)}
          className="border p-2 mr-4"
        >
          <option value="all">Todas las tablas</option>
          <option value="transactions">Transacciones</option>
          <option value="recipients">Destinatarios</option>
          <option value="agents">Agentes</option>
        </select>
        <button
          onClick={handleClear}
          className="bg-red-500 text-white p-2 rounded"
        >
          Limpiar Tabla
        </button>
      </div>

      {status && <p className="mt-4">{status}</p>}
      </div>
    </>
  );
}