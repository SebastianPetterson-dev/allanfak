import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import fs from "fs/promises";
import path from "path";


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
    cvrNum,
  } = await request.json();

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([600, 800]);
  const { width, height } = page.getSize();

  // Læs lokalt billede fra filsystemet
  const imagePath = path.join(process.cwd(), "public/img/bg.png");
  const imageBytes = await fs.readFile(imagePath);
  const embeddedImage = await pdfDoc.embedPng(imageBytes);

  // Beregn placering for centreret billede
  const imageWidth = width * 0.5; // Skaleret bredde (50% af sidebredden)
  const imageHeight = (embeddedImage.height / embeddedImage.width) * imageWidth; // Bevar billedforhold
  const imageX = (width - imageWidth) / 2; // Centreret X
  const imageY = (height - imageHeight) / 2; // Centreret Y

  // Tegn billede som baggrund (før teksten)
  page.drawImage(embeddedImage, {
    x: imageX,
    y: imageY,
    width: imageWidth,
    height: imageHeight,
    opacity: 0.2, // Gør billedet gennemsigtigt for at skabe en baggrundseffekt
  });



  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontSize = 12;
  const fontSizeHeading = 16;
  const fontSizeMid = 14;
  const fontSizeXHeading = 20;

  // Funktion til at tilføje horisontal linje
function drawHorizontalLine(y: number, margin = 40) {
  page.drawLine({
    start: { x: margin, y },
    end: { x: width - margin, y },
    thickness: 1,
    color: rgb(0.5, 0.5, 0.5), // Grå farve
  });
}

// Funktion til at tilføje vertikal linje
function drawVerticalLine(x: number, startY: number, endY: number) {
  page.drawLine({
    start: { x, y: startY },
    end: { x, y: endY },
    thickness: 1,
    color: rgb(0.5, 0.5, 0.5), // Grå farve
  });
}

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


  drawHorizontalLine(height - 100);

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

  drawHorizontalLine(height - 230);

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
  page.drawText(`${senderAddress}`, {
    x: width - 250,
    y: height - 170,
    size: fontSize,
    font,
  });
  page.drawText(`${senderEmail}`, {
    x: width - 250,
    y: height - 190,
    size: fontSize,
    font,
  });
  page.drawText(`${cvrNum}`, {
    x: width - 250,
    y: height - 210,
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
    y: height - 250,
    size: fontSizeMid,
    font,
  })
  drawHorizontalLine(height - 260);


  page.drawText('Antal', {
  x: 200,
  y: height - 250,
  size: fontSizeMid,
  font,
  });
  page.drawText('Pris pr stk.', {
  x: 325,
  y: height - 250,
  size: fontSizeMid,
  font,
  });
  page.drawText('Total pris', {
  x: 450,
  y: height - 250,
  size: fontSizeMid,
  font,
  });

  let currentY = height - 280;
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

  drawVerticalLine(180, height - 260, currentY); // Mellem Beskrivelse og Antal
  drawVerticalLine(300, height - 260, currentY); // Mellem Antal og Pris pr stk.
  drawVerticalLine(430, height - 260, currentY); // Mellem Pris pr stk. og Total pris

  drawHorizontalLine(currentY);

  const subtotalNum = Number(subtotal);
  const taxNum = Number(tax);
  const totalNum = Number(total);

  page.drawText(
    `Subtotal: DKK ${isNaN(subtotalNum) ? "N/A" : subtotalNum.toFixed(2)}`,
    {
      x: width - 250,
      y: currentY - 40,
      size: fontSize,
      font,
    }
  );

  page.drawText(`VAT: DKK ${isNaN(taxNum) ? "N/A" : taxNum.toFixed(2)}`, {
    x: width - 250,
    y: currentY - 60,
    size: fontSize,
    font,
  });

  page.drawText(`Total: DKK ${isNaN(totalNum) ? "N/A" : totalNum.toFixed(2)}`, {
    x: width - 250,
    y: currentY - 80,
    size: fontSize,
    font: fontBold,
  });


  page.drawText(`${dueDateFinal}`, {
    x: 50,
    y: currentY - 80,
    size: fontSize,
    font,
  });
  page.drawText(`${payFinal}`, {
    x: 50,
    y: currentY - 100,
    size: fontSize,
    font: fontBold,
  });

  page.drawText('Reg. nummer',{
  x: 50,
  y: currentY - 40,
  size: fontSize,
  font: fontBold,
  });
  page.drawText('Konto nummer',{
  x: 150,
  y: currentY - 40,
  size: fontSize,
  font: fontBold,
  });

  page.drawText(`${accountNumber}`, {
    x: 150,
    y: currentY - 60,
    size: fontSize,
    font,
  });
  page.drawText(`${regNumber}`, {
    x: 50,
    y: currentY - 60,
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
