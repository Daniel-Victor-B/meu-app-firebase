"use client"

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface BusinessData {
  ramo: string;
  outroRamo?: string;
  nomeNegocio: string;
  modeloNegocio: string;
  canaisVenda: string[];
  ticketMedio: number;
  numClientes: number;
  desafio: string;
  meta: string;
}

interface BusinessContextType {
  businessData: BusinessData;
  updateBusinessData: (data: Partial<BusinessData>) => void;
}

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

export function BusinessProvider({ children }: { children: React.ReactNode }) {
  const [businessData, setBusinessData] = useState<BusinessData>({
    ramo: "Serviços online (freelancer, consultoria online, desenvolvimento)",
    outroRamo: "",
    nomeNegocio: "",
    modeloNegocio: "B2C",
    canaisVenda: [],
    ticketMedio: 0,
    numClientes: 0,
    desafio: "Fluxo de caixa",
    meta: "Aumentar faturamento"
  });

  useEffect(() => {
    const saved = localStorage.getItem("mei-flow-business-context-v2");
    if (saved) {
      try {
        setBusinessData(JSON.parse(saved));
      } catch (e) {
        console.error("Erro ao carregar contexto de negócio", e);
      }
    }
  }, []);

  const updateBusinessData = (data: Partial<BusinessData>) => {
    setBusinessData(prev => {
      const next = { ...prev, ...data };
      localStorage.setItem("mei-flow-business-context-v2", JSON.stringify(next));
      return next;
    });
  };

  return (
    <BusinessContext.Provider value={{ businessData, updateBusinessData }}>
      {children}
    </BusinessContext.Provider>
  );
}

export function useBusiness() {
  const context = useContext(BusinessContext);
  if (context === undefined) {
    throw new Error('useBusiness deve ser usado dentro de um BusinessProvider');
  }
  return context;
}
