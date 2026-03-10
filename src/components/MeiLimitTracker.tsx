"use client"

import { useState, useEffect, useMemo } from "react";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/formatters";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Calendar, TrendingUp, ShieldCheck, Wallet, Calculator, ListOrdered, FileSpreadsheet } from "lucide-react";
import { type MonthlyData } from "@/app/page";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

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
  monthlySpreadsheetData
}: MeiLimitTrackerProps) {
  const [mode, setMode] = useState<TrackerMode>('average');
  const [monthlyValues, setMonthlyValues] = useState<number[]>(Array(12).fill(fatMensal));

  // Sincroniza os valores mensais quando o modo médio muda, mas apenas se estiver no modo médio
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

  // Cálculos baseados no modo selecionado
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
      // Se for planilha, respeitamos o status de cada mês lá
      if (mode === 'spreadsheet') {
          return monthlySpreadsheetData.reduce((acc, curr) => acc + (curr.active ? curr.receita : 0), 0);
      }
      // Caso contrário usamos o seletor de meses passados
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

  const getStatusText = (pct: number) => {
    if (pct > 80) return "Risco de Desenquadramento";
    if (pct > 60) return "Atenção ao Limite";
    return "Margem Segura";
  };

  const getStatusTextColor = (pct: number) => {
    if (pct > 80) return "text-destructive";
    if (pct > 60) return "text-amber-500";
    return "text-primary";
  };

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
                   Qualquer alteração feita lá refletirá aqui instantaneamente.
                 </p>
               </div>
               <div className="pt-2 flex gap-4">
                  <div className="text-center">
                    <div className="text-xs font-black text-purple-500">{monthlySpreadsheetData.filter(m => m.active).length}</div>
                    <div className="text-[9px] uppercase font-bold text-muted-foreground">Meses Ativos</div>
                  </div>
                  <div className="w-px bg-border h-8" />
                  <div className="text-center">
                    <div className="text-xs font-black text-purple-500">{formatCurrency(projecaoAnual)}</div>
                    <div className="text-[9px] uppercase font-bold text-muted-foreground">Total Planilhado</div>
                  </div>
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
                    className="h-8 text-xs font-bold border-blue-500/20 focus:border-blue-500"
                  />
                </div>
              ))}
              <div className="col-span-full pt-2 flex justify-between items-center text-[10px] text-muted-foreground font-medium italic">
                <span>* Meses marcados com • são considerados "acumulados"</span>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    Meses faturados:
                    <input 
                      type="number" 
                      min="1" max="12" 
                      value={mesesFat} 
                      onChange={(e) => setMesesFat(parseInt(e.target.value) || 1)}
                      className="w-10 bg-transparent border-b border-muted-foreground text-center focus:outline-none"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          {mode === 'average' && (
            <div className="grid gap-6 p-4 rounded-xl bg-secondary/30 border border-border/50">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    Média de Faturamento Mensal
                  </label>
                  <span className="font-code font-bold text-primary">{formatCurrency(fatMensal)}</span>
                </div>
                <Slider 
                  value={[fatMensal]} 
                  min={0} 
                  max={15000} 
                  step={100} 
                  onValueChange={([v]) => setFatMensal(v)} 
                />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    Meses faturados no ano
                  </label>
                  <span className="font-code font-bold text-primary">{mesesFat} meses</span>
                </div>
                <Slider 
                  value={[mesesFat]} 
                  min={1} 
                  max={12} 
                  step={1} 
                  onValueChange={([v]) => setMesesFat(v)} 
                />
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
                  {percentualAcum.toFixed(1)}% <span className="text-xs font-normal text-muted-foreground">do limite utilizado</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-muted-foreground font-bold uppercase">Total Projetado</div>
                <div className={`text-lg font-bold font-code ${projecaoAnual > limiteAnual ? 'text-destructive' : 'text-primary'}`}>
                  {formatCurrency(projecaoAnual)}
                </div>
              </div>
            </div>
            <Progress 
              value={percentualAcum} 
              className="h-3" 
              indicatorClassName={getStatusColor(percentualAcum)}
            />
            <div className="flex justify-between text-[10px] text-muted-foreground font-bold uppercase tracking-tighter">
              <span className={getStatusTextColor(percentualAcum)}>{formatCurrency(acumuladoAteAgora)} ACUMULADO</span>
              <span>{formatCurrency(restante)} RESTANTE NO LIMITE</span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 rounded-xl bg-secondary/50 border border-border/50">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-3 h-3 text-primary" />
                <span className="text-[10px] font-bold text-muted-foreground uppercase">Projeção 12m</span>
              </div>
              <div className={`font-code text-sm font-bold ${projecaoAnual > limiteAnual ? 'text-destructive' : 'text-foreground'}`}>
                {formatCurrency(projecaoAnual)}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-secondary/50 border border-border/50">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-3 h-3 text-primary" />
                <span className="text-[10px] font-bold text-muted-foreground uppercase">Meses Restantes</span>
              </div>
              <div className="font-code text-sm font-bold">
                {12 - (mode === 'spreadsheet' ? monthlySpreadsheetData.filter(m => m.active).length : mesesFat)} meses
              </div>
            </div>
            <div className="p-3 rounded-xl bg-secondary/50 border border-border/50">
              <div className="flex items-center gap-2 mb-1">
                <ShieldCheck className="w-3 h-3 text-primary" />
                <span className="text-[10px] font-bold text-muted-foreground uppercase">Teto Médio/mês</span>
              </div>
              <div className="font-code text-sm font-bold">
                {formatCurrency(limiteAnual / 12)}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-secondary/50 border border-border/50">
              <div className="flex items-center gap-2 mb-1">
                <Wallet className="w-3 h-3 text-primary" />
                <span className="text-[10px] font-bold text-muted-foreground uppercase">Margem Total</span>
              </div>
              <div className="font-code text-sm font-bold">
                {formatCurrency(restante)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {alertaMEI && (
        <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 animate-in fade-in zoom-in duration-300">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle className="font-headline font-bold">Alerta de Crescimento</AlertTitle>
          <AlertDescription className="text-sm leading-relaxed mt-1">
            Sua projeção de {formatCurrency(projecaoAnual)} está acima de 80% do limite MEI.
            {projecaoAnual > limiteAnual ? (
              <strong> Você ultrapassou o limite! Inicie a migração para ME imediatamente.</strong>
            ) : (
              " Recomendamos iniciar o planejamento para migração para Microempresa (ME) para evitar multas."
            )}
          </AlertDescription>
        </Alert>
      )}

      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex gap-4 items-start">
            <div className="bg-primary/20 p-2 rounded-lg text-primary">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="font-headline font-bold text-primary">Dica para o Modo Sincronizado</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Este é o modo mais profissional. Ele utiliza os dados reais que você preencheu na <strong>Planilha de Fluxo</strong> para calcular seu limite. Use-o para ter uma visão cirúrgica do seu ano fiscal, considerando a sazonalidade exata do seu negócio.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
