"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2 } from "lucide-react";
export default function Invoice() {
  const [invoiceNumber, setInvoiceNumber] = useState("0");
  const [date, setDate] = useState("2024-10-22");
  const [dueDate, setDueDate] = useState("2024-11-05");
  const [customerName, setCustomerName] = useState(
    "Sebastian Motherfucking Petterson"
  );
  const [customerAddress, setCustomerAddress] = useState(
    "Vestparken 40, 9550, Mariager"
  );
  const [customerEmail, setCustomerEmail] = useState("sebastian@reframe.nu");

  const [senderName, setSenderName] = useState("Allan Trans Pedersen");
  const [senderAddress, setSenderAddress] = useState("Carl Nielsensvej 4");
  const [senderEmail, setSenderEmail] = useState("allansmail@gmail.com");
  const payFinal = "Betaling til: " + senderName;


  const [items, setItems] = useState<Item[]>([
    { description: "Allan tjener penge", quantity: 1, price: 1000 },
  ]);
  const taxRate = 0.25;

  const subtotal = items.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0
  );
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  const dueDateInfo = "Forfaldsdato: ";
  const dueDateFinal = dueDateInfo + dueDate;

  const [accountNumber, setAccountNumber] = useState("6969696969696420");
  const [regNumber, setRegNumber] = useState("9070");

  type Item = {
    description: string;
    quantity: number;
    price: number;
  };

  const handleItemChange = (
    index: number,
    field: keyof Item,
    value: string | number
  ) => {
    const updatedItems = [...items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value,
    };
    setItems(updatedItems);
  };

  const handleAddItem = () => {
    setItems([...items, { description: "Ny linje", quantity: 1, price: 0 }]);
  };

  const handleDeleteItem = (index: number) => {
    const updatedItems = items.filter((_, i) => i !== index);
    setItems(updatedItems);
  };

  const handleGeneratePDF = async () => {
    const response = await fetch("/api/generate-pdf", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
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
      }),
    });

    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "faktura_" + invoiceNumber + ".pdf");
      document.body.appendChild(link);
      link.click();

      if (link.parentNode) {
        link.parentNode.removeChild(link);
      }
    } else {
      console.error("Failed to generate PDF");
    }
  };

  return (
    <div className="max-w-3xl mx-auto my-8 p-8 bg-white shadow-lg rounded-lg">
      {/* Invoice Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">FAKTURA</h1>
          <div className="text-sm text-gray-600">
            <label>Faktura nr:</label>
            <Input
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
            />
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-600">
            <label>Dato:</label>
            <Input
              value={date}
              onChange={(e) => setDate(e.target.value)}
              type="date"
            />
          </div>
          <div className="text-sm text-gray-600">
            <label>Forfaldsdato:</label>
            <Input
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              type="date"
            />
          </div>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4">
        <div>
        <h2 className="text-lg font-semibold mb-2">Til:</h2>
        <Input
          placeholder="Customer Name"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
        />
        <Input
          placeholder="Customer Address"
          value={customerAddress}
          onChange={(e) => setCustomerAddress(e.target.value)}
        />
        <Input
          placeholder="Customer Email"
          value={customerEmail}
          onChange={(e) => setCustomerEmail(e.target.value)}
        />
        </div>
        <div>
          <h2 className="text-lg font-semibold mb-2">Fra:</h2>
          <Input 
          placeholder="Afsenders navn"
          value={senderName}
          onChange={(e) => setSenderName(e.target.value)}
          />
          <Input 
          placeholder="Afsenders adresse"
          value={senderAddress}
          onChange={(e) => setSenderAddress(e.target.value)}
          />
          <Input 
          placeholder="Afsenders mail"
          value={senderEmail}
          onChange={(e) => setSenderEmail(e.target.value)}
          />
        </div>
      </div>

      <table className="w-full mb-8">
        <thead>
          <tr className="border-b border-gray-200 text-sm">
            <th className="text-left py-2">Beskrivelse</th>
            <th className="text-right py-2">Antal</th>
            <th className="text-right py-2">Pris pr stk.</th>
            <th className="text-right py-2">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={index} className="border-b border-gray-100">
              <td className="py-2">
                <Input
                  value={item.description}
                  onChange={(e) =>
                    handleItemChange(index, "description", e.target.value)
                  }
                />
              </td>
              <td className="text-right py-2">
                <Input
                  type="number"
                  value={item.quantity}
                  onChange={(e) =>
                    handleItemChange(index, "quantity", e.target.value)
                  }
                />
              </td>
              <td className="text-right py-2">
                <Input
                  type="number"
                  value={item.price}
                  onChange={(e) =>
                    handleItemChange(index, "price", e.target.value)
                  }
                />
              </td>
              <td className="text-right py-2">
                DKK {(item.quantity * item.price).toFixed(2)}
              </td>
              <td className="text-right py-2">
                <Button variant="ghost" onClick={() => handleDeleteItem(index)}>
                  <Trash2 />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-between items-center mb-8">
        <Button onClick={handleAddItem}>Tilføj</Button>
      </div>

      <div className="flex justify-end">
        <div className="w-1/2 space-y-2">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>DKK {subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>VAT ({taxRate * 100}%):</span>
            <span>DKK {tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-lg">
            <span>Total:</span>
            <span>DKK {total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="mt-8 text-sm text-gray-600 max-w-s">
        <p>{dueDateFinal}</p>
        <p>{payFinal}</p>
        <div className="grid grid-cols-2 gap-4">
          <p className="font-bold">Reg. nummer: </p>
          <p className="font-bold">Konto nummer</p>
          <Input 
          type="number"
          value={regNumber}
          onChange={(e) => setRegNumber(e.target.value)}
          />
          <Input 
          type="number"
          value={accountNumber}
          onChange={(e) => setAccountNumber(e.target.value)}
          />
        </div>
      </div>

      <div className="mt-8 text-right">
        <Button onClick={handleGeneratePDF}>Genererér PDF</Button>
      </div>
    </div>
  );
}
