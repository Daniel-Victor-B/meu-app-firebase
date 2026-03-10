
"use client"

import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { formatCurrency } from "@/lib/formatters";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Calendar, TrendingUp, ShieldCheck, Wallet } from "lucide-react";

interface MeiLimitTrackerProps {
  fatAcum: number;
  fatMensal: number;
  setFatMensal: (v: number) => void;
  limiteAnual: number;
  mesesFat: number;
  setMesesFat: (v: number) => void;
  mesesRestantes: number;
}

export function MeiLimitTracker({ 
  fatAcum, 
  fatMensal, 
  setFatMensal,
  limiteAnual, 
  mesesFat,
  setMesesFat,
  mesesRestantes 
}: MeiLimitTrackerProps) {
  const percentualAcum = Math.min(100, (fatAcum / limiteAnual) * 100);
  const restante = Math.max(0, limiteAnual - fatAcum);
  const projecaoAnual = fatMensal * 12;
  const alertaMEI = projecaoAnual > limiteAnual * 0.8;

  const statusText = percentualAcum > 80 ? "Risco de Desenquadramento" : percentualAcum > 60 ? "Atenção ao Limite" : "Margem Segura";

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-headline">Simulador de Limite Anual</CardTitle>
              <CardDescription>Ajuste os valores para simular seu ano fiscal</CardDescription>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-bold ${percentualAcum > 80 ? 'bg-destructive/20 text-destructive' : 'bg-primary/20 text-primary'}`}>
              {statusText}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Controles de Simulação */}
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

          <div className="space-y-3 pt-4">
            <div className="flex justify-between items-end">
              <span className="text-sm text-muted-foreground font-medium">Uso do limite anual ({formatCurrency(limiteAnual)})</span>
              <span className="font-code text-lg font-bold">{percentualAcum.toFixed(1)}%</span>
            </div>
            <Progress value={percentualAcum} className="h-3" />
            <div className="flex justify-between text-xs text-muted-foreground font-bold">
              <span className="text-primary">{formatCurrency(fatAcum)} ACUMULADO</span>
              <span>{formatCurrency(restante)} RESTANTE</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-secondary/50 border border-border/50">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                <span className="text-xs font-medium text-muted-foreground">Projeção 12m</span>
              </div>
              <div className={`font-code text-lg font-bold ${projecaoAnual > limiteAnual ? 'text-destructive' : 'text-foreground'}`}>
                {formatCurrency(projecaoAnual)}
              </div>
            </div>
            <div className="p-4 rounded-xl bg-secondary/50 border border-border/50">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-primary" />
                <span className="text-xs font-medium text-muted-foreground">Meses Restantes</span>
              </div>
              <div className="font-code text-lg font-bold">
                {mesesRestantes} meses
              </div>
            </div>
            <div className="p-4 rounded-xl bg-secondary/50 border border-border/50">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="w-4 h-4 text-primary" />
                <span className="text-xs font-medium text-muted-foreground">Teto Mensal</span>
              </div>
              <div className="font-code text-lg font-bold">
                {formatCurrency(limiteAnual / 12)}
              </div>
            </div>
            <div className="p-4 rounded-xl bg-secondary/50 border border-border/50">
              <div className="flex items-center gap-2 mb-2">
                <Wallet className="w-4 h-4 text-primary" />
                <span className="text-xs font-medium text-muted-foreground">Margem de Folga</span>
              </div>
              <div className="font-code text-lg font-bold">
                {formatCurrency(restante)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {alertaMEI && (
        <Alert variant="destructive" className="bg-destructive/10 border-destructive/20">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle className="font-headline font-bold">Alerta de Crescimento</AlertTitle>
          <AlertDescription className="text-sm leading-relaxed mt-1">
            Seu faturamento projetado de {formatCurrency(projecaoAnual)} está acima de 80% do limite MEI.
            Recomendamos iniciar o planejamento para migração para Microempresa (ME) para evitar multas e desenquadramento retroativo.
          </AlertDescription>
        </Alert>
      )}

      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex gap-4 items-start">
            <div className="bg-primary/20 p-2 rounded-lg text-primary">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="font-headline font-bold text-primary">Regra dos 80%</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Ao atingir <strong>{formatCurrency(limiteAnual * 0.8)}</strong> no ano, o processo de migração deve ser iniciado. Isso garante que você não seja pego de surpresa com impostos retroativos sobre o faturamento total.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
