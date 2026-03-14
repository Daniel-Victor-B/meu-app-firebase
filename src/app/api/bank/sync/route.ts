
import { NextResponse } from 'next/server';

export async function GET() {
  // Simulação de resposta de um provedor de Open Banking (ex: Pluggy)
  // Em produção, aqui você faria a chamada real usando o itemId do usuário
  
  const mockTransactions = [
    {
      id: "tx_001",
      date: new Date().toISOString(),
      description: "PIX RECEBIDO - CLIENTE A",
      amount: 1200.00,
      type: "CREDIT",
      category: "Serviços"
    },
    {
      id: "tx_002",
      date: new Date().toISOString(),
      description: "PAGAMENTO DAS - MES ATUAL",
      amount: -76.00,
      type: "DEBIT",
      category: "Impostos"
    },
    {
      id: "tx_003",
      date: new Date().toISOString(),
      description: "COMPRA EQUIPAMENTO - LOJA TECH",
      amount: -450.00,
      type: "DEBIT",
      category: "Custos Operacionais"
    },
    {
      id: "tx_004",
      date: new Date().toISOString(),
      description: "VENDA PRODUTO B",
      amount: 850.00,
      type: "CREDIT",
      category: "Vendas"
    }
  ];

  return NextResponse.json({ 
    transactions: mockTransactions,
    bankName: "Nubank PJ",
    lastSync: new Date().toISOString()
  });
}
