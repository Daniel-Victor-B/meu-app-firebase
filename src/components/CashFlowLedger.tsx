"use client"

import { useState, useMemo, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/formatters";
import { FileSpreadsheet, ShieldCheck, Info, AlertTriangle, CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const MESES = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun", 
  "Jul", "Ago", "Set", "Out", "Nov", "Dez"
];

interface MonthlyData {
  receita: number;
  custos: number;
  active: boolean;
}

export function CashFlowLedger() {
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<MonthlyData[]>(
    Array(12).fill(null).map(() => ({ receita: 5000, custos: 500, active: true }))
  );
  
  const [globalParams, setGlobalParams] = useState({
    prolabore: 2000,
    reservaPct: 50,
    das: 76
  });

  const scrollTable = (direction: 'left' | 'right') => {
    if (tableContainerRef.current) {
      const scrollAmount = 300;
      tableContainerRef.current.scrollBy({ 
        left: direction === 'left' ? -scrollAmount : scrollAmount, 
        behavior: 'smooth' 
      });
    }
  };

  const updateMonth = (index: number, field: keyof MonthlyData, value: any) => {
    const newData = [...data];
    if (field === 'active') {
      newData[index] = { ...newData[index], active: value };
    } else {
      const newValue = parseFloat(value) || 0;
      newData[index] = { ...newData[index], [field]: newValue };
    }
    setData(newData);
  };

  const totals = useMemo(() => {
    let acumuladoReserva = 0;
    let acumuladoReceita = 0;

    const rows = data.map((m) => {
      if (!m.active) {
        return {
          ...m,
          sobra: 0,
          reserva: 0,
          lucro: 0,
          acumuladoReserva
        };
      }

      const sobra = Math.max(0, m.receita - m.custos - globalParams.das - globalParams.prolabore);
      const reserva = Math.round((sobra * globalParams.reservaPct) / 100);
      const lucro = sobra - reserva;
      
      acumuladoReserva += reserva;
      acumuladoReceita += m.receita;

      return {
        ...m,
        sobra,
        reserva,
        lucro,
        acumuladoReserva
      };
    });

    return { rows, acumuladoReserva, acumuladoReceita };
  }, [data, globalParams]);

  const custoEmpresaMensal = (data.filter(m => m.active).reduce((acc, curr) => acc + curr.custos, 0) / (data.filter(m => m.active).length || 1)) + globalParams.das;
  const metaTotal = (custoEmpresaMensal + globalParams.prolabore) * 6;
  const progressoMeta = Math.min(100, (totals.acumuladoReserva / metaTotal) * 100);

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 pb-10">
      {/* Resumo de Metas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2 text-primary">
              <ShieldCheck className="w-5 h-5" />
              <CardTitle className="text-sm font-bold uppercase tracking-wider">Colchão de Segurança (6 meses)</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-end">
              <div>
                <div className="text-2xl font-bold">{formatCurrency(totals.acumuladoReserva)}</div>
                <div className="text-[10px] text-muted-foreground uppercase font-bold mt-1">Acumulado na Reserva</div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-muted-foreground">{formatCurrency(metaTotal)}</div>
                <div className="text-[10px] text-muted-foreground uppercase font-bold mt-1">Meta de Segurança</div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-bold">
                <span>PROGRESSO DA RESERVA</span>
                <span>{progressoMeta.toFixed(1)}%</span>
              </div>
              <Progress value={progressoMeta} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-secondary/30 border-dashed">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Info className="w-5 h-5" />
              <CardTitle className="text-sm font-bold uppercase tracking-wider">Parâmetros de Cálculo</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-[10px] text-muted-foreground font-bold mb-1 uppercase">Pró-labore</div>
                <Input 
                  className="h-8 text-xs font-bold bg-background/50" 
                  type="number" 
                  value={globalParams.prolabore}
                  onChange={(e) => setGlobalParams({...globalParams, prolabore: parseFloat(e.target.value) || 0})}
                />
              </div>
              <div>
                <div className="text-[10px] text-muted-foreground font-bold mb-1 uppercase">% Reserva</div>
                <Input 
                  className="h-8 text-xs font-bold bg-background/50" 
                  type="number" 
                  value={globalParams.reservaPct}
                  onChange={(e) => setGlobalParams({...globalParams, reservaPct: parseFloat(e.target.value) || 0})}
                />
              </div>
              <div>
                <div className="text-[10px] text-muted-foreground font-bold mb-1 uppercase">DAS Fixo</div>
                <div className="h-8 flex items-center text-xs font-bold px-3 bg-secondary/50 rounded-md border border-input/50">{formatCurrency(globalParams.das)}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Planilha */}
      <Card className="overflow-hidden border-border/50">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between bg-secondary/10 pb-4 gap-4">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-primary" />
              Planejamento Anual
            </CardTitle>
            <CardDescription>Ajuste os valores mensais para planejar seu fluxo de caixa</CardDescription>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right mr-4">
              <div className="text-[10px] font-bold text-muted-foreground uppercase">Faturamento Total</div>
              <div className="text-xl font-bold text-primary">{formatCurrency(totals.acumuladoReceita)}</div>
            </div>
            
            {/* Controles de Navegação Superiores */}
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="icon" 
                className="h-8 w-8 rounded-full shadow-sm hover:bg-primary hover:text-primary-foreground" 
                onClick={() => scrollTable('left')}
                title="Rolar para esquerda"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                className="h-8 w-8 rounded-full shadow-sm hover:bg-primary hover:text-primary-foreground" 
                onClick={() => scrollTable('right')}
                title="Rolar para direita"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        {/* Indicador Visual de Arraste (Mobile) */}
        <div className="md:hidden flex items-center justify-center gap-3 py-2.5 bg-secondary/20 border-b text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
          <ChevronLeft className="w-3 h-3 animate-bounce-x-left" />
          Arraste para ver os lucros
          <ChevronRight className="w-3 h-3 animate-bounce-x-right" />
        </div>

        <CardContent className="p-0 relative">
          <div 
            ref={tableContainerRef}
            className="overflow-x-auto scrollbar-hide scroll-smooth"
          >
            <Table>
              <TableHeader className="bg-secondary/30">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[80px] font-bold text-[10px] uppercase text-center sticky left-0 bg-secondary/30 z-10 border-r">Status</TableHead>
                  <TableHead className="w-[100px] font-bold text-[10px] uppercase sticky left-[80px] bg-secondary/30 z-10 border-r">Mês</TableHead>
                  <TableHead className="min-w-[140px] font-bold text-[10px] uppercase px-4">Receita (R$)</TableHead>
                  <TableHead className="min-w-[140px] font-bold text-[10px] uppercase px-4">Custos (R$)</TableHead>
                  <TableHead className="min-w-[120px] text-right font-bold text-[10px] uppercase px-4">Sobra</TableHead>
                  <TableHead className="min-w-[120px] text-right font-bold text-[10px] uppercase text-purple-500 px-4">Reserva</TableHead>
                  <TableHead className="min-w-[120px] text-right font-bold text-[10px] uppercase text-primary px-4">Lucro Disp.</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {totals.rows.map((row, i) => (
                  <TableRow key={MESES[i]} className={cn(
                    "transition-colors group",
                    !row.active ? "opacity-40 bg-secondary/10" : "hover:bg-primary/5"
                  )}>
                    <TableCell className="py-3 text-center sticky left-0 bg-card z-10 border-r group-hover:bg-primary/5">
                      <div className="flex justify-center">
                        <Switch 
                          checked={row.active} 
                          onCheckedChange={(checked) => updateMonth(i, 'active', !!checked)}
                          className="scale-75 data-[state=checked]:bg-primary"
                        />
                      </div>
                    </TableCell>
                    <TableCell className="font-bold text-xs py-3 sticky left-[80px] bg-card z-10 border-r group-hover:bg-primary/5">
                      {MESES[i]}
                    </TableCell>
                    <TableCell className="py-2 px-4">
                      <Input 
                        type="number" 
                        disabled={!row.active}
                        value={row.receita} 
                        onChange={(e) => updateMonth(i, 'receita', e.target.value)}
                        className="h-9 text-xs bg-transparent border-transparent hover:border-input focus:border-primary focus-visible:ring-0 p-2 font-bold transition-all disabled:opacity-50"
                      />
                    </TableCell>
                    <TableCell className="py-2 px-4">
                      <Input 
                        type="number" 
                        disabled={!row.active}
                        value={row.custos} 
                        onChange={(e) => updateMonth(i, 'custos', e.target.value)}
                        className="h-9 text-xs bg-transparent border-transparent hover:border-input focus:border-blue-500 focus-visible:ring-0 p-2 font-bold transition-all disabled:opacity-50"
                      />
                    </TableCell>
                    <TableCell className="text-right text-xs font-medium tabular-nums py-3 px-4">
                      {formatCurrency(row.sobra)}
                    </TableCell>
                    <TableCell className="text-right text-xs font-bold text-purple-500 bg-purple-500/5 tabular-nums py-3 px-4">
                      {formatCurrency(row.reserva)}
                    </TableCell>
                    <TableCell className="text-right text-xs font-bold text-primary bg-primary/5 tabular-nums py-3 px-4">
                      {formatCurrency(row.lucro)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {/* Controles de Navegação Inferiores */}
          <div className="flex items-center justify-between p-3 bg-secondary/10 border-t">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 gap-2 text-[10px] font-bold uppercase hover:bg-background" 
              onClick={() => scrollTable('left')}
            >
              <ChevronLeft className="h-4 w-4" />
              Ver Início
            </Button>
            
            <div className="hidden sm:block text-[10px] font-bold text-muted-foreground uppercase opacity-50">
              Controle de Fluxo Anual MEI
            </div>

            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 gap-2 text-[10px] font-bold uppercase hover:bg-background" 
              onClick={() => scrollTable('right')}
            >
              Ver Resultados
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Dicas e Alertas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl border border-border bg-card/50">
          <h4 className="text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            Rotina Semanal de Controle
          </h4>
          <ul className="space-y-2 text-xs text-muted-foreground">
            <li className="flex gap-2 items-start"><span className="text-primary font-bold">1.</span> <span>Sexta-feira à tarde: atualize a receita e os custos da semana.</span></li>
            <li className="flex gap-2 items-start"><span className="text-primary font-bold">2.</span> <span>Use o interruptor lateral para desativar meses sem operação.</span></li>
            <li className="flex gap-2 items-start"><span className="text-primary font-bold">3.</span> <span>Confira se o acumulado da reserva bate com seu extrato.</span></li>
          </ul>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card/50">
          <h4 className="text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2 text-amber-500">
            <AlertTriangle className="w-4 h-4" />
            Análise de Sustentabilidade
          </h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Se a "Sobra" mensal for menor que o valor do Pró-labore, você está "comendo" o capital da empresa. Use a planilha para simular períodos de baixa e planejar o caixa.
          </p>
        </div>
      </div>

      <style jsx global>{`
        @keyframes bounce-x-left {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(-4px); }
        }
        @keyframes bounce-x-right {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(4px); }
        }
        .animate-bounce-x-left { animation: bounce-x-left 1.5s infinite; }
        .animate-bounce-x-right { animation: bounce-x-right 1.5s infinite; }
      `}</style>
    </div>
  );
}
