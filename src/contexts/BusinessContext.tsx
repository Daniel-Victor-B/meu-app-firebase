
"use client"

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface BusinessData {
  ramo: string;
  nicho: string;
  outroRamo?: string;
  nomeNegocio: string;
  modeloNegocio: string;
  canaisVenda: string[];
  ticketMedio: number;
  numClientes: number;
  desafio: string;
  meta: string;
  aiEnabledFields: Record<string, boolean>;
}

interface BusinessContextType {
  businessData: BusinessData;
  updateBusinessData: (data: Partial<BusinessData>) => void;
  toggleAiField: (field: string) => void;
}

const DEFAULT_AI_FIELDS = {
  nomeNegocio: true,
  ramo: true,
  nicho: true,
  modeloNegocio: true,
  canaisVenda: true,
  ticketMedio: true,
  numClientes: true,
  desafio: true,
  meta: true,
};

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

export function BusinessProvider({ children }: { children: React.ReactNode }) {
  const [businessData, setBusinessData] = useState<BusinessData>({
    ramo: "Serviços online (freelancer, consultoria online, desenvolvimento)",
    nicho: "",
    outroRamo: "",
    nomeNegocio: "",
    modeloNegocio: "B2C",
    canaisVenda: [],
    ticketMedio: 0,
    numClientes: 0,
    desafio: "Fluxo de caixa",
    meta: "Aumentar faturamento",
    aiEnabledFields: DEFAULT_AI_FIELDS,
  });

  useEffect(() => {
    const saved = localStorage.getItem("mei-flow-business-context-v4");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setBusinessData({
          ...parsed,
          aiEnabledFields: parsed.aiEnabledFields || DEFAULT_AI_FIELDS
        });
      } catch (e) {
        console.error("Erro ao carregar contexto de negócio", e);
      }
    }
  }, []);

  const updateBusinessData = (data: Partial<BusinessData>) => {
    setBusinessData(prev => {
      const next = { ...prev, ...data };
      localStorage.setItem("mei-flow-business-context-v4", JSON.stringify(next));
      return next;
    });
  };

  const toggleAiField = (field: string) => {
    setBusinessData(prev => {
      const next = {
        ...prev,
        aiEnabledFields: {
          ...prev.aiEnabledFields,
          [field]: !prev.aiEnabledFields[field]
        }
      };
      localStorage.setItem("mei-flow-business-context-v4", JSON.stringify(next));
      return next;
    });
  };

  return (
    <BusinessContext.Provider value={{ businessData, updateBusinessData, toggleAiField }}>
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
