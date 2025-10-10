import React from 'react';
import { CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PaymentSuccess() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-center p-4">
      <CheckCircle className="w-24 h-24 text-green-500 mb-6" />
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Pagamento Aprovado!</h1>
      <p className="text-lg text-gray-600 mb-8 max-w-md">
        Sua assinatura do AgendPro foi ativada com sucesso. Seja bem-vindo! Você já pode acessar todos os recursos.
      </p>
      <Link
        to="/dashboard"
        className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
      >
        Ir para o Painel
      </Link>
    </div>
  );
}