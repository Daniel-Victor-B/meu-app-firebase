"use client"

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Sparkles, Loader2, Target, ShieldAlert, Zap, Activity, BrainCircuit, Terminal } from "lucide-react";
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
            <div className="relative overflow-hidden">
               {/* Background Elements */}
               <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                  <BrainCircuit className="w-48 h-48 text-primary" />
               </div>
               <div className="absolute -left-10 -top-10 w-40 h-40 bg-primary/5 blur-[80px] rounded-full" />

               <div className="p-6 md:p-8 space-y-6 relative z-10">
                  {/* Header do Diagnóstico */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/50 pb-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                        <span className="text-[9px] font-black uppercase tracking-[0.4em] text-primary">Veredito Estratégico</span>
                      </div>
                      <h3 className="text-lg font-black tracking-tight text-foreground uppercase">Diagnóstico do Consultor</h3>
                    </div>
                    <div className="flex gap-2">
                      <div className="flex items-center gap-2 bg-black/40 px-2.5 py-1 rounded-lg border border-white/5 text-[8px] font-bold text-muted-foreground uppercase tracking-widest">
                        <Terminal className="w-3 h-3 text-primary" />
                        Live Intel
                      </div>
                    </div>
                  </div>
                  
                  {/* Bloco Central do Parecer - Bloco Perfeito */}
                  <div className="relative p-6 md:p-10 rounded-3xl bg-black/40 border border-primary/20 shadow-inner overflow-hidden flex items-center justify-center min-h-[160px]">
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-50" />
                    <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-primary/10 blur-[50px] rounded-full animate-pulse" />
                    
                    <div className="absolute top-4 right-5 flex items-center gap-1.5 opacity-40">
                       <div className="h-1 w-1 rounded-full bg-primary" />
                       <span className="text-[7px] font-black text-primary uppercase tracking-[0.3em]">AI Synthesis</span>
                    </div>

                    <p className="relative z-10 text-xs md:text-sm font-medium leading-relaxed text-white/90 tracking-tight text-justify italic">
                      "{advice.summary}"
                    </p>
                  </div>

                  {/* Cards de Métricas Rápidas - Design Vivo e Didático */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="relative group overflow-hidden p-5 rounded-3xl bg-indigo-500/5 border border-indigo-500/20 transition-all hover:bg-indigo-500/10 hover:border-indigo-500/40 shadow-sm">
                      <div className="absolute top-0 right-0 -mr-4 -mt-4 w-20 h-20 bg-indigo-500/10 blur-2xl rounded-full" />
                      <div className="flex items-center gap-5 relative z-10">
                        <div className="p-3.5 bg-gradient-to-br from-indigo-500/20 to-indigo-600/5 rounded-2xl text-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.2)] border border-indigo-500/10">
                          <Activity className="w-5 h-5" />
                        </div>
                        <div className="space-y-1.5 flex-1">
                          <div className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.25em] leading-none">Saúde Operacional</div>
                          <div className="text-sm font-black text-foreground tracking-tight">Estabilidade de Caixa</div>
                          <div className="flex items-center gap-2 pt-1">
                            <div className="h-1.5 flex-1 bg-indigo-500/20 rounded-full overflow-hidden">
                              <div className="h-full w-[85%] bg-indigo-500 animate-in slide-in-from-left duration-1000" />
                            </div>
                            <span className="text-[9px] font-black text-indigo-400">SAFE</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="relative group overflow-hidden p-5 rounded-3xl bg-amber-500/5 border border-amber-500/20 transition-all hover:bg-amber-500/10 hover:border-amber-500/40 shadow-sm">
                      <div className="absolute top-0 right-0 -mr-4 -mt-4 w-20 h-20 bg-amber-500/10 blur-2xl rounded-full" />
                      <div className="flex items-center gap-5 relative z-10">
                        <div className="p-3.5 bg-gradient-to-br from-amber-500/20 to-amber-600/5 rounded-2xl text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.2)] border border-amber-500/10">
                          <Zap className="w-5 h-5" />
                        </div>
                        <div className="space-y-1.5 flex-1">
                          <div className="text-[9px] font-black text-amber-400 uppercase tracking-[0.25em] leading-none">Potencial de Escala</div>
                          <div className="text-sm font-black text-foreground tracking-tight">Capacidade de Expansão</div>
                          <div className="flex items-center gap-2 pt-1">
                            <div className="h-1.5 flex-1 bg-amber-500/20 rounded-full overflow-hidden">
                              <div className="h-full w-[65%] bg-amber-500 animate-in slide-in-from-left duration-1000" />
                            </div>
                            <span className="text-[9px] font-black text-amber-400">HIGH</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
               </div>
            </div>

            <CardContent className="space-y-8 p-6 md:p-8 border-t bg-secondary/10">
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
