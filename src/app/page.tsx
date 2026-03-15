
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
import { BusinessProfile } from "@/components/BusinessProfile";
import { 
  DollarSign, 
  Landmark, 
  LayoutList, 
  ShieldCheck, 
  Sparkles, 
  FileText, 
  BarChart3, 
  FileSpreadsheet,
  Briefcase
} from "lucide-react";

export interface MonthlyData {
  receita: number;
  custos: number;
  active: boolean;
  distribuicao?: number; // Valor transferido para PF no mês
  // Novos campos para imutabilidade paramétrica
  prolabore_usado?: number;
  reservaPct_usado?: number;
  sobra?: number;
  reserva?: number;
  lucro?: number;
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
    Array(12).fill(null).map(() => ({ receita: 5000, custos: 1500, active: true, distribuicao: 0 }))
  );

  const LIMITE_MEI_ANUAL = 81000;

  useEffect(() => {
    const saved = localStorage.getItem("mei-flow-main-state-v5");
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.fat !== undefined) setFat(data.fat);
        if (data.custos !== undefined) setCustos(data.custos);
        if (data.prolabore !== undefined) setProlabore(data.prolabore);
        if (data.reservaPct !== undefined) setReservaPct(data.reservaPct);
        if (data.mesesFat !== undefined) setMesesFat(data.mesesFat);
        if (data.activeTab !== undefined) setActiveTab(data.activeTab);
        if (data.monthlyData !== undefined) setMonthlyData(data.monthlyData);
      } catch (e) {
        console.error("Erro ao carregar dados", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("mei-flow-main-state-v5", JSON.stringify({
      fat, custos, prolabore, reservaPct, mesesFat, activeTab, monthlyData
    }));
  }, [fat, custos, prolabore, reservaPct, mesesFat, activeTab, monthlyData]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [activeTab]);

  useEffect(() => {
    setFatAcum(fat * mesesFat);
  }, [fat, mesesFat]);

  const restante = Math.max(0, LIMITE_MEI_ANUAL - fatAcum);
  const mesesRestantes = fat > 0 ? Math.floor(restante / fat) : 12;

  return (
    <div className="max-w-6xl mx-auto px-4 py-4 md:py-6 space-y-4">
      <header className="flex items-center gap-4 mb-4 animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground shadow-xl shadow-primary/20">
          <Landmark className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-headline font-bold tracking-tight">MEI Flow</h1>
          <p className="text-muted-foreground text-[10px] font-medium uppercase tracking-wider">Gestão Financeira Inteligente</p>
        </div>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-5 md:grid-cols-9 h-auto p-1 bg-background/80 backdrop-blur-md border sticky top-0 z-50 shadow-lg">
          <TabsTrigger value="distribuicao" className="flex flex-col gap-1 py-3 text-[10px] md:text-xs">
            <DollarSign className="w-4 h-4" />
            <span className="hidden sm:inline">Mensal</span>
          </TabsTrigger>
          <TabsTrigger value="negocio" className="flex flex-col gap-1 py-3 text-[10px] md:text-xs">
            <Briefcase className="w-4 h-4" />
            <span className="hidden sm:inline">Negócio</span>
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

        <div className="mt-0">
          <TabsContent value="distribuicao">
            <FinancialDistribution 
              fat={fat} setFat={setFat}
              custos={custos} setCustos={setCustos}
              prolabore={prolabore} setProlabore={setProlabore}
              reservaPct={reservaPct} setReservaPct={setReservaPct}
              setActiveTab={setActiveTab}
            />
          </TabsContent>

          <TabsContent value="negocio">
            <BusinessProfile />
          </TabsContent>

          <TabsContent value="gestao">
            <ProfessionalDashboard fat={fat} custos={custos} prolabore={prolabore} reservaPct={reservaPct} />
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
            <MeiLimitTracker 
              fatAcum={fatAcum} fatMensal={fat} setFatMensal={setFat}
              limiteAnual={LIMITE_MEI_ANUAL} mesesFat={mesesFat} setMesesFat={setMesesFat}
              mesesRestantes={mesesRestantes} monthlySpreadsheetData={monthlyData}
              custos={custos} prolabore={prolabore}
              setActiveTab={setActiveTab}
            />
          </TabsContent>

          <TabsContent value="contas">
            <AccountGuide />
          </TabsContent>

          <TabsContent value="nfse">
            <NfseGuide />
          </TabsContent>

          <TabsContent value="guia">
            <Checklist fat={fat} custos={custos} prolabore={prolabore} />
          </TabsContent>

          <TabsContent value="ia">
            <AiAdvisor 
              fat={fat} custos={custos} prolabore={prolabore}
              reservaPct={reservaPct} mesesFat={mesesFat} monthlyData={monthlyData}
            />
          </TabsContent>
        </div>
      </Tabs>

      <footer className="pt-8 pb-4 text-center border-t border-border/50 text-[10px] text-muted-foreground animate-in fade-in duration-1000">
        <p>© {new Date().getFullYear()} MEI Flow. Organização e clareza para seu negócio crescer.</p>
        <p className="mt-1 opacity-50 uppercase tracking-widest">Baseado no limite anual de R$ 81.000,00</p>
      </footer>
    </div>
  );
}
