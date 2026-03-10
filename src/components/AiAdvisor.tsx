"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Sparkles, Loader2, MessageSquare, Target, ShieldAlert } from "lucide-react";
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
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 text-primary mb-1">
                <MessageSquare className="w-5 h-5" />
                <span className="text-xs font-bold uppercase tracking-wider">Diagnóstico Geral</span>
              </div>
              <CardTitle className="text-lg font-headline leading-relaxed">
                {advice.summary}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
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
