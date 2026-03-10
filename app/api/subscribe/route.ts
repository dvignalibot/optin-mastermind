import { NextResponse } from "next/server";

const AC_API_URL = process.env.AC_API_URL;
const AC_API_KEY = process.env.AC_API_KEY;
const AC_LIST_ID = process.env.AC_LIST_ID || "1";

export async function POST(request: Request) {
  try {
    const { nome, email, telefono } = await request.json();

    if (!nome || !email || !telefono) {
      return NextResponse.json(
        { error: "Tutti i campi sono obbligatori." },
        { status: 400 }
      );
    }

    if (!AC_API_URL || !AC_API_KEY) {
      console.error("ActiveCampaign credentials not configured");
      return NextResponse.json(
        { error: "Configurazione server mancante." },
        { status: 500 }
      );
    }

    // 1. Create or update the contact
    const contactRes = await fetch(`${AC_API_URL}/api/3/contact/sync`, {
      method: "POST",
      headers: {
        "Api-Token": AC_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contact: {
          email,
          firstName: nome,
          phone: telefono,
        },
      }),
    });

    if (!contactRes.ok) {
      const errorData = await contactRes.text();
      console.error("ActiveCampaign contact sync error:", errorData);
      return NextResponse.json(
        { error: "Errore durante l'iscrizione. Riprova." },
        { status: 502 }
      );
    }

    const contactData = await contactRes.json();
    const contactId = contactData.contact.id;

    // 2. Add contact to the list
    const listRes = await fetch(`${AC_API_URL}/api/3/contactLists`, {
      method: "POST",
      headers: {
        "Api-Token": AC_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contactList: {
          list: AC_LIST_ID,
          contact: contactId,
          status: 1, // 1 = subscribed
        },
      }),
    });

    if (!listRes.ok) {
      const errorData = await listRes.text();
      console.error("ActiveCampaign list add error:", errorData);
      // Contact was created, list add failed — not critical
    }

    return NextResponse.json({ success: true, contactId });
  } catch (error) {
    console.error("Subscribe error:", error);
    return NextResponse.json(
      { error: "Errore del server. Riprova." },
      { status: 500 }
    );
  }
}
