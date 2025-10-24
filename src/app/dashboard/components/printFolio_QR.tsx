import QrCreator from "qr-creator";

export const printFolioQR = ({
  saleCode,
  serviceId,
}: {
  saleCode: string;
  serviceId: string;
}) => {
  const w = window.open("", "_blank", "width=400,height=300");
  if (!w) return;

  const qrCanvas = document.createElement("canvas");
  QrCreator.render(
    {
      text: `http://192.168.1.205:3000/repairs/${serviceId}`,
      radius: 0,
      ecLevel: "H",
      fill: "#000000",
      background: "#ffffff",
      size: 150,
    },
    qrCanvas
  );
  const qrDataUrl = qrCanvas.toDataURL("image/png");

  const html = `
    <html>
      <head>
        <style>
          body { text-align: center; font-family: monospace; }
          img { width: 120px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <img src="${qrDataUrl}" alt="QR Code" />
        <div><strong>Folio:</strong> ${saleCode}</div>
      </body>
    </html>
  `;

  w.document.write(html);
  w.document.close();
  w.focus();
  w.print();
};
