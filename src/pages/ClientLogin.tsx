import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, MessageCircle, User, ArrowRight } from 'lucide-react';
// Importaremos o supabase diretamente aqui por enquanto
import { supabase } from '../lib/supabase';

export default function ClientLogin() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [step, setStep] = useState<'phone' | 'verify'>('phone');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Função para formatar o telefone enquanto o usuário digita
  const formatPhoneInput = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 2) return `(${digits}`;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneInput(e.target.value);
    setPhone(formatted);
  };

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Remove a formatação para enviar só os números para o Supabase
    const cleanPhone = '+55' + phone.replace(/\D/g, '');
    
    // A mágica do Supabase para enviar o código (OTP)
    const { error } = await supabase.auth.signInWithOtp({
      phone: cleanPhone,
    });

    if (error) {
      setError('Erro ao enviar o código. Verifique o número e tente novamente.');
      console.error(error);
      setIsLoading(false);
    } else {
      // Se deu certo, avança para a próxima etapa
      setStep('verify');
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const cleanPhone = '+55' + phone.replace(/\D/g, '');

    // A mágica do Supabase para verificar o código e logar o usuário
    const { data, error } = await supabase.auth.verifyOtp({
      phone: cleanPhone,
      token: verificationCode,
      type: 'sms', // O tipo padrão do Supabase é SMS, vamos usar ele
    });

    if (error) {
      setError('Código inválido. Tente novamente.');
      console.error(error);
      setIsLoading(false);
    } else {
      // SUCESSO! O usuário está logado.
      console.log('Sessão do cliente:', data.session);
      navigate('/client-area'); // Redireciona para a área do cliente
    }
  };


  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 text-white rounded-full mb-4">
            <User size={24} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Área do Cliente</h1>
          <p className="text-gray-600">
            {step === 'phone' 
              ? 'Acesse seus agendamentos com seu WhatsApp'
              : 'Digite o código que enviamos para você'
            }
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {step === 'phone' ? (
            // Etapa 1: Pedir o telefone
            <form onSubmit={handleSendCode} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número do WhatsApp
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel" required value={phone}
                    onChange={handlePhoneChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg"
                    placeholder="(11) 99999-9999" maxLength={15}
                  />
                </div>
              </div>
              {error && (<div className="text-red-500 text-sm text-center">{error}</div>)}
              <button
                type="submit" disabled={isLoading || phone.length < 15}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {isLoading ? 'Enviando...' : 'Enviar Código'}
              </button>
            </form>
          ) : (
            // Etapa 2: Pedir o código
            <form onSubmit={handleVerifyCode} className="space-y-6">
              <p className="text-sm text-center text-gray-600">
                Enviamos um código para <span className="font-medium text-gray-900">{phone}</span>
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Código de Verificação
                </label>
                <input
                  type="text" required value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-2xl tracking-widest"
                  placeholder="000000" maxLength={6}
                />
              </div>
              {error && (<div className="text-red-500 text-sm text-center">{error}</div>)}
              <button
                type="submit" disabled={isLoading || verificationCode.length < 6}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {isLoading ? 'Verificando...' : 'Verificar e Entrar'}
              </button>
              <div className="text-center">
                <button type="button" onClick={() => { setStep('phone'); setError(''); }} className="text-sm text-gray-600 hover:text-gray-800">
                  Digitar outro número
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}