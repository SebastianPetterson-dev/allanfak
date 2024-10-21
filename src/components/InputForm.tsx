import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface InputFormProps {
    onSubmit: (e: React.FormEvent<HTMLFormElement>, formData: FormDataType) => void;
  }

  
interface FormDataType {
    name: string;
    // andre felter
  }

  const InputForm: React.FC<InputFormProps> = ({ onSubmit }) => {
    const [formData, setFormData] = useState<FormDataType>({
    name: '',
    // andre felter
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <form onSubmit={(e) => onSubmit(e, formData)}>
      <Input
        name="name"
        placeholder="Navn"
        value={formData.name}
        onChange={handleChange}
      />
      {/* Andre inputfelter */}
      <Button type="submit">Generer PDF</Button>
    </form>
  );
};

export default InputForm;
