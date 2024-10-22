"use client";

import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import type { FormDataType } from './formdatatype';
import FakturaPDF from './FakturaPDF';
import { PDFDownloadLink } from '@react-pdf/renderer';

const InputForm: React.FC = () => {
  const [formData, setFormData] = useState<FormDataType>({
    name: '',
    // andre felter
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div>
      <form>
        <Input
          name="name"
          placeholder="Navn"
          value={formData.name}
          onChange={handleChange}
        />
        {/* Andre inputfelter */}
      </form>
      
      <PDFDownloadLink
        document={<FakturaPDF data={formData} />}
        fileName="dokument.pdf"
      >
        {({ blob, url, loading, error }) =>
          loading ? (
            'Genererer PDF...'
          ) : (
            <button type="button">Download PDF</button>
          )
        }
      </PDFDownloadLink>
    </div>
  );
};

export default InputForm;
