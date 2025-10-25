import JsBarcode from "jsbarcode";

export const handlePrint = (p: any) => {
  const tempSvg = document.createElement("svg");
  JsBarcode(tempSvg, p.code, {
    format: "CODE128",
    lineColor: "#000",
    width: 2,
    height: 60,
    displayValue: true,
    fontSize: 14,
    margin: 0,
  });

  const printWindow = window.open("", "_blank", "width=400,height=300");
  if (!printWindow) return;

  const html = `
    <html>
      <head>
        <title>Imprimir código de barras</title>
        <style>
          body {
            font-family: sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            margin: 0;
            padding: 20px;
          }
          svg { height: 80px; }
          span { margin-top: 6px; font-size: 14px; }
          @media print { button { display: none; } }
        </style>
      </head>
      <body>
        ${tempSvg.outerHTML}
        <script>
          window.onload = function() {
            window.print();
            setTimeout(() => window.close(), 500);
          };
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
};
