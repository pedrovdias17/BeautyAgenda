import React from 'react';
import { XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PaymentCancel() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-center p-4">
      <XCircle className="w-24 h-24 text-red-500 mb-6" />
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Pagamento Cancelado</h1>
      <p className="text-lg text-gray-600 mb-8 max-w-md">
        O processo de pagamento foi cancelado. Sua assinatura não foi ativada. Se você mudou de ideia, pode tentar novamente.
      </p>
      <Link
        to="/upgrade"
        className="px-8 py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors"
      >
        Voltar para a Página de Planos
      </Link>
    </div>
  );
}