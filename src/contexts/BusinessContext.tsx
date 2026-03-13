"use client"

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface BusinessData {
  ramo: string;
  outroRamo?: string;
}

interface BusinessContextType {
  businessData: BusinessData;
  updateBusinessData: (data: Partial<BusinessData>) => void;
}

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

export function BusinessProvider({ children }: { children: React.ReactNode }) {
  const [businessData, setBusinessData] = useState<BusinessData>({
    ramo: "Serviços presenciais (consultoria, estética, oficina)",
    outroRamo: ""
  });

  useEffect(() => {
    const saved = localStorage.getItem("mei-flow-business-context");
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
      localStorage.setItem("mei-flow-business-context", JSON.stringify(next));
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
