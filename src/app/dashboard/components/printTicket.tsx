// src/components/printTicket.ts
export const printTicket = ({
  sale,
  cart,
  total,
  anticipo,
  totalNet,
  totalTax,
  saleCode,
  user,
}: {
  sale: any;
  cart: any[];
  total: number;
  anticipo: number;
  totalNet: number;
  totalTax: number;
  saleCode: string;
  user: any;
}) => {
  const BUSINESS_NAME = process.env.NEXT_PUBLIC_BUSINESS_NAME || "Mi Negocio";
  const BUSINESS_ADDRESS = process.env.NEXT_PUBLIC_BUSINESS_ADDRESS || "";
  const BUSINESS_PHONE = process.env.NEXT_PUBLIC_BUSINESS_PHONE || "";
  const BUSINESS_RFC = process.env.NEXT_PUBLIC_BUSINESS_RFC || "";
  const IVA = Number(process.env.NEXT_PUBLIC_IVA_RATE || 0.16);
  const BUSINESS_LOGO = process.env.NEXT_PUBLIC_BUSINESS_LOGO || "/logo.png";

  const w = window.open("", "_blank", `width=400,height=600`);
  if (!w) return;

  const escapeHtml = (str: string = "") =>
    str.replace(/[&<>"']/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[
        c
      ]!)
    );

  const formatMoney = (n: number) =>
    n.toLocaleString("es-MX", { style: "currency", currency: "MXN" });

  const hasService = cart.some((it) => it.type === "service");
  const saldoPendiente = total - (anticipo ?? 0);

  const itemsHtml = cart
    .map(
      (it) => `
        <div style="display:flex;justify-content:space-between;margin-bottom:4px">
          <div style="width:60%;">${escapeHtml(it.title)}</div>
          <div style="width:10%;text-align:right">${it.qty}</div>
          <div style="width:30%;text-align:right">${formatMoney(it.lineTotal)}</div>
        </div>`
    )
    .join("");

  const anticipoHtml = hasService
    ? `
        ${
          anticipo > 0
            ? `
        <div style="display:flex;justify-content:space-between">
          <div>Anticipo</div>
          <div>- ${formatMoney(anticipo)}</div>
        </div>
        `
            : ""
        }

        <div style="display:flex;justify-content:space-between;font-size:14px;font-weight:bold;">
          <div>TOTAL A PAGAR</div>
          <div>${formatMoney(saldoPendiente)}</div>
        </div>

        <div class="line"></div>
      `
    : "";

  const terminosHtml = hasService
    ? `
      <div class="line"></div>

      <div style="font-weight:bold;text-align:center;margin-bottom:4px;">
        TÉRMINOS Y CONDICIONES
      </div>

      <div style="font-size:11px;">
        • Después de 30 días los equipos pueden ser usados como remate o refacción.
        <br/>
        • Retire chip y memoria, no nos hacemos responsables de pérdidas.
        <br/>
        • No hay garantía por daños por mal uso, humedad o golpes.
        <br/>
        • Entrega solo con nota o identificación.
        <br/>
        • Las piezas cuentan con 15 días de garantía contra defecto de fábrica.
        <br/>
        • Tiempos sujetos a proveedores externos.
      </div>

      <div class="line"></div>

      <div style="text-align:center;font-weight:bold;margin-top:12px;">
        Firma
      </div>

      <div class="line" style="margin-top:40px;"></div>
    `
    : "";

  const businessHtml = `
    <div style="text-align:center;margin-bottom:6px;">
      <img src="${BUSINESS_LOGO}" style="max-width:150px;margin-bottom:10px;" />
      <div style="font-weight:bold;">${escapeHtml(BUSINESS_NAME)}</div>
      <div>${escapeHtml(BUSINESS_ADDRESS)}</div>
      <div>Tel: ${escapeHtml(BUSINESS_PHONE)}</div>
      ${
        BUSINESS_RFC
          ? `<div>RFC: ${escapeHtml(BUSINESS_RFC)}</div>`
          : ""
      }
      <div class="line"></div>
    </div>`;

  const userHtml = user
    ? `<div>Vendedor: ${escapeHtml(user.username)}</div>`
    : "";

  const html = `
    <html>
      <head>
        <title>Ticket ${saleCode}</title>
        <style>
          body {
            font-family: sans-serif;
            font-size: 12px;
            max-width: 58mm;
            margin: 0 auto;
          }
          .line {
            border-top: 1px dashed #000;
            margin: 8px 0;
          }
        </style>
      </head>
      <body>

        ${businessHtml}

        <div>Folio: ${escapeHtml(saleCode)}</div>
        <div>${new Date(
          sale.createdAt ?? Date.now()
        ).toLocaleString()}</div>

        <div class="line"></div>

        ${itemsHtml}

        <div class="line"></div>

        <div style="display:flex;justify-content:space-between">
          <div>Subtotal</div>
          <div>${formatMoney(totalNet)}</div>
        </div>

        <div style="display:flex;justify-content:space-between">
          <div>IVA (${(IVA * 100).toFixed(0)}%)</div>
          <div>${formatMoney(totalTax)}</div>
        </div>

        <div style="display:flex;justify-content:space-between;font-weight:bold">
          <div>Total</div>
          <div>${formatMoney(total)}</div>
        </div>

        <div class="line"></div>

        ${anticipoHtml}

        ${terminosHtml}

        ${userHtml}

        <div style="text-align:center;margin-top:10px">
          ¡Gracias por su preferencia!
        </div>

      </body>
    </html>
  `;

  w.document.open();
  w.document.write(html);
  w.document.close();
  w.focus();

  setTimeout(() => {
    w.print();
    w.close();
  }, 600);
};
