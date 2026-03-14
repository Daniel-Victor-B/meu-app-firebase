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
  Calculator, 
  ListOrdered, 
  FileSpreadsheet,
  Building2,
  Scale,
  Sparkles,
  ArrowRight,
  Loader2,
  ShieldAlert,
  Zap,
  Activity
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
import { meiLimitAdvice, type MeiLimitAdviceOutput } from "@/ai/flows/mei-limit-advice";

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
  fatMensal, setFatMensal, limiteAnual, mesesFat, setMesesFat, monthlySpreadsheetData, custos, prolabore 
}: MeiLimitTrackerProps) {
  const [mode, setMode] = useState<TrackerMode>('average');
  const [monthlyValues, setMonthlyValues] = useState<number[]>(Array(12).fill(fatMensal));
  const { businessData } = useBusiness();
  const [loading, setLoading] = useState(false);
  const [limitAdvice, setLimitAdvice] = useState<MeiLimitAdviceOutput | null>(null);

  useEffect(() => {
    if (mode === 'average') setMonthlyValues(Array(12).fill(fatMensal));
  }, [fatMensal, mode]);

  const activeData = useMemo(() => {
    if (mode === 'spreadsheet') return monthlySpreadsheetData.map(m => m.active ? m.receita : 0);
    if (mode === 'monthly') return monthlyValues;
    return Array(12).fill(fatMensal);
  }, [mode, monthlySpreadsheetData, monthlyValues, fatMensal]);

  const projecaoAnual = activeData.reduce((acc, curr) => acc + curr, 0);
  const acumuladoAteAgora = useMemo(() => {
      if (mode === 'spreadsheet') return monthlySpreadsheetData.reduce((acc, curr) => acc + (curr.active ? curr.receita : 0), 0);
      return activeData.slice(0, mesesFat).reduce((acc, curr) => acc + curr, 0);
  }, [mode, monthlySpreadsheetData, activeData, mesesFat]);

  const percentualAcum = Math.min(100, (acumuladoAteAgora / limiteAnual) * 100);
  const restante = Math.max(0, limiteAnual - acumuladoAteAgora);
  const alertaMEI = projecaoAnual > limiteAnual * 0.8;

  const getLimitAdvice = async () => {
    setLoading(true);
    try {
      const result = await meiLimitAdvice({
        projecaoAnual,
        acumulado: acumuladoAteAgora,
        ramo: businessData.ramo,
        custosAnuais: custos * 12,
        prolaboreAnual: prolabore * 12,
      });
      setLimitAdvice(result);
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 pb-10">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div>
              <CardTitle className="text-xl font-headline">Simulador de Limite Anual</CardTitle>
              <CardDescription>Acompanhe seu teto de R$ 81k</CardDescription>
            </div>
            <RadioGroup value={mode} onValueChange={(v) => setMode(v as TrackerMode)} className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-secondary/30 p-1.5 rounded-xl">
              <Label htmlFor="mode-average" className="flex flex-col items-center p-2 rounded-lg cursor-pointer peer-data-[state=checked]:bg-primary/10">
                <RadioGroupItem value="average" id="mode-average" className="sr-only" />
                <Calculator className="h-3 w-3 text-primary" />
                <span className="text-[10px] font-black uppercase">Médio</span>
              </Label>
              <Label htmlFor="mode-spreadsheet" className="flex flex-col items-center p-2 rounded-lg cursor-pointer peer-data-[state=checked]:bg-purple-500/10">
                <RadioGroupItem value="spreadsheet" id="mode-spreadsheet" className="sr-only" />
                <FileSpreadsheet className="h-3 w-3 text-purple-500" />
                <span className="text-[10px] font-black uppercase">Sinc</span>
              </Label>
            </RadioGroup>
          </div>
        </CardHeader>
        <CardContent className="space-y-8">
          {mode === 'average' && (
            <div className="grid gap-6 p-4 bg-secondary/30 rounded-xl">
              <div className="space-y-4">
                <div className="flex justify-between"><Label>Média Mensal</Label><span className="font-bold text-primary">{formatCurrency(fatMensal)}</span></div>
                <Slider value={[fatMensal]} min={0} max={15000} step={100} onValueChange={([v]) => setFatMensal(v)} />
              </div>
              <div className="space-y-4">
                <div className="flex justify-between"><Label>Meses faturados</Label><span className="font-bold text-primary">{mesesFat} meses</span></div>
                <Slider value={[mesesFat]} min={1} max={12} step={1} onValueChange={([v]) => setMesesFat(v)} />
              </div>
            </div>
          )}
          <div className="space-y-3 pt-4">
            <div className="flex justify-between items-end">
              <div className="text-2xl font-bold">{percentualAcum.toFixed(1)}% <span className="text-xs text-muted-foreground">do teto utilizado</span></div>
              <div className="text-right"><div className="text-lg font-bold text-primary">{formatCurrency(projecaoAnual)} <span className="text-xs font-normal">proj.</span></div></div>
            </div>
            <Progress value={percentualAcum} className="h-3" />
            <div className="flex justify-between text-[10px] font-bold uppercase">
              <span>{formatCurrency(acumuladoAteAgora)} ACUMULADO</span>
              <span>{formatCurrency(restante)} RESTANTE</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Análise Inteligente do Limite */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-headline font-bold">Análise Inteligente de Transição</h3>
          </div>
          <Button onClick={getLimitAdvice} disabled={loading} className="rounded-full shadow-lg shadow-primary/20">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
            Analisar Transição
          </Button>
        </div>

        {limitAdvice && (
          <div className="grid gap-4 animate-in slide-in-from-bottom-2 duration-500">
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-6 space-y-4">
                <div className="p-4 bg-background/50 rounded-xl border border-primary/10">
                  <div className="text-[10px] font-black uppercase text-primary mb-1">Risco e Momento</div>
                  <p className="text-xs leading-relaxed text-muted-foreground"><strong>Risco:</strong> {limitAdvice.riskAnalysis}</p>
                  <p className="text-xs leading-relaxed text-muted-foreground mt-2"><strong>Timing:</strong> {limitAdvice.migrationTiming}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="text-[10px] font-black uppercase text-primary">Otimização Fiscal</div>
                    {limitAdvice.fiscalOptimization.map((o, i) => (
                      <div key={i} className="flex gap-2 text-xs text-muted-foreground"><Zap className="w-3.5 h-3.5 text-primary" /> {o}</div>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <div className="text-[10px] font-black uppercase text-primary">Impacto no Lucro</div>
                    {limitAdvice.profitImpact.map((p, i) => (
                      <div key={i} className="flex gap-2 text-xs text-muted-foreground"><Activity className="w-3.5 h-3.5 text-primary" /> {p}</div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </section>

      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-6 flex gap-4 items-start">
          <ShieldCheck className="w-6 h-6 text-primary shrink-0" />
          <div className="space-y-1">
            <h4 className="font-bold text-primary">Inteligência Tributária Sincronizada</h4>
            <p className="text-xs text-muted-foreground">Cálculos baseados nas alíquotas reais para o ramo {businessData.ramo}.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
