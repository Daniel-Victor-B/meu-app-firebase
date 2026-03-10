
"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatPercent } from "@/lib/formatters";
import { AlertCircle, PenLine, ChevronUp, ChevronDown } from "lucide-react";

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
  const das = 76;
  const totalDespesas = custos + das + prolabore;
  const sobra = Math.max(0, fat - totalDespesas);
  const reservaVal = Math.round((sobra * reservaPct) / 100);
  const lucroDisp = sobra - reservaVal;

  const items = [
    { label: "Faturamento", val: fat, color: "bg-indigo-500", text: "text-indigo-500", hidden: true }, 
    { label: "Custos Operacionais", val: custos, color: "bg-orange-500", text: "text-orange-500" },
    { label: "DAS (Imposto MEI)", val: das, color: "bg-red-500", text: "text-red-500" },
    { label: "Pró-labore (Salário)", val: prolabore, color: "bg-blue-500", text: "text-blue-500" },
    { label: "Reserva Empresa", val: reservaVal, color: "bg-purple-500", text: "text-purple-500" },
    { label: "Lucro Disponível", val: lucroDisp, color: "bg-primary", text: "text-primary" },
  ];

  const displayItems = items.filter(i => !i.hidden);

  const StepButtons = ({ onUp, onDown, colorClass }: { onUp: () => void, onDown: () => void, colorClass: string }) => (
    <div className="flex flex-col -space-y-px">
      <Button 
        variant="ghost" 
        size="icon" 
        className={`h-4 w-6 rounded-t-md rounded-b-none border border-border hover:bg-secondary ${colorClass}`}
        onClick={onUp}
      >
        <ChevronUp className="w-3 h-3" />
      </Button>
      <Button 
        variant="ghost" 
        size="icon" 
        className={`h-4 w-6 rounded-b-md rounded-t-none border border-border hover:bg-secondary ${colorClass}`}
        onClick={onDown}
      >
        <ChevronDown className="w-3 h-3" />
      </Button>
    </div>
  );

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-headline">Configurações Mensais</CardTitle>
          <CardDescription>Ajuste os valores com precisão para ver a distribuição</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Faturamento */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-indigo-500/5 border border-indigo-500/10">
            <div className="flex items-center gap-3">
              <StepButtons 
                onUp={() => setFat(fat + 100)} 
                onDown={() => setFat(Math.max(0, fat - 100))} 
                colorClass="text-indigo-500"
              />
              <label className="text-sm font-bold text-indigo-500 uppercase tracking-tight">Faturamento</label>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-muted-foreground uppercase">R$</span>
              <div className="relative group/input">
                <Input 
                  type="number" 
                  value={fat} 
                  onChange={(e) => setFat(parseFloat(e.target.value) || 0)}
                  className="w-28 h-9 text-right font-code font-bold text-indigo-500 bg-background/50 border-indigo-500/20 focus-visible:ring-1 focus-visible:ring-indigo-500 pr-7"
                />
                <PenLine className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-indigo-500/30" />
              </div>
            </div>
          </div>

          {/* Custos */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-orange-500/5 border border-orange-500/10">
            <div className="flex items-center gap-3">
              <StepButtons 
                onUp={() => setCustos(custos + 50)} 
                onDown={() => setCustos(Math.max(0, custos - 50))} 
                colorClass="text-orange-500"
              />
              <label className="text-sm font-bold text-orange-500 uppercase tracking-tight">Custos Operacionais</label>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-muted-foreground uppercase">R$</span>
              <div className="relative group/input">
                <Input 
                  type="number" 
                  value={custos} 
                  onChange={(e) => setCustos(parseFloat(e.target.value) || 0)}
                  className="w-28 h-9 text-right font-code font-bold text-orange-500 bg-background/50 border-orange-500/20 focus-visible:ring-1 focus-visible:ring-orange-500 pr-7"
                />
                <PenLine className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-orange-500/30" />
              </div>
            </div>
          </div>

          {/* Pró-labore */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-blue-500/5 border border-blue-500/10">
            <div className="flex items-center gap-3">
              <StepButtons 
                onUp={() => setProlabore(prolabore + 50)} 
                onDown={() => setProlabore(Math.max(0, prolabore - 50))} 
                colorClass="text-blue-500"
              />
              <label className="text-sm font-bold text-blue-500 uppercase tracking-tight">Pró-labore (Salário)</label>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-muted-foreground uppercase">R$</span>
              <div className="relative group/input">
                <Input 
                  type="number" 
                  value={prolabore} 
                  onChange={(e) => setProlabore(parseFloat(e.target.value) || 0)}
                  className="w-28 h-9 text-right font-code font-bold text-blue-500 bg-background/50 border-blue-500/20 focus-visible:ring-1 focus-visible:ring-blue-500 pr-7"
                />
                <PenLine className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-blue-500/30" />
              </div>
            </div>
          </div>

          {/* Reserva */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-purple-500/5 border border-purple-500/10">
            <div className="flex items-center gap-3">
              <StepButtons 
                onUp={() => setReservaPct(Math.min(100, reservaPct + 5))} 
                onDown={() => setReservaPct(Math.max(0, reservaPct - 5))} 
                colorClass="text-purple-500"
              />
              <label className="text-sm font-bold text-purple-500 uppercase tracking-tight">Reserva PJ (% sobra)</label>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative group/input">
                <Input 
                  type="number" 
                  value={reservaPct} 
                  onChange={(e) => setReservaPct(parseFloat(e.target.value) || 0)}
                  className="w-20 h-9 text-right font-code font-bold text-purple-500 bg-background/50 border-purple-500/20 focus-visible:ring-1 focus-visible:ring-purple-500 pr-7"
                />
                <PenLine className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-purple-500/30" />
              </div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase">%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-headline">Distribuição do Faturamento</CardTitle>
          <CardDescription>Como seu dinheiro será fatiado este mês</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex h-3 w-full rounded-full overflow-hidden bg-secondary">
            {displayItems.map((item, idx) => (
              <div 
                key={idx} 
                className={`${item.color} transition-all duration-500`} 
                style={{ width: formatPercent(item.val, fat) }} 
              />
            ))}
          </div>

          <div className="grid gap-3 pt-4">
            {displayItems.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border/50 hover:bg-secondary/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-1 h-10 rounded-full ${item.color}`} />
                  <div>
                    <div className="text-sm font-bold">{item.label}</div>
                    <div className="text-xs text-muted-foreground">{formatPercent(item.val, fat)} do total</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-code font-bold text-lg ${item.text}`}>{formatCurrency(item.val)}</div>
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
