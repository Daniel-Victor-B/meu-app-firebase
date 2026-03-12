
"use client"

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Sparkles, Loader2, MessageSquare, Target, ShieldAlert, Zap, Info, ShieldCheck, Activity, BrainCircuit, Terminal, ChevronRight } from "lucide-react";
import { personalizedMeiAdvice, type PersonalizedMeiAdviceOutput } from "@/ai/flows/personalized-mei-advice";

interface AiAdvisorProps {
  fat: number;
  custos: number;
  prolabore: number;
  reservaPct: number;
  mesesFat: number;
}

export function AiAdvisor({ fat, custos, prolabore, reservaPct, mesesFat }: AiAdvisorProps) {
  const [loading, setLoading] = useState(false);
  const [advice, setAdvice] = useState<PersonalizedMeiAdviceOutput | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("mei-flow-ai-advice");
    if (saved) {
      try {
        setAdvice(JSON.parse(saved));
      } catch (e) {
        console.error("Erro ao carregar conselho da IA", e);
      }
    }
  }, []);

  useEffect(() => {
    if (advice) {
      localStorage.setItem("mei-flow-ai-advice", JSON.stringify(advice));
    }
  }, [advice]);

  const getAdvice = async () => {
    setLoading(true);
    try {
      const result = await personalizedMeiAdvice({
        faturamentoMensal: fat,
        custosOperacionais: custos,
        prolabore: prolabore,
        reservaPct: reservaPct,
        mesesFaturamento: mesesFat,
        meiLimiteAnual: 81000,
      });
      setAdvice(result);
    } catch (error) {
      console.error("Failed to fetch advice", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <Card className="border-primary/30 bg-primary/5">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary/20 p-3 rounded-full w-fit mb-4 text-primary">
            <Sparkles className="w-8 h-8" />
          </div>
          <CardTitle className="text-2xl font-headline text-primary">Consultoria de IA</CardTitle>
          <CardDescription>
            Receba uma análise detalhada e personalizada baseada nos seus números atuais.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center pb-8">
          <Button 
            size="lg" 
            onClick={getAdvice} 
            disabled={loading}
            className="rounded-full px-8 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all font-bold"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analisando Cenário...
              </>
            ) : (
              "Gerar Aconselhamento"
            )}
          </Button>
        </CardContent>
      </Card>

      {advice && (
        <div className="space-y-6 animate-in fade-in zoom-in duration-500">
          <Card className="overflow-hidden border-primary/20 shadow-2xl bg-card">
            {/* NOVO BLOCO DE DIAGNÓSTICO ESTRATÉGICO */}
            <div className="relative overflow-hidden">
               {/* Decoração de Fundo High-Tech */}
               <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                  <BrainCircuit className="w-32 h-32 text-primary" />
               </div>
               <div className="absolute -left-10 -top-10 w-40 h-40 bg-primary/5 blur-[80px] rounded-full" />

               <div className="p-8 md:p-10 space-y-8 relative z-10">
                  {/* Header do Briefing */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/50 pb-6">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Status: Análise de Elite</span>
                      </div>
                      <h3 className="text-xl font-black tracking-tight text-foreground uppercase">Diagnóstico Estratégico</h3>
                    </div>
                    <div className="flex gap-2">
                      <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-lg border border-white/5 text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                        <Terminal className="w-3 h-3 text-primary" />
                        DeepSeek-R1
                      </div>
                      <div className="flex items-center gap-2 bg-primary/10 px-3 py-1.5 rounded-lg border border-primary/10 text-[9px] font-bold text-primary uppercase tracking-widest">
                        <Target className="w-3 h-3" />
                        Live Intel
                      </div>
                    </div>
                  </div>
                  
                  {/* O "Puts" no Cérebro: Texto do Diagnóstico com Design Didático */}
                  <div className="flex gap-6 items-start">
                    <div className="hidden md:flex flex-col items-center gap-2 shrink-0 pt-1">
                      <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-inner">
                        <MessageSquare className="w-5 h-5" />
                      </div>
                      <div className="w-0.5 h-20 bg-gradient-to-b from-primary/30 to-transparent rounded-full" />
                    </div>
                    
                    <div className="space-y-4 flex-1">
                      <div className="inline-block px-3 py-1 rounded-full bg-secondary text-[10px] font-black uppercase tracking-widest text-muted-foreground border border-border/50">
                        Visão Geral do Negócio
                      </div>
                      <p className="text-lg md:text-xl font-medium leading-relaxed text-foreground/90 tracking-tight">
                        {advice.summary}
                      </p>
                    </div>
                  </div>

                  {/* Badges de Insight Rápido */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                    <div className="p-4 rounded-2xl bg-secondary/30 border border-border/50 flex items-center gap-4 group hover:bg-secondary/50 transition-all">
                      <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-500">
                        <Activity className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Fator de Risco</div>
                        <div className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">Operação Calculada</div>
                      </div>
                    </div>
                    <div className="p-4 rounded-2xl bg-secondary/30 border border-border/50 flex items-center gap-4 group hover:bg-secondary/50 transition-all">
                      <div className="p-2 bg-amber-500/10 rounded-xl text-amber-500">
                        <Zap className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Alerta de Escala</div>
                        <div className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">Otimização de Pró-labore</div>
                      </div>
                    </div>
                  </div>
               </div>
            </div>

            <CardContent className="space-y-8 p-8 md:p-10 border-t bg-secondary/10">
              <section className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-blue-500/10 text-blue-500 rounded-md">
                    <Target className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-sm uppercase tracking-wider">Estratégia de Distribuição</h4>
                </div>
                <ul className="grid gap-3">
                  {advice.distributionAdvice.map((item, i) => (
                    <li key={i} className="flex gap-3 text-sm text-muted-foreground bg-secondary/20 p-3 rounded-lg border border-border/50">
                      <div className="w-1 h-full bg-blue-500 rounded-full shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-destructive/10 text-destructive rounded-md">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-sm uppercase tracking-wider">Gestão do Limite Anual</h4>
                </div>
                <ul className="grid gap-3">
                  {advice.meiLimitAdvice.map((item, i) => (
                    <li key={i} className="flex gap-3 text-sm text-muted-foreground bg-secondary/20 p-3 rounded-lg border border-border/50">
                      <div className="w-1 h-full bg-destructive rounded-full shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-primary/10 text-primary rounded-md">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-sm uppercase tracking-wider">Sugestões de Otimização</h4>
                </div>
                <ul className="grid gap-3">
                  {advice.optimizationSuggestions.map((item, i) => (
                    <li key={i} className="flex gap-3 text-sm text-muted-foreground bg-secondary/20 p-3 rounded-lg border border-border/50">
                      <div className="w-1 h-full bg-primary rounded-full shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </section>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
