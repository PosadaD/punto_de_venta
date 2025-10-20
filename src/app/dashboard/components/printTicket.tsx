// src/components/printTicket.ts
export const printTicket = ({
  sale,
  cart,
  total,
  totalNet,
  totalTax,
  saleCode,
  user,
}: {
  sale: any;
  cart: any[];
  total: number;
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

  const widthPx = 320;
  const w = window.open("", "_blank", `width=400,height=600`);
  if (!w) return;

  const escapeHtml = (str: string = "") =>
    str.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[c]!));

  const formatMoney = (n: number) => n.toLocaleString("es-MX", { style: "currency", currency: "MXN" });

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

  const servicesHtml = cart
    .filter((it) => it.type === "service")
    .map(
      (s) => `
      <div style="margin-top:6px;font-size:14px">
        Cliente: ${escapeHtml(s.serviceInfo?.customerName ?? "")} <br/> Telefono ${escapeHtml(s.serviceInfo?.customerPhone ?? "")}<br/>
        Marca: ${escapeHtml(s.serviceInfo?.brand ?? "")} <br/> Modelo: ${escapeHtml(s.serviceInfo?.model ?? "")}<br/>
        Nota: ${escapeHtml(s.serviceInfo?.description ?? "")}
      </div>`
    )
    .join("");

    const terminosHtml = cart
    .filter((it) => it.type === "service")
    .map(
      (s) => `
        <div style="display:flex; font-size: 15px; justify-content:space-between;font-weight:bold">Terminos y Condiciones</div>
        <div>Agradecemos su confianza y hacemos de su conocimiento las siguientes condiciones de servicio.</div>
        <div>• Despues de 30 dias los equipos pueden ser usados como remate o refaccion sin responsabilidad de parte nuestra.</div>
        <div>• Retire chip y memoria, no nos hacemos responsables de tales perdidas.</div>
        <div>• En equipos mojados, software, danos por mal uso e intervenidos, no hay garantia.</div>
        <div>• Si requiere mas tiempo solicite una nueva fecha.</div>
        <div>• La entrega del equipo sera solo con nota o identificacion.</div>
        <div>• Lo reemplazos de piezas cuentan con 15 dias de garantia contra defectos de fabrica. No aplica garantia si el equipo presenta dano por golpe, humedad o mal uso.</div>
        <div>• Pueden existir variaciones entre la pieza original y el reemplazo, como logos, tonalidad, material, etc.</div>
        <div>• Los tiempos de liberacion por codigo y via servidor son establecidos por provveedores terceros, en raras ocasiones pueden retrasarse. No habra reembolso hasta completada la orde. La liberacion de compania no elimina el reporte de robo o extravio.</div>
        <div>• El tiempo de entrege puede retrasarse cuando la refaccion viene de proveedores externos.</div>
        <div class="line"></div>
            <div style="display:flex; font-size: 15px; justify-content:space-between;font-weight:bold">Firma</div>
        <div class="line" style="margin-top:36px;"></div>
        <div class="line"></div>
      `
    )
    .join("");

  const businessHtml = `
    <div style="text-align:center;margin-bottom:6px;">
      <img src="${BUSINESS_LOGO}" alt="Logo" style="max-width:150px;margin-bottom:10px;" /><br/>
      <div style="font-size:14px;">${escapeHtml(BUSINESS_ADDRESS)}</div>
      <div style="font-size:14px;">Tel: ${escapeHtml(BUSINESS_PHONE)}</div>
      <div style="margin:6px 0;border-top:1px dashed #000;"></div>
    </div>`;

  const userHtml = user ? `<div style="font-size:14px;">Vendedor: ${escapeHtml(user.username)}</div>` : "";

  const html = `
    <html>
      <head>
        <title>Ticket ${saleCode}</title>
         <style>
          @page {
            size: auto;
            margin: 5mm;
          }

          body {
            font-family: monospace;
            font-size: 12px;
            width: 100%;
            max-width: 58mm;
            margin: 0 auto;
            padding: 0;
            text-align: center;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            margin: 0 auto;
          }

          td {
            padding: 2px 0;
            font-size: 12px;
          }

          .totals td {
            font-weight: bold;
            border-top: 1px dashed #000;
            padding-top: 6px;
          }

          .line {
            border-top: 1px dashed #000;
            margin: 8px 0;
          }

          @media print {
            body {
              width: 100%;
              max-width: 58mm;
              margin: 0 auto;
              text-align: center;
            }
          }
        </style>
      </head>
      <body>
        ${businessHtml}
        <div>Folio: ${escapeHtml(saleCode)}</div>
        <div>${new Date(sale.createdAt ?? Date.now()).toLocaleString()}</div>
        <div class="line"></div>
        ${itemsHtml}
        <div class="line"></div>
        <div style="display:flex;justify-content:space-between"><div>Subtotal</div><div class="right">${formatMoney(totalNet)}</div></div>
        <div style="display:flex;justify-content:space-between"><div>IVA (${(IVA * 100).toFixed(0)}%)</div><div class="right">${formatMoney(totalTax)}</div></div>
        <div style="display:flex;justify-content:space-between;font-weight:bold"><div>Total</div><div class="right">${formatMoney(total)}</div></div>
        <div class="line"></div>
        ${servicesHtml}
        <div class="line"></div>
        ${userHtml}
        <div class="line"></div>
        ${terminosHtml}
        <div style="text-align:center;margin-top:10px">¡Gracias por su compra!</div>
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
