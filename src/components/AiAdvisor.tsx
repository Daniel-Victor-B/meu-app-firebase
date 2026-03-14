"use client"

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Sparkles, Loader2, Target, ShieldAlert, Zap, Activity, BrainCircuit, Terminal, CheckCircle2, Wallet, PiggyBank, Calculator } from "lucide-react";
import { personalizedMeiAdvice, type PersonalizedMeiAdviceOutput } from "@/ai/flows/personalized-mei-advice";
import { type MonthlyData } from "@/app/page";
import { formatCurrency } from "@/lib/formatters";

interface AiAdvisorProps {
  fat: number;
  custos: number;
  prolabore: number;
  reservaPct: number;
  mesesFat: number;
  monthlyData: MonthlyData[];
}

export function AiAdvisor({ fat, custos, prolabore, reservaPct, mesesFat, monthlyData }: AiAdvisorProps) {
  const [loading, setLoading] = useState(false);
  const [advice, setAdvice] = useState<PersonalizedMeiAdviceOutput | null>(null);

  const spreadsheetMetrics = useMemo(() => {
    const activeMonths = monthlyData.filter(m => m.active);
    if (activeMonths.length === 0) return { avgFat: fat, avgCustos: custos, totalMonths: mesesFat };
    const sumFat = activeMonths.reduce((acc, curr) => acc + curr.receita, 0);
    const sumCustos = activeMonths.reduce((acc, curr) => acc + curr.custos, 0);
    return {
      avgFat: Math.round(sumFat / activeMonths.length),
      avgCustos: Math.round(sumCustos / activeMonths.length),
      totalMonths: activeMonths.length
    };
  }, [monthlyData, fat, custos, mesesFat]);

  useEffect(() => {
    const saved = localStorage.getItem("mei-flow-ai-advice-v3");
    if (saved) {
      try {
        setAdvice(JSON.parse(saved));
      } catch (e) { console.error(e); }
    }
  }, []);

  const getAdvice = async () => {
    setLoading(true);
    try {
      const result = await personalizedMeiAdvice({
        faturamentoMensal: spreadsheetMetrics.avgFat,
        custosOperacionais: spreadsheetMetrics.avgCustos,
        prolabore: prolabore,
        reservaPct: reservaPct,
        mesesFaturamento: spreadsheetMetrics.totalMonths,
      });
      setAdvice(result);
      localStorage.setItem("mei-flow-ai-advice-v3", JSON.stringify(result));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 pb-10">
      <Card className="border-primary/30 bg-primary/5 overflow-hidden">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto bg-primary/20 p-3 rounded-full w-fit mb-4 text-primary animate-pulse">
            <Sparkles className="w-8 h-8" />
          </div>
          <CardTitle className="text-2xl font-headline text-primary">Consultoria Financeira</CardTitle>
          <CardDescription className="text-xs uppercase tracking-widest font-bold">
            Análise de Distribuição e Eficiência de Caixa
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center pb-8 pt-4 space-y-8">
          <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20">
            <Activity className="w-3.5 h-3.5 text-primary" />
            <span className="text-[10px] font-black text-primary uppercase tracking-tight">Sincronizado com Livro de Caixa</span>
          </div>
          <Button 
            size="lg" 
            onClick={getAdvice} 
            disabled={loading}
            className="rounded-full px-12 shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all font-black uppercase tracking-widest text-xs h-14"
          >
            {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analisando Caixa...</> : "Gerar Veredito Financeiro"}
          </Button>
        </CardContent>
      </Card>

      {advice && (
        <div className="space-y-6 animate-in fade-in zoom-in duration-500">
          <Card className="overflow-hidden border-border/50 shadow-2xl bg-card">
            <div className="p-6 md:p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-border/50 pb-4">
                <h3 className="text-lg font-black tracking-tight text-foreground uppercase">Parecer do CFO</h3>
                <Badge variant="outline" className="text-[9px] font-bold text-primary uppercase tracking-widest">Protocolo de Eficiência</Badge>
              </div>
              <div className="p-10 rounded-3xl bg-black/40 border border-primary/20 shadow-inner">
                <p className="text-[11px] md:text-xs font-medium leading-relaxed text-white/90 tracking-tight text-justify italic">
                  "{advice.summary}"
                </p>
              </div>
            </div>
            <CardContent className="space-y-10 p-6 md:p-8 border-t bg-secondary/10">
              <section className="space-y-5">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 text-blue-500 rounded-xl border border-blue-500/20"><Wallet className="w-5 h-5" /></div>
                  <h4 className="font-black text-sm uppercase tracking-widest">Alocação de Capital</h4>
                </div>
                <div className="grid gap-3">
                  {advice.distributionAdvice.map((item, i) => (
                    <div key={i} className="flex gap-4 items-center p-4 rounded-2xl bg-card border border-border/50 shadow-sm">
                      <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
                      <p className="text-sm text-muted-foreground font-medium">{item}</p>
                    </div>
                  ))}
                </div>
              </section>
              <section className="space-y-5">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/10 text-purple-500 rounded-xl border border-purple-500/20"><PiggyBank className="w-5 h-5" /></div>
                  <h4 className="font-black text-sm uppercase tracking-widest">Colchão de Segurança</h4>
                </div>
                <div className="grid gap-3">
                  {advice.savingsAdvice.map((item, i) => (
                    <div key={i} className="flex gap-4 items-center p-4 rounded-2xl bg-card border border-border/50 shadow-sm">
                      <ShieldAlert className="w-4 h-4 text-purple-500 shrink-0" />
                      <p className="text-sm text-muted-foreground font-medium">{item}</p>
                    </div>
                  ))}
                </div>
              </section>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
