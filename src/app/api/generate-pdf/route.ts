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

// Funktion til at wrappe tekst baseret på antal tegn pr. linje
function wrapText(text: string, maxCharsPerLine: number) {
  const lines = [];
  let currentLine = '';

  // Split teksten op i ord
  const words = text.split(' ');
  words.forEach((word) => {
    // Hvis ordet kan tilføjes til den aktuelle linje, gør det
    if (currentLine.length + word.length + 1 <= maxCharsPerLine) {
      currentLine += (currentLine.length === 0 ? '' : ' ') + word;
    } else {
      // Hvis linjen er fyldt, tilføj den til linje-arrayet og start en ny linje
      lines.push(currentLine);
      currentLine = word;
    }
  });

  // Tilføj den sidste linje
  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}



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
  // Opdateret forEach-løkke til at tegne beskrivelse med tekstindpakning
  (items as Item[]).forEach((item: Item, index: number) => {
    const price = Number(item.price);
    const totalPrice = item.quantity * price;

    // Brug wrapText-funktionen til at opdele beskrivelsen i flere linjer
    const wrappedDescription = wrapText(item.description, 17); // Maks 40 tegn per linje

    // Tegn den første linje af beskrivelsen
    page.drawText(wrappedDescription[0], {
      x: 50,
      y: currentY,
      size: fontSize,
      font,
    });

    // Hvis der er mere end én linje, tegnes resten på efterfølgende linjer
    if (wrappedDescription.length > 1) {
      wrappedDescription.slice(1).forEach((line, lineIndex) => {
        page.drawText(line, {
          x: 50, // Holder samme x-position
          y: currentY - (lineIndex + 1) * 15, // Flyt ned for hver ekstra linje
          size: fontSize,
          font,
        });
      });
    }

    // Tegn de øvrige felter (antal, pris osv.) kun én gang på første linje
    page.drawText(`${item.quantity}`, {
      x: 200,
      y: currentY,
      size: fontSize,
      font,
    });
    page.drawText(`${isNaN(price) ? "N/A" : price.toFixed(2)}`, {
      x: 325,
      y: currentY,
      size: fontSize,
      font,
    });
    page.drawText(`${isNaN(totalPrice) ? "N/A" : totalPrice.toFixed(2)}`, {
      x: 450,
      y: currentY,
      size: fontSize,
      font,
    });

    // Juster currentY for næste række baseret på antallet af linjer i beskrivelsen
    currentY -= 20 + (wrappedDescription.length - 1) * 15;
  });

  const subtotalNum = Number(subtotal);
  const taxNum = Number(tax);
  const totalNum = Number(total);

  page.drawText(
    `Subtotal: DKK ${isNaN(subtotalNum) ? "N/A" : subtotalNum.toFixed(2)}`,
    {
      x: width - 250,
      y: currentY - 30,
      size: fontSize,
      font,
    }
  );
  page.drawText(`VAT: DKK ${isNaN(taxNum) ? "N/A" : taxNum.toFixed(2)}`, {
    x: width - 250,
    y: currentY - 50,
    size: fontSize,
    font,
  });
  page.drawText(`Total: DKK ${isNaN(totalNum) ? "N/A" : totalNum.toFixed(2)}`, {
    x: width - 250,
    y: currentY - 70,
    size: fontSize,
    font: fontBold,
  });

  page.drawText(`${dueDateFinal}`, {
    x: width - 250,
    y: currentY - 110,
    size: fontSize,
    font,
  });
  page.drawText(`${payFinal}`, {
    x: width - 250,
    y: currentY - 130,
    size: fontSize,
    font,
  });

  page.drawText('Reg. nummer',{
  x: 50,
  y: currentY - 30,
  size: fontSize,
  font: fontBold,
  });
  page.drawText('Konto nummer',{
  x: 150,
  y: currentY - 30,
  size: fontSize,
  font: fontBold,
  });

  page.drawText(`${accountNumber}`, {
    x: 150,
    y: currentY - 50,
    size: fontSize,
    font,
  });
  page.drawText(`${regNumber}`, {
    x: 50,
    y: currentY - 50,
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
