import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../lib/db";
import { agents } from "../../../lib/schema";
import { eq } from "drizzle-orm";

// Obtener todos los agentes
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const recipientId = searchParams.get("recipientId");

  if (recipientId) {
    const agentList = await db
      .select()
      .from(agents)
      .where(eq(agents.recipientId, parseInt(recipientId)));
    return NextResponse.json(agentList);
  }

  const agentList = await db.select().from(agents);
  return NextResponse.json(agentList);
}

// Crear un nuevo agente
export async function POST(req: NextRequest) {
  const { recipientId, name, phone, email } = await req.json();

  if (!recipientId || !name || !phone) {
    return NextResponse.json(
      { error: "recipientId, name, and phone are required" },
      { status: 400 }
    );
  }

  const newAgent = await db
    .insert(agents)
    .values({ recipientId, name, phone, email })
    .returning();

  return NextResponse.json(newAgent[0], { status: 201 });
}

// Actualizar un agente
export async function PUT(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { error: "Agent ID is required" },
      { status: 400 }
    );
  }

  const { name, phone, email } = await req.json();

  if (!name || !phone) {
    return NextResponse.json(
      { error: "name and phone are required" },
      { status: 400 }
    );
  }

  const updatedAgent = await db
    .update(agents)
    .set({ name, phone, email })
    .where(eq(agents.id, parseInt(id)))
    .returning();

  if (updatedAgent.length === 0) {
    return NextResponse.json(
      { error: "Agent not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(updatedAgent[0]);
}

// Eliminar un agente
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { error: "Agent ID is required" },
      { status: 400 }
    );
  }

  const deletedAgent = await db
    .delete(agents)
    .where(eq(agents.id, parseInt(id)))
    .returning();

  if (deletedAgent.length === 0) {
    return NextResponse.json(
      { error: "Agent not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true });
}