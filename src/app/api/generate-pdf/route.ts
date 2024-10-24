import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, StandardFonts } from "pdf-lib";

export async function POST(request: NextRequest) {
  const {
    invoiceNumber,
    date,
    dueDate,
    customerName,
    customerAddress,
    customerEmail,
    senderName,
    senderAddress,
    senderEmail,
    items,
    subtotal,
    tax,
    total,
    dueDateFinal,
    payFinal,
    accountNumber,
    regNumber,
  } = await request.json();

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([600, 800]);
  const { width, height } = page.getSize();

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontSize = 12;
  const fontSizeHeading = 16;
  const fontSizeMid = 14;
  const fontSizeXHeading = 20;


  page.drawText(`Faktura nr: ${invoiceNumber}`, {
    x: 50,
    y: height - 50,
    size: fontSizeXHeading,
    font: fontBold,
  });
  page.drawText(`Dato: ${date}`, {
    x: 50,
    y: height - 70,
    size: fontSize,
    font,
  });
  page.drawText(`Forfaldsdato: ${dueDate}`, {
    x: 50,
    y: height - 90,
    size: fontSize,
    font,
  });


  page.drawText('Til:', {
    x: 50,
    y: height - 130,
    size: fontSizeHeading,
    font: fontBold,
  })
  page.drawText(`${customerName}`, {
    x: 50,
    y: height - 150,
    size: fontSize,
    font,
  });
  page.drawText(`${customerAddress}`, {
    x: 50,
    y: height - 170,
    size: fontSize,
    font,
  });
  page.drawText(`${customerEmail}`, {
    x: 50,
    y: height - 190,
    size: fontSize,
    font,
  });

  page.drawText('Fra:', {
    x: width - 250,
    y: height - 130,
    size: fontSizeHeading,
    font: fontBold,
  })
  page.drawText(`${senderName}`, {
    x: width - 250,
    y: height - 150,
    size: fontSize,
    font,
  });
  page.drawText(`Adresse: ${senderAddress}`, {
    x: width - 250,
    y: height - 170,
    size: fontSize,
    font,
  });
  page.drawText(`Email: ${senderEmail}`, {
    x: width - 250,
    y: height - 190,
    size: fontSize,
    font,
  });


  type Item = {
    description: string;
    quantity: number;
    price: number;
  };

  page.drawText('Beskrivelse', {
    x: 50,
    y: height - 230,
    size: fontSizeMid,
    font,
  })
  page.drawText('Antal', {
  x: 200,
  y: height - 230,
  size: fontSizeMid,
  font,
  });
  page.drawText('Pris pr stk.', {
  x: 325,
  y: height - 230,
  size: fontSizeMid,
  font,
  });
  page.drawText('Total pris', {
  x: 450,
  y: height - 230,
  size: fontSizeMid,
  font,
  });

  let currentY = height - 250;
  (items as Item[]).forEach((item: Item, index: number) => {
    const price = Number(item.price);
    const totalPrice = item.quantity * price;
    page.drawText(
      `${item.description}`,
      {
        x: 50,
        y: currentY,
        size: fontSize,
        font,
      });
    page.drawText(
      `${item.quantity}`,
      {
        x: 200,
        y: currentY,
        size: fontSize,
        font,
      });
    page.drawText(
      `${isNaN(price) ? "N/A" : price.toFixed(2)}`,
      {
        x: 325,
        y: currentY,
        size: fontSize,
        font,
      });
    page.drawText(
      `${isNaN(totalPrice) ? "N/A" : totalPrice.toFixed(2)}`,
      {
        x: 450,
        y: currentY,
        size: fontSize,
        font,
      });
    currentY -= 20;
  });

  const subtotalNum = Number(subtotal);
  const taxNum = Number(tax);
  const totalNum = Number(total);

  page.drawText(
    `Subtotal: DKK ${isNaN(subtotalNum) ? "N/A" : subtotalNum.toFixed(2)}`,
    {
      x: 50,
      y: currentY - 40,
      size: fontSize,
      font,
    }
  );
  page.drawText(`VAT: DKK ${isNaN(taxNum) ? "N/A" : taxNum.toFixed(2)}`, {
    x: 50,
    y: currentY - 60,
    size: fontSize,
    font,
  });
  page.drawText(`Total: DKK ${isNaN(totalNum) ? "N/A" : totalNum.toFixed(2)}`, {
    x: 50,
    y: currentY - 80,
    size: fontSize,
    font: fontBold,
  });

  page.drawText(`${dueDateFinal}`, {
    x: 50,
    y: currentY - 110,
    size: fontSize,
    font,
  });
  page.drawText(`${payFinal}`, {
    x: 50,
    y: currentY - 130,
    size: fontSize,
    font,
  });

  page.drawText('Reg. nummer',{
  x: 50,
  y: currentY - 150,
  size: fontSize,
  font: fontBold,
  });
  page.drawText('Konto nummer',{
  x: 150,
  y: currentY - 150,
  size: fontSize,
  font: fontBold,
  });

  page.drawText(`${accountNumber}`, {
    x: 150,
    y: currentY - 170,
    size: fontSize,
    font,
  });
  page.drawText(`${regNumber}`, {
    x: 50,
    y: currentY - 170,
    size: fontSize,
    font,
  });


  const pdfBytes = await pdfDoc.save();

  return new NextResponse(pdfBytes, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="faktura_${invoiceNumber}.pdf"`,
    },
  });
}
