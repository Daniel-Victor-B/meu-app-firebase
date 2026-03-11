
"use client"

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FinancialDistribution } from "@/components/FinancialDistribution";
import { ProfessionalDashboard } from "@/components/ProfessionalDashboard";
import { MeiLimitTracker } from "@/components/MeiLimitTracker";
import { AccountGuide } from "@/components/AccountGuide";
import { Checklist } from "@/components/Checklist";
import { AiAdvisor } from "@/components/AiAdvisor";
import { NfseGuide } from "@/components/NfseGuide";
import { CashFlowLedger } from "@/components/CashFlowLedger";
import { DollarSign, Landmark, LayoutList, ShieldCheck, Sparkles, FileText, BarChart3, FileSpreadsheet } from "lucide-react";

export interface MonthlyData {
  receita: number;
  custos: number;
  active: boolean;
}

export default function Home() {
  const [fat, setFat] = useState(5000);
  const [custos, setCustos] = useState(1500);
  const [prolabore, setProlabore] = useState(2000);
  const [reservaPct, setReservaPct] = useState(20);
  const [mesesFat, setMesesFat] = useState(6);
  const [fatAcum, setFatAcum] = useState(0);
  const [activeTab, setActiveTab] = useState("distribuicao");
  
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>(
    Array(12).fill(null).map(() => ({ receita: 5000, custos: 1500, active: true }))
  );

  const LIMITE_MEI_ANUAL = 81000;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [activeTab]);

  useEffect(() => {
    setFatAcum(fat * mesesFat);
  }, [fat, mesesFat]);

  const restante = Math.max(0, LIMITE_MEI_ANUAL - fatAcum);
  const mesesRestantes = fat > 0 ? Math.floor(restante / fat) : 12;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-12 space-y-8">
      <header className="flex items-center gap-4 mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground shadow-xl shadow-primary/20">
          <Landmark className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-headline font-bold tracking-tight">MEI Flow</h1>
          <p className="text-muted-foreground text-sm font-medium">Gestão Financeira Inteligente para MEI</p>
        </div>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 md:grid-cols-8 h-auto p-1 bg-secondary/50 backdrop-blur-sm border sticky top-4 z-50">
          <TabsTrigger value="distribuicao" className="flex flex-col gap-1 py-3 text-[10px] md:text-xs">
            <DollarSign className="w-4 h-4" />
            <span className="hidden sm:inline">Mensal</span>
          </TabsTrigger>
          <TabsTrigger value="gestao" className="flex flex-col gap-1 py-3 text-[10px] md:text-xs text-blue-500 data-[state=active]:bg-blue-500/20">
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </TabsTrigger>
          <TabsTrigger value="planilha" className="flex flex-col gap-1 py-3 text-[10px] md:text-xs text-purple-500 data-[state=active]:bg-purple-500/20">
            <FileSpreadsheet className="w-4 h-4" />
            <span className="hidden sm:inline">Planilha</span>
          </TabsTrigger>
          <TabsTrigger value="limite" className="flex flex-col gap-1 py-3 text-[10px] md:text-xs">
            <ShieldCheck className="w-4 h-4" />
            <span className="hidden sm:inline">Limite</span>
          </TabsTrigger>
          <TabsTrigger value="contas" className="flex flex-col gap-1 py-3 text-[10px] md:text-xs">
            <Landmark className="w-4 h-4" />
            <span className="hidden sm:inline">Contas</span>
          </TabsTrigger>
          <TabsTrigger value="nfse" className="flex flex-col gap-1 py-3 text-[10px] md:text-xs">
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">NFS-e</span>
          </TabsTrigger>
          <TabsTrigger value="guia" className="flex flex-col gap-1 py-3 text-[10px] md:text-xs">
            <LayoutList className="w-4 h-4" />
            <span className="hidden sm:inline">Guia</span>
          </TabsTrigger>
          <TabsTrigger value="ia" className="flex flex-col gap-1 py-3 text-[10px] md:text-xs text-primary data-[state=active]:bg-primary/20">
            <Sparkles className="w-4 h-4" />
            <span className="hidden sm:inline">AI Advice</span>
          </TabsTrigger>
        </TabsList>

        <div className="mt-8">
          <TabsContent value="distribuicao">
            <div className="max-w-2xl mx-auto">
              <FinancialDistribution 
                fat={fat} setFat={setFat}
                custos={custos} setCustos={setCustos}
                prolabore={prolabore} setProlabore={setProlabore}
                reservaPct={reservaPct} setReservaPct={setReservaPct}
              />
            </div>
          </TabsContent>

          <TabsContent value="gestao">
            <ProfessionalDashboard 
              fat={fat}
              custos={custos}
              prolabore={prolabore}
              reservaPct={reservaPct}
            />
          </TabsContent>

          <TabsContent value="planilha">
            <CashFlowLedger 
              fat={fat} setFat={setFat}
              custos={custos} setCustos={setCustos}
              prolabore={prolabore} setProlabore={setProlabore}
              reservaPct={reservaPct} setReservaPct={setReservaPct}
              monthlyData={monthlyData} setMonthlyData={setMonthlyData}
            />
          </TabsContent>

          <TabsContent value="limite">
            <div className="max-w-2xl mx-auto">
              <MeiLimitTracker 
                fatAcum={fatAcum}
                fatMensal={fat}
                setFatMensal={setFat}
                limiteAnual={LIMITE_MEI_ANUAL}
                mesesFat={mesesFat}
                setMesesFat={setMesesFat}
                mesesRestantes={mesesRestantes}
                monthlySpreadsheetData={monthlyData}
              />
            </div>
          </TabsContent>

          <TabsContent value="contas">
            <div className="max-w-2xl mx-auto">
              <AccountGuide />
            </div>
          </TabsContent>

          <TabsContent value="nfse">
            <div className="max-w-2xl mx-auto">
              <NfseGuide />
            </div>
          </TabsContent>

          <TabsContent value="guia">
            <div className="max-w-2xl mx-auto">
              <Checklist />
            </div>
          </TabsContent>

          <TabsContent value="ia">
            <div className="max-w-2xl mx-auto">
              <AiAdvisor 
                fat={fat}
                custos={custos}
                prolabore={prolabore}
                reservaPct={reservaPct}
                mesesFat={mesesFat}
              />
            </div>
          </TabsContent>
        </div>
      </Tabs>

      <footer className="pt-12 pb-6 text-center border-t border-border/50 text-xs text-muted-foreground animate-in fade-in duration-1000">
        <p>© {new Date().getFullYear()} MEI Flow. Organização e clareza para seu negócio crescer.</p>
        <p className="mt-2 opacity-50">Baseado no limite anual atual de R$ 81.000,00</p>
      </footer>
    </div>
  );
}
