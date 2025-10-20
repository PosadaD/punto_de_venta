import { printTicket } from "./printTicket";

// src/components/printTicket.ts
export const printSalesCode = ({
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
  const w = window.open("", "_blank", `width=400,height=600`);
  if (!w) return;

  const escapeHtml = (str: string = "") =>
    str.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[c]!));

  const html = `
    <html>
      <head>
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
        <div>Folio: ${escapeHtml(saleCode)}</div>
      </body>
    </html>
  `;

  w.document.open();
  w.document.write(html);
  w.document.close();
  w.focus();

  // Imprimir el contenido de la ventana
  w.print();

  // Verificar si la ventana se ha cerrado
  let printCheckInterval = setInterval(() => {
    if (w.closed) {
      // La ventana se cerró, ahora imprimimos el ticket
      clearInterval(printCheckInterval); // Detener la verificación

      // Llamamos a la función para imprimir el ticket
      printTicket({
        sale,
        cart,
        total,
        totalNet,
        totalTax,
        saleCode,
        user,
      });
    }
  }, 1000); // Comprobar cada 1 segundo si la ventana está cerrada

};
