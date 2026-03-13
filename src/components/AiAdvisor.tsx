"use client"

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Sparkles, Loader2, Target, ShieldAlert, Zap, Activity, BrainCircuit, Terminal, CheckCircle2, Briefcase, TrendingUp, Target as TargetIcon, Users } from "lucide-react";
import { personalizedMeiAdvice, type PersonalizedMeiAdviceOutput } from "@/ai/flows/personalized-mei-advice";
import { type MonthlyData } from "@/app/page";
import { useBusiness } from "@/contexts/BusinessContext";
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
  const { businessData } = useBusiness();

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

  const visualMetrics = useMemo(() => {
    const das = 76;
    const currentFat = spreadsheetMetrics.avgFat;
    const totalOut = spreadsheetMetrics.avgCustos + das + prolabore;
    const margin = currentFat > 0 ? ((currentFat - totalOut) / currentFat) * 100 : 0;
    
    const saudeScore = Math.min(100, Math.max(0, margin * 2.5));
    const saudeLabel = margin > 30 ? "SAFE" : margin > 15 ? "STABLE" : "CRITICAL";

    const limiteMEI = 81000;
    const acumulado = currentFat * spreadsheetMetrics.totalMonths;
    const usage = (acumulado / limiteMEI) * 100;
    const escalaScore = Math.min(100, 100 - usage);
    const escalaLabel = usage < 50 ? "HIGH" : usage < 85 ? "MODERATE" : "RISK";

    return { saudeScore, saudeLabel, escalaScore, escalaLabel, margin, usage };
  }, [spreadsheetMetrics, prolabore]);

  useEffect(() => {
    const saved = localStorage.getItem("mei-flow-ai-advice-v3");
    if (saved) {
      try {
        setAdvice(JSON.parse(saved));
      } catch (e) {
        console.error("Erro ao carregar conselho", e);
      }
    }
  }, []);

  useEffect(() => {
    if (advice) {
      localStorage.setItem("mei-flow-ai-advice-v3", JSON.stringify(advice));
    }
  }, [advice]);

  const getAdvice = async () => {
    setLoading(true);
    try {
      const result = await personalizedMeiAdvice({
        faturamentoMensal: spreadsheetMetrics.avgFat,
        custosOperacionais: spreadsheetMetrics.avgCustos,
        prolabore: prolabore,
        reservaPct: reservaPct,
        mesesFaturamento: spreadsheetMetrics.totalMonths,
        meiLimiteAnual: 81000,
        ramo: businessData.ramo,
        nomeNegocio: businessData.nomeNegocio,
        modeloNegocio: businessData.modeloNegocio,
        canaisVenda: businessData.canaisVenda || [],
        ticketMedio: Number(businessData.ticketMedio) || 0,
        numClientes: Number(businessData.numClientes) || 0,
        desafio: businessData.desafio,
        meta: businessData.meta,
      });
      setAdvice(result);
    } catch (error) {
      console.error("Failed to fetch advice", error);
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
          <CardTitle className="text-2xl font-headline text-primary">Consultoria de IA</CardTitle>
          <CardDescription className="text-xs uppercase tracking-widest font-bold">
            Inteligência Estratégica Baseada no Perfil do seu Negócio
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center pb-8 pt-4 space-y-8">
          
          <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl">
            <div className="p-4 rounded-2xl bg-background/50 border border-border/50 flex items-center gap-4">
              <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-500">
                <Briefcase className="w-5 h-5" />
              </div>
              <div className="space-y-0.5 min-w-0">
                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">Identidade</p>
                <p className="text-xs font-bold text-foreground truncate">{businessData.nomeNegocio || 'MEI sem nome'}</p>
                <p className="text-[9px] font-medium text-muted-foreground truncate opacity-70">{businessData.ramo}</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-background/50 border border-border/50 flex items-center gap-4">
              <div className="p-2.5 bg-amber-500/10 rounded-xl text-amber-500">
                <TargetIcon className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">Meta & Modelo</p>
                <p className="text-xs font-bold text-foreground">{businessData.meta}</p>
                <p className="text-[9px] font-medium text-muted-foreground opacity-70">{businessData.modeloNegocio}</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-background/50 border border-border/50 flex items-center gap-4">
              <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                <Users className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">Volume & Ticket</p>
                <p className="text-xs font-bold text-foreground">{businessData.numClientes} Clientes</p>
                <p className="text-[9px] font-medium text-muted-foreground opacity-70">Ticket: {formatCurrency(businessData.ticketMedio)}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20">
            <Activity className="w-3.5 h-3.5 text-primary" />
            <span className="text-[10px] font-black text-primary uppercase tracking-tight">Análise cruzada com Livro de Caixa e Perfil Estratégico</span>
          </div>

          <Button 
            size="lg" 
            onClick={getAdvice} 
            disabled={loading}
            className="rounded-full px-12 shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all font-black uppercase tracking-widest text-xs h-14"
          >
            {loading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Mapeando Mercado...</>
            ) : (
              "Gerar Diagnóstico de Elite"
            )}
          </Button>
        </CardContent>
      </Card>

      {advice && (
        <div className="space-y-6 animate-in fade-in zoom-in duration-500">
          <Card className="overflow-hidden border-border/50 shadow-2xl bg-card">
            <div className="relative">
               <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                  <BrainCircuit className="w-48 h-48 text-primary" />
               </div>

               <div className="p-6 md:p-8 space-y-6">
                  <div className="flex items-center justify-between border-b border-border/50 pb-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                        <span className="text-[9px] font-black uppercase tracking-[0.4em] text-primary">Protocolo de Elite</span>
                      </div>
                      <h3 className="text-lg font-black tracking-tight text-foreground uppercase">Veredito do Consultor</h3>
                    </div>
                    <div className="flex items-center gap-2 bg-black/40 px-3 py-1 rounded-lg border border-white/5 text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                      <Terminal className="w-3.5 h-3.5 text-primary" />
                      Strategic Analysis
                    </div>
                  </div>
                  
                  <div className="relative p-8 rounded-3xl bg-black/40 border border-primary/20 shadow-inner flex items-center justify-center min-h-[140px] overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-50" />
                    <p className="relative z-10 text-[11px] md:text-xs font-medium leading-relaxed text-white/90 tracking-tight text-justify italic max-w-2xl">
                      "{advice.summary}"
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="relative overflow-hidden p-5 rounded-3xl bg-indigo-500/5 border border-indigo-500/20 transition-all hover:bg-indigo-500/10 shadow-sm">
                      <div className="flex items-center gap-5 relative z-10">
                        <div className="p-3.5 bg-indigo-500/20 rounded-2xl text-indigo-400 border border-indigo-500/10 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                          <Activity className="w-5 h-5" />
                        </div>
                        <div className="space-y-1.5 flex-1">
                          <div className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.2em] leading-none">Saúde Operacional</div>
                          <div className="text-sm font-black text-foreground">Estabilidade de Caixa</div>
                          <div className="flex items-center gap-2 pt-1">
                            <div className="h-1.5 flex-1 bg-indigo-500/20 rounded-full overflow-hidden">
                              <div className="h-full bg-indigo-400 transition-all duration-1000" style={{ width: `${visualMetrics.saudeScore}%` }} />
                            </div>
                            <span className="text-[10px] font-black text-indigo-400">{visualMetrics.saudeLabel}</span>
                          </div>
                          <div className="text-[8px] font-bold text-muted-foreground uppercase tracking-wider">{visualMetrics.margin.toFixed(1)}% de sobra real</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="relative overflow-hidden p-5 rounded-3xl bg-amber-500/5 border border-amber-500/20 transition-all hover:bg-amber-500/10 shadow-sm">
                      <div className="flex items-center gap-5 relative z-10">
                        <div className="p-3.5 bg-amber-500/20 rounded-2xl text-amber-400 border border-amber-500/10 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                          <Zap className="w-5 h-5" />
                        </div>
                        <div className="space-y-1.5 flex-1">
                          <div className="text-[9px] font-black text-amber-400 uppercase tracking-[0.2em] leading-none">Potencial de Escala</div>
                          <div className="text-sm font-black text-foreground">Capacidade de Expansão</div>
                          <div className="flex items-center gap-2 pt-1">
                            <div className="h-1.5 flex-1 bg-amber-500/20 rounded-full overflow-hidden">
                              <div className="h-full bg-amber-400 transition-all duration-1000" style={{ width: `${visualMetrics.escalaScore}%` }} />
                            </div>
                            <span className="text-[10px] font-black text-amber-400">{visualMetrics.escalaLabel}</span>
                          </div>
                          <div className="text-[8px] font-bold text-muted-foreground uppercase tracking-wider">{visualMetrics.usage.toFixed(1)}% do teto utilizado</div>
                        </div>
                      </div>
                    </div>
                  </div>
               </div>
            </div>

            <CardContent className="space-y-10 p-6 md:p-8 border-t bg-secondary/10">
              <section className="space-y-5">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 text-blue-500 rounded-xl border border-blue-500/20 shadow-inner">
                    <Target className="w-5 h-5" />
                  </div>
                  <h4 className="font-black text-sm uppercase tracking-widest text-foreground">Plano de Alocação</h4>
                </div>
                <div className="grid gap-3">
                  {advice.distributionAdvice.map((item, i) => (
                    <div key={i} className="group flex gap-4 items-center p-4 rounded-2xl bg-card border border-border/50 hover:border-blue-500/30 transition-all shadow-sm">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <p className="text-sm text-muted-foreground font-medium group-hover:text-foreground transition-colors">{item}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="space-y-5">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-destructive/10 text-destructive rounded-xl border border-destructive/20 shadow-inner">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <h4 className="font-black text-sm uppercase tracking-widest text-foreground">Gestão de Teto</h4>
                </div>
                <div className="grid gap-3">
                  {advice.meiLimitAdvice.map((item, i) => (
                    <div key={i} className="group flex gap-4 items-center p-4 rounded-2xl bg-card border border-border/50 hover:border-destructive/30 transition-all shadow-sm">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center text-destructive group-hover:scale-110 transition-transform">
                        <ShieldAlert className="w-4 h-4" />
                      </div>
                      <p className="text-sm text-muted-foreground font-medium group-hover:text-foreground transition-colors">{item}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="space-y-5">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 text-primary rounded-xl border border-primary/20 shadow-inner">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <h4 className="font-black text-sm uppercase tracking-widest text-foreground">Aceleração de Lucro</h4>
                </div>
                <div className="grid gap-3">
                  {advice.optimizationSuggestions.map((item, i) => (
                    <div key={i} className="group flex gap-4 items-center p-4 rounded-2xl bg-card border border-border/50 hover:border-primary/30 transition-all shadow-sm">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                        <Zap className="w-4 h-4" />
                      </div>
                      <p className="text-sm text-muted-foreground font-medium group-hover:text-foreground transition-colors">{item}</p>
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
