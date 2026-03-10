
"use client"

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/formatters";
import { FileSpreadsheet, TrendingUp, ShieldCheck, Info, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const MESES = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun", 
  "Jul", "Ago", "Set", "Out", "Nov", "Dez"
];

interface MonthlyData {
  receita: number;
  custos: number;
}

export function CashFlowLedger() {
  const [data, setData] = useState<MonthlyData[]>(
    Array(12).fill({ receita: 5000, custos: 500 })
  );
  
  const [globalParams, setGlobalParams] = useState({
    prolabore: 2000,
    reservaPct: 50,
    das: 75
  });

  const updateMonth = (index: number, field: keyof MonthlyData, value: string) => {
    const newValue = parseFloat(value) || 0;
    const newData = [...data];
    newData[index] = { ...newData[index], [field]: newValue };
    setData(newData);
  };

  const totals = useMemo(() => {
    let acumuladoReserva = 0;
    let acumuladoReceita = 0;

    const rows = data.map((m) => {
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

  // Cálculo da Meta de Reserva (Ponto 8 do seu modelo)
  const custoEmpresaMensal = data[0].custos + globalParams.das;
  const metaEmpresa = custoEmpresaMensal * 6;
  const metaPessoal = globalParams.prolabore * 6;
  const metaTotal = metaEmpresa + metaPessoal;
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
                <span>PROGRESSO</span>
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
              <CardTitle className="text-sm font-bold uppercase tracking-wider">Parâmetros Fixos</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-[10px] text-muted-foreground font-bold mb-1 uppercase">Pró-labore</div>
                <Input 
                  className="h-8 text-xs font-bold" 
                  type="number" 
                  value={globalParams.prolabore}
                  onChange={(e) => setGlobalParams({...globalParams, prolabore: parseFloat(e.target.value) || 0})}
                />
              </div>
              <div>
                <div className="text-[10px] text-muted-foreground font-bold mb-1 uppercase">% Reserva</div>
                <Input 
                  className="h-8 text-xs font-bold" 
                  type="number" 
                  value={globalParams.reservaPct}
                  onChange={(e) => setGlobalParams({...globalParams, reservaPct: parseFloat(e.target.value) || 0})}
                />
              </div>
              <div>
                <div className="text-[10px] text-muted-foreground font-bold mb-1 uppercase">DAS</div>
                <div className="h-8 flex items-center text-xs font-bold px-3 bg-secondary rounded-md border">{formatCurrency(globalParams.das)}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Planilha */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-primary" />
              Controle Mensal
            </CardTitle>
            <CardDescription>Ajuste as receitas e custos para planejar seu ano</CardDescription>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-bold text-muted-foreground uppercase">Faturamento Anual</div>
            <div className="text-xl font-bold text-primary">{formatCurrency(totals.acumuladoReceita)}</div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-secondary/50">
                <TableRow>
                  <TableHead className="w-[80px] font-bold text-[10px] uppercase">Mês</TableHead>
                  <TableHead className="w-[120px] font-bold text-[10px] uppercase">Receita</TableHead>
                  <TableHead className="w-[120px] font-bold text-[10px] uppercase">Custos</TableHead>
                  <TableHead className="text-right font-bold text-[10px] uppercase">Sobra</TableHead>
                  <TableHead className="text-right font-bold text-[10px] uppercase text-purple-500">Reserva</TableHead>
                  <TableHead className="text-right font-bold text-[10px] uppercase text-primary">Lucro Disp.</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {totals.rows.map((row, i) => (
                  <TableRow key={MESES[i]} className="hover:bg-primary/5 transition-colors group">
                    <TableCell className="font-bold text-xs">{MESES[i]}</TableCell>
                    <TableCell>
                      <Input 
                        type="number" 
                        value={row.receita} 
                        onChange={(e) => updateMonth(i, 'receita', e.target.value)}
                        className="h-8 text-xs bg-transparent border-none focus-visible:ring-1 focus-visible:ring-primary p-0 font-medium"
                      />
                    </TableCell>
                    <TableCell>
                      <Input 
                        type="number" 
                        value={row.custos} 
                        onChange={(e) => updateMonth(i, 'custos', e.target.value)}
                        className="h-8 text-xs bg-transparent border-none focus-visible:ring-1 focus-visible:ring-blue-500 p-0 font-medium"
                      />
                    </TableCell>
                    <TableCell className="text-right text-xs font-medium">
                      {formatCurrency(row.sobra)}
                    </TableCell>
                    <TableCell className="text-right text-xs font-bold text-purple-500 bg-purple-500/5">
                      {formatCurrency(row.reserva)}
                    </TableCell>
                    <TableCell className="text-right text-xs font-bold text-primary bg-primary/5">
                      {formatCurrency(row.lucro)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dica de Rotina */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl border border-border bg-card">
          <h4 className="text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            Rotina Semanal (1 Minuto)
          </h4>
          <ul className="space-y-2 text-xs text-muted-foreground">
            <li className="flex gap-2"><span>1.</span> Recebeu faturamento? Atualiza a receita do mês.</li>
            <li className="flex gap-2"><span>2.</span> Pagou custos? Atualiza os custos operacionais.</li>
            <li className="flex gap-2"><span>3.</span> Sobrou? Transfere a Reserva e o Lucro.</li>
          </ul>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card">
          <h4 className="text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2 text-amber-500">
            <AlertTriangle className="w-4 h-4" />
            Alerta de Sustentabilidade
          </h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Se a sua "Sobra" ficar negativa em algum mês, você está consumindo seu capital ou sua reserva. Use a planilha para simular cortes de custos antes que isso aconteça.
          </p>
        </div>
      </div>
    </div>
  );
}
