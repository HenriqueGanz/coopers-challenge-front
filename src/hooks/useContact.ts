import { useState, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import * as contactService from '../services/contact.service';
import type { ContactInput } from '../types';

export function useContact() {
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitContact = useCallback(async (data: ContactInput) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await contactService.send(data);
      setSuccess(true);
      toast.success('Mensagem enviada com sucesso!');
    } catch (err) {
      let message = 'Erro ao enviar mensagem. Tente novamente.';
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 429) {
          message = 'Muitas tentativas. Aguarde um momento.';
        } else {
          message = err.response?.data?.message ?? message;
        }
      }
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { isLoading, success, error, submitContact };
}
