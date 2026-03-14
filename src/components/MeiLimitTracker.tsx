
"use client"

import { useState, useEffect, useMemo } from "react";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/formatters";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  AlertCircle, 
  Calendar, 
  TrendingUp, 
  ShieldCheck, 
  Wallet, 
  Calculator, 
  ListOrdered, 
  FileSpreadsheet,
  Building2,
  Scale,
  Sparkles,
  ArrowRight,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { type MonthlyData } from "@/app/page";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useBusiness } from "@/contexts/BusinessContext";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const MESES_NOMES = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun", 
  "Jul", "Ago", "Set", "Out", "Nov", "Dez"
];

interface MeiLimitTrackerProps {
  fatAcum: number;
  fatMensal: number;
  setFatMensal: (v: number) => void;
  limiteAnual: number;
  mesesFat: number;
  setMesesFat: (v: number) => void;
  mesesRestantes: number;
  monthlySpreadsheetData: MonthlyData[];
  custos: number;
  prolabore: number;
  setActiveTab: (v: string) => void;
}

type TrackerMode = 'average' | 'monthly' | 'spreadsheet';

export function MeiLimitTracker({ 
  fatAcum: fatAcumProp, 
  fatMensal, 
  setFatMensal,
  limiteAnual, 
  mesesFat,
  setMesesFat,
  mesesRestantes,
  monthlySpreadsheetData,
  custos,
  prolabore,
  setActiveTab
}: MeiLimitTrackerProps) {
  const [mode, setMode] = useState<TrackerMode>('average');
  const [monthlyValues, setMonthlyValues] = useState<number[]>(Array(12).fill(fatMensal));
  const { businessData } = useBusiness();

  useEffect(() => {
    const saved = localStorage.getItem("mei-flow-tracker-state");
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.mode) setMode(data.mode);
        if (data.monthlyValues) setMonthlyValues(data.monthlyValues);
      } catch (e) {
        console.error("Erro ao carregar tracker state", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("mei-flow-tracker-state", JSON.stringify({ mode, monthlyValues }));
  }, [mode, monthlyValues]);

  useEffect(() => {
    if (mode === 'average') {
      setMonthlyValues(Array(12).fill(fatMensal));
    }
  }, [fatMensal, mode]);

  const updateMonth = (index: number, val: string) => {
    const num = parseFloat(val) || 0;
    const newValues = [...monthlyValues];
    newValues[index] = num;
    setMonthlyValues(newValues);
  };

  const activeData = useMemo(() => {
    if (mode === 'spreadsheet') {
      return monthlySpreadsheetData.map(m => m.active ? m.receita : 0);
    }
    if (mode === 'monthly') {
      return monthlyValues;
    }
    return Array(12).fill(fatMensal);
  }, [mode, monthlySpreadsheetData, monthlyValues, fatMensal]);

  const projecaoAnual = activeData.reduce((acc, curr) => acc + curr, 0);
  
  const acumuladoAteAgora = useMemo(() => {
      if (mode === 'spreadsheet') {
          return monthlySpreadsheetData.reduce((acc, curr) => acc + (curr.active ? curr.receita : 0), 0);
      }
      return activeData.slice(0, mesesFat).reduce((acc, curr) => acc + curr, 0);
  }, [mode, monthlySpreadsheetData, activeData, mesesFat]);

  const percentualAcum = Math.min(100, (acumuladoAteAgora / limiteAnual) * 100);
  const restante = Math.max(0, limiteAnual - acumuladoAteAgora);
  const alertaMEI = projecaoAnual > limiteAnual * 0.8;

  const getStatusColor = (pct: number) => {
    if (pct > 80) return "bg-destructive";
    if (pct > 60) return "bg-amber-500";
    return "bg-primary";
  };

  const getStatusTextColor = (pct: number) => {
    if (pct > 80) return "text-destructive";
    if (pct > 60) return "text-amber-500";
    return "text-primary";
  };

  const getStatusText = (pct: number) => {
    if (pct > 80) return "Risco de Desenquadramento";
    if (pct > 60) return "Atenção ao Limite";
    return "Margem Segura";
  };

  // Lógica de Planejamento Tributário
  const comparativoRegimes = useMemo(() => {
    const faturamento = projecaoAnual || fatMensal * 12;
    const custosAnuais = custos * 12;
    const prolaboreAnual = prolabore * 12;
    const isServicos = businessData.ramo.toLowerCase().includes("serviços") || businessData.ramo.toLowerCase().includes("e-commerce");

    // MEI
    const meiImposto = 912; // 76 * 12
    const meiLucro = faturamento - custosAnuais - prolaboreAnual - meiImposto;
    const meiAliquota = (meiImposto / faturamento) * 100;

    // Simples Nacional (Estimado)
    const simplesRate = isServicos ? 0.11 : 0.08;
    const simplesImposto = faturamento * simplesRate;
    const simplesLucro = faturamento - custosAnuais - prolaboreAnual - simplesImposto;
    const simplesAliquota = simplesRate * 100;

    // Lucro Presumido (Estimado)
    const presuncao = isServicos ? 0.32 : 0.08;
    const basePresumida = faturamento * presuncao;
    const irpjCsll = basePresumida * 0.24; // 15% + 9%
    const pisCofinsIss = faturamento * 0.0665; // 0.65% + 3% + 3%
    const lpImposto = irpjCsll + pisCofinsIss;
    const lpLucro = faturamento - custosAnuais - prolaboreAnual - lpImposto;
    const lpAliquota = (lpImposto / faturamento) * 100;

    const findRecommendation = () => {
      if (faturamento <= 81000) return { regime: 'MEI', economy: 0 };
      if (simplesLucro > lpLucro) return { regime: 'Simples Nacional', economy: simplesLucro - lpLucro };
      return { regime: 'Lucro Presumido', economy: lpLucro - simplesLucro };
    };

    const rec = findRecommendation();

    return {
      mei: { imposto: meiImposto, aliquota: meiAliquota, lucro: meiLucro, label: 'MEI (Atual)' },
      simples: { imposto: simplesImposto, aliquota: simplesAliquota, lucro: simplesLucro, label: 'Simples Nacional' },
      lp: { imposto: lpImposto, aliquota: lpAliquota, lucro: lpLucro, label: 'Lucro Presumido' },
      recomendacao: rec
    };
  }, [projecaoAnual, fatMensal, custos, prolabore, businessData.ramo]);

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 pb-10">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div>
              <CardTitle className="text-xl font-headline">Simulador de Limite Anual</CardTitle>
              <CardDescription>Acompanhe seu teto de faturamento de R$ 81k</CardDescription>
            </div>
            
            <RadioGroup 
              value={mode} 
              onValueChange={(v) => setMode(v as TrackerMode)}
              className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-secondary/30 p-1.5 rounded-xl border border-border/50"
            >
              <div>
                <RadioGroupItem value="average" id="mode-average" className="peer sr-only" />
                <Label
                  htmlFor="mode-average"
                  className="flex flex-col items-center justify-between rounded-lg border-2 border-transparent bg-background/50 p-2 hover:bg-background hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 cursor-pointer transition-all"
                >
                  <Calculator className="mb-1 h-3 w-3 text-primary" />
                  <span className="text-[10px] font-black uppercase tracking-tight">Modo Médio</span>
                </Label>
              </div>

              <div>
                <RadioGroupItem value="monthly" id="mode-monthly" className="peer sr-only" />
                <Label
                  htmlFor="mode-monthly"
                  className="flex flex-col items-center justify-between rounded-lg border-2 border-transparent bg-background/50 p-2 hover:bg-background hover:text-accent-foreground peer-data-[state=checked]:border-blue-500 peer-data-[state=checked]:bg-blue-500/10 cursor-pointer transition-all"
                >
                  <ListOrdered className="mb-1 h-3 w-3 text-blue-500" />
                  <span className="text-[10px] font-black uppercase tracking-tight">Modo Mensal</span>
                </Label>
              </div>

              <div>
                <RadioGroupItem value="spreadsheet" id="mode-spreadsheet" className="peer sr-only" />
                <Label
                  htmlFor="mode-spreadsheet"
                  className="flex flex-col items-center justify-between rounded-lg border-2 border-transparent bg-background/50 p-2 hover:bg-background hover:text-accent-foreground peer-data-[state=checked]:border-purple-500 peer-data-[state=checked]:bg-purple-500/10 cursor-pointer transition-all"
                >
                  <FileSpreadsheet className="mb-1 h-3 w-3 text-purple-500" />
                  <span className="text-[10px] font-black uppercase tracking-tight">Sincronizado</span>
                </Label>
              </div>
            </RadioGroup>
          </div>
        </CardHeader>
        <CardContent className="space-y-8">
          
          {mode === 'spreadsheet' && (
            <div className="p-6 rounded-xl border-2 border-dashed border-purple-500/30 bg-purple-500/5 flex flex-col items-center text-center space-y-3">
               <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-500">
                  <FileSpreadsheet className="w-6 h-6" />
               </div>
               <div className="space-y-1">
                 <h4 className="text-sm font-bold text-purple-500 uppercase tracking-wider">Dados Sincronizados com a Planilha</h4>
                 <p className="text-xs text-muted-foreground leading-relaxed max-w-sm">
                   Os valores estão sendo puxados automaticamente da aba <strong>"Planilha"</strong>. 
                 </p>
               </div>
            </div>
          )}

          {mode === 'monthly' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 p-4 rounded-xl bg-secondary/30 border border-border/50">
              {MESES_NOMES.map((mes, i) => (
                <div key={mes} className="space-y-1.5">
                  <label className={`text-[10px] font-bold uppercase ${i < mesesFat ? 'text-primary' : 'text-muted-foreground'}`}>
                    {mes} {i < mesesFat ? '•' : ''}
                  </label>
                  <Input 
                    type="number" 
                    value={monthlyValues[i]} 
                    onChange={(e) => updateMonth(i, e.target.value)}
                    className="h-8 text-xs font-bold border-blue-500/20"
                  />
                </div>
              ))}
            </div>
          )}

          {mode === 'average' && (
            <div className="grid gap-6 p-4 rounded-xl bg-secondary/30 border border-border/50">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    Média Mensal
                  </label>
                  <span className="font-code font-bold text-primary">{formatCurrency(fatMensal)}</span>
                </div>
                <Slider value={[fatMensal]} min={0} max={15000} step={100} onValueChange={([v]) => setFatMensal(v)} />
              </div>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    Meses faturados
                  </label>
                  <span className="font-code font-bold text-primary">{mesesFat} meses</span>
                </div>
                <Slider value={[mesesFat]} min={1} max={12} step={1} onValueChange={([v]) => setMesesFat(v)} />
              </div>
            </div>
          )}

          <div className="space-y-3 pt-4">
            <div className="flex justify-between items-end">
              <div className="space-y-1">
                <span className={`text-xs font-bold uppercase tracking-wider ${getStatusTextColor(percentualAcum)}`}>
                  {getStatusText(percentualAcum)}
                </span>
                <div className="text-2xl font-bold font-headline">
                  {percentualAcum.toFixed(1)}% <span className="text-xs font-normal text-muted-foreground">do teto utilizado</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-muted-foreground font-bold uppercase">Projeção Anual</div>
                <div className={`text-lg font-bold font-code ${projecaoAnual > limiteAnual ? 'text-destructive' : 'text-primary'}`}>
                  {formatCurrency(projecaoAnual)}
                </div>
              </div>
            </div>
            <Progress value={percentualAcum} className="h-3" indicatorClassName={getStatusColor(percentualAcum)} />
            <div className="flex justify-between text-[10px] text-muted-foreground font-bold uppercase tracking-tighter">
              <span className={getStatusTextColor(percentualAcum)}>{formatCurrency(acumuladoAteAgora)} ACUMULADO</span>
              <span>{formatCurrency(restante)} RESTANTE</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {alertaMEI && (
        <Alert variant="destructive" className="bg-destructive/10 border-destructive/20">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle className="font-headline font-bold">Alerta de Crescimento</AlertTitle>
          <AlertDescription className="text-sm leading-relaxed mt-1">
            Sua projeção de {formatCurrency(projecaoAnual)} está acima de 80% do limite MEI.
          </AlertDescription>
        </Alert>
      )}

      {/* Seção de Planejamento para Crescimento */}
      <section className="space-y-4 pt-4 animate-in fade-in slide-in-from-bottom-6 duration-700">
        <div className="flex items-center gap-2 px-1">
          <TrendingUp className="w-5 h-5 text-primary" />
          <div>
            <h3 className="text-lg font-headline font-bold">Planejamento para Crescimento</h3>
            <p className="text-xs text-muted-foreground font-medium">Simule sua transição de regime tributário</p>
          </div>
        </div>

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="planejamento" className="border rounded-2xl px-1 bg-card/40 border-primary/20 shadow-xl overflow-hidden">
            <AccordionTrigger className="hover:no-underline py-6 px-5 group">
              <div className="flex gap-4 items-center text-left">
                <div className="bg-primary/10 text-primary p-3 rounded-xl shadow-inner group-data-[state=open]:scale-110 transition-transform">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-headline font-bold text-base tracking-tight">Comparativo Tributário Estratégico</h4>
                  <p className="text-xs text-muted-foreground font-medium line-clamp-1 group-data-[state=open]:hidden">
                    Compare MEI vs Simples Nacional vs Lucro Presumido
                  </p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-5 pb-8 pt-2">
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[comparativoRegimes.mei, comparativoRegimes.simples, comparativoRegimes.lp].map((regime, i) => (
                    <div key={i} className={`p-5 rounded-2xl border-2 transition-all relative overflow-hidden ${
                      projecaoAnual > 81000 && regime.label === 'Simples Nacional' ? 'border-primary bg-primary/5' : 'border-border/50 bg-secondary/10'
                    }`}>
                      {projecaoAnual > 81000 && regime.label === 'Simples Nacional' && (
                        <div className="absolute top-2 right-2">
                          <Badge className="bg-primary text-primary-foreground text-[8px] font-black uppercase tracking-widest">Recomendado</Badge>
                        </div>
                      )}
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{regime.label}</span>
                          <div className="text-xl font-bold">{formatCurrency(regime.lucro)}</div>
                          <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-tighter">Lucro Líquido Projetado</span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border/50">
                          <div>
                            <span className="text-[9px] font-black uppercase text-muted-foreground/60 leading-none">Imposto/ano</span>
                            <div className="text-xs font-bold text-foreground">{formatCurrency(regime.imposto)}</div>
                          </div>
                          <div>
                            <span className="text-[9px] font-black uppercase text-muted-foreground/60 leading-none">Alíquota Real</span>
                            <div className="text-xs font-bold text-primary">{regime.aliquota.toFixed(1)}%</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-6 rounded-2xl bg-primary/5 border border-primary/20 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Sparkles className="w-24 h-24 text-primary" />
                  </div>
                  <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                    <div className="space-y-2 text-center md:text-left">
                      <div className="flex items-center gap-2 justify-center md:justify-start">
                        <Scale className="w-5 h-5 text-primary" />
                        <h5 className="font-bold text-base">Veredito do Crescimento</h5>
                      </div>
                      <p className="text-xs text-muted-foreground font-medium max-w-md leading-relaxed">
                        {projecaoAnual > 81000 ? (
                          <>Seu faturamento de <strong>{formatCurrency(projecaoAnual)}</strong> exige migração. No <strong>{comparativoRegimes.recomendacao.regime}</strong>, seu lucro líquido será maximizado.</>
                        ) : (
                          <>O MEI ainda é o regime mais eficiente para sua escala atual, mas o planejamento antecipado garante uma transição sem surpresas.</>
                        )}
                      </p>
                    </div>
                    <Button 
                      onClick={() => setActiveTab('ia')}
                      className="rounded-xl gap-2 font-black uppercase tracking-widest text-[10px] h-12 px-6 shadow-xl shadow-primary/20"
                    >
                      Ver recomendação na AI Advice
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>

      <Card className="bg-primary/5 border-primary/20 shadow-sm">
        <CardContent className="pt-6">
          <div className="flex gap-4 items-start">
            <div className="bg-primary/20 p-2 rounded-lg text-primary shadow-inner">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="font-headline font-bold text-primary">Inteligência Tributária Sincronizada</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Este simulador utiliza as alíquotas médias dos Anexos do Simples Nacional e as presunções do Lucro Presumido para o seu ramo (<strong>{businessData.ramo}</strong>).
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
