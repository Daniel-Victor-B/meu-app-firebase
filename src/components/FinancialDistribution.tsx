"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { formatCurrency, formatPercent } from "@/lib/formatters";
import { CheckCircle2, AlertCircle } from "lucide-react";

interface FinancialDistributionProps {
  fat: number;
  setFat: (v: number) => void;
  custos: number;
  setCustos: (v: number) => void;
  prolabore: number;
  setProlabore: (v: number) => void;
  reservaPct: number;
  setReservaPct: (v: number) => void;
}

export function FinancialDistribution({ 
  fat, setFat, 
  custos, setCustos, 
  prolabore, setProlabore, 
  reservaPct, setReservaPct 
}: FinancialDistributionProps) {
  const das = 75;
  const totalDespesas = custos + das + prolabore;
  const sobra = Math.max(0, fat - totalDespesas);
  const reservaVal = Math.round((sobra * reservaPct) / 100);
  const lucroDisp = sobra - reservaVal;

  const items = [
    { label: "Custos Operacionais", val: custos, color: "bg-blue-500", icon: <CheckCircle2 className="w-4 h-4 text-blue-500" /> },
    { label: "DAS (Imposto MEI)", val: das, color: "bg-red-500", icon: <CheckCircle2 className="w-4 h-4 text-red-500" /> },
    { label: "Pró-labore", val: prolabore, color: "bg-orange-500", icon: <CheckCircle2 className="w-4 h-4 text-orange-500" /> },
    { label: "Reserva Empresa", val: reservaVal, color: "bg-purple-500", icon: <CheckCircle2 className="w-4 h-4 text-purple-500" /> },
    { label: "Lucro Disponível", val: lucroDisp, color: "bg-primary", icon: <CheckCircle2 className="w-4 h-4 text-primary" /> },
  ];

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-headline">Configurações Mensais</CardTitle>
          <CardDescription>Ajuste os valores para ver a distribuição ideal</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="space-y-4">
            <div className="flex justify-between">
              <label className="text-sm font-medium">Faturamento Mensal</label>
              <span className="font-code font-bold text-primary">{formatCurrency(fat)}</span>
            </div>
            <Slider value={[fat]} min={500} max={15000} step={100} onValueChange={([v]) => setFat(v)} />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between">
              <label className="text-sm font-medium">Custos Operacionais</label>
              <span className="font-code font-bold text-blue-500">{formatCurrency(custos)}</span>
            </div>
            <Slider value={[custos]} min={0} max={fat * 0.8} step={50} onValueChange={([v]) => setCustos(v)} />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between">
              <label className="text-sm font-medium">Pró-labore (Salário)</label>
              <span className="font-code font-bold text-orange-500">{formatCurrency(prolabore)}</span>
            </div>
            <Slider value={[prolabore]} min={0} max={fat * 0.7} step={50} onValueChange={([v]) => setProlabore(v)} />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between">
              <label className="text-sm font-medium">Reserva PJ (% da sobra)</label>
              <span className="font-code font-bold text-purple-500">{reservaPct}%</span>
            </div>
            <Slider value={[reservaPct]} min={0} max={100} step={5} onValueChange={([v]) => setReservaPct(v)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-headline">Distribuição Recomendada</CardTitle>
          <CardDescription>Como seu dinheiro será fatiado este mês</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex h-3 w-full rounded-full overflow-hidden bg-secondary">
            {items.map((item, idx) => (
              <div 
                key={idx} 
                className={`${item.color} transition-all duration-500`} 
                style={{ width: formatPercent(item.val, fat) }} 
              />
            ))}
          </div>

          <div className="grid gap-3 pt-4">
            {items.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border/50 hover:bg-secondary/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-1 h-10 rounded-full ${item.color}`} />
                  <div>
                    <div className="text-sm font-bold">{item.label}</div>
                    <div className="text-xs text-muted-foreground">{formatPercent(item.val, fat)} do total</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-code font-bold text-lg">{formatCurrency(item.val)}</div>
                </div>
              </div>
            ))}
          </div>

          {sobra <= 0 && (
            <div className="mt-4 flex gap-2 items-center p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>Cuidado: Suas despesas superam o faturamento.</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
