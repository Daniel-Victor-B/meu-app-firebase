
"use client"

import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/formatters";
import { 
  FileSpreadsheet, 
  ShieldCheck, 
  HelpCircle, 
  ArrowLeftRight, 
  Wallet, 
  PiggyBank, 
  Settings2, 
  UserCircle, 
  Percent, 
  Lightbulb,
  ChevronUp,
  ChevronDown,
  Info,
  ArrowRight,
  Target,
  Rocket,
  Landmark,
  Sparkles,
  ChevronRight,
  Zap,
  Calendar,
  Clock,
  TrendingDown,
  Activity
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { type MonthlyData } from "@/app/page";

const MESES = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun", 
  "Jul", "Ago", "Set", "Out", "Nov", "Dez"
];

interface CashFlowLedgerProps {
  fat: number;
  setFat: (v: number) => void;
  custos: number;
  setCustos: (v: number) => void;
  prolabore: number;
  setProlabore: (v: number) => void;
  reservaPct: number;
  setReservaPct: (v: number) => void;
  monthlyData: MonthlyData[];
  setMonthlyData: (v: MonthlyData[]) => void;
}

const FAQS_PLANILHA = [
  {
    q: "Qual o valor ideal para o Colchão de Segurança?",
    a: "Para um MEI, o ideal é ter entre 6 a 12 meses de custos totais (Custos Operacionais + DAS + Pró-labore) guardados. Isso garante que, se as vendas caírem ou você precisar de uma pausa, as contas da empresa e o seu salário pessoal continuem pagos sem gerar dívidas."
  },
  {
    q: "O lucro deve ser sacado mensalmente?",
    a: "Não! A regra de ouro é: Pró-labore é mensal, Lucro é trimestral. Use a planilha para ver a sobra mensal, mas só decida o que fazer com esse dinheiro a cada 90 dias. Isso garante que você tenha fôlego financeiro para meses de baixa."
  },
  {
    q: "Como projetar meses com faturamento incerto?",
    a: "No MEI, a sazonalidade é comum. Use a média dos últimos 3 meses para os meses futuros ou, se for comércio, projete 20-30% a mais em meses como Dezembro (Natal). A planilha serve justamente para você ver o impacto desses picos na sua reserva."
  },
  {
    q: "Por que separar a 'Reserva' do 'Lucro Disponível'?",
    a: "O Lucro Disponível é o dinheiro que você pode gastar com você (além do salário) ou reinvestir. A Reserva é o dinheiro da empresa para emergências. Sem essa separação, você corre o risco de ficar sem caixa no primeiro mês que o faturamento cair."
  }
];

export function CashFlowLedger({ 
  fat, setFat, 
  custos, setCustos, 
  prolabore, setProlabore, 
  reservaPct, setReservaPct,
  monthlyData, setMonthlyData
}: CashFlowLedgerProps) {
  const [mesesReserva, setMesesReserva] = useState(6);
  const [startMonth, setStartMonth] = useState(0);
  const [duration, setDuration] = useState(12);
  const [distribuicaoLucroPct, setDistribuicaoLucroPct] = useState(50);
  const [selectedQuarter, setSelectedQuarter] = useState(0);
  const das = 76;

  useEffect(() => {
    const savedReserva = localStorage.getItem("mei-flow-ledger-meses-reserva");
    if (savedReserva) setMesesReserva(parseInt(savedReserva, 10) || 6);
    
    const savedStartMonth = localStorage.getItem("mei-flow-ledger-start-month");
    if (savedStartMonth) setStartMonth(parseInt(savedStartMonth, 10) || 0);

    const savedDuration = localStorage.getItem("mei-flow-ledger-duration");
    if (savedDuration) setDuration(parseInt(savedDuration, 10) || 12);

    const savedDist = localStorage.getItem("mei-flow-ledger-dist-lucro");
    if (savedDist) setDistribuicaoLucroPct(parseInt(savedDist, 10) || 50);
  }, []);

  useEffect(() => {
    localStorage.setItem("mei-flow-ledger-meses-reserva", mesesReserva.toString());
  }, [mesesReserva]);

  useEffect(() => {
    localStorage.setItem("mei-flow-ledger-start-month", startMonth.toString());
  }, [startMonth]);

  useEffect(() => {
    localStorage.setItem("mei-flow-ledger-duration", duration.toString());
  }, [duration]);

  useEffect(() => {
    localStorage.setItem("mei-flow-ledger-dist-lucro", distribuicaoLucroPct.toString());
  }, [distribuicaoLucroPct]);

  useEffect(() => {
    if (monthlyData.every(m => m.receita === 5000 && m.custos === 1500)) {
        setMonthlyData(monthlyData.map(m => ({ ...m, receita: fat, custos: custos })));
    }
  }, []);

  const updateMonth = (index: number, field: keyof MonthlyData, value: any) => {
    const newData = [...monthlyData];
    if (field === 'active') {
      newData[index] = { ...newData[index], active: value };
    } else {
      const newValue = parseFloat(value) || 0;
      newData[index] = { ...newData[index], [field]: newValue };
    }
    setMonthlyData(newData);
  };

  const totals = useMemo(() => {
    let acumuladoReservaTotal = 0;
    let acumuladoReceitaTotal = 0;
    let acumuladoLucroTotal = 0;

    let periodReserva = 0;
    let periodReceita = 0;
    let periodLucro = 0;

    const rows = monthlyData.slice(0, 12).map((m, i) => {
      if (!m.active) {
        return {
          ...m,
          sobra: 0,
          reserva: 0,
          lucro: 0,
          acumuladoReserva: acumuladoReservaTotal,
          acumuladoLucro: acumuladoLucroTotal
        };
      }

      const sobra = Math.max(0, m.receita - m.custos - das - prolabore);
      const reserva = Math.round((sobra * reservaPct) / 100);
      const lucro = sobra - reserva;
      
      acumuladoReservaTotal += reserva;
      acumuladoReceitaTotal += m.receita;
      acumuladoLucroTotal += lucro;

      // Soma apenas se estiver dentro da duração definida para o Planejamento (Período)
      if (i < duration) {
        periodReserva += reserva;
        periodReceita += m.receita;
        periodLucro += lucro;
      }

      return {
        ...m,
        sobra,
        reserva,
        lucro,
        acumuladoReserva: acumuladoReservaTotal,
        acumuladoLucro: acumuladoLucroTotal
      };
    });

    return { 
      rows, 
      acumuladoReserva: acumuladoReservaTotal, 
      acumuladoReceita: acumuladoReceitaTotal, 
      acumuladoLucro: acumuladoLucroTotal,
      periodReserva,
      periodReceita,
      periodLucro
    };
  }, [monthlyData, fat, custos, prolabore, reservaPct, duration]);

  const quarterlyTotals = useMemo(() => {
    const quarters = [
      { id: 0, name: "1º Trimestre", months: [0, 1, 2], profit: 0, revenue: 0 },
      { id: 1, name: "2º Trimestre", months: [3, 4, 5], profit: 0, revenue: 0 },
      { id: 2, name: "3º Trimestre", months: [6, 7, 8], profit: 0, revenue: 0 },
      { id: 3, name: "4º Trimestre", months: [9, 10, 11], profit: 0, revenue: 0 },
    ];

    quarters.forEach(q => {
      q.months.forEach(mIdx => {
        const row = totals.rows[mIdx];
        if (row && row.active) {
          q.profit += row.lucro;
          q.revenue += row.receita;
        }
      });
    });

    return quarters;
  }, [totals.rows]);

  const currentQ = quarterlyTotals[selectedQuarter];
  const qProfitPF_Manual = (currentQ.profit * distribuicaoLucroPct) / 100;
  const qProfitPJ_Manual = currentQ.profit - qProfitPF_Manual;

  const metaTotal = (custos + das + prolabore) * mesesReserva;
  const progressoMeta = Math.min(100, (totals.acumuladoReserva / metaTotal) * 100);
  const LIMITE_MEI = 81000;
  
  // Percentual do teto baseado no período selecionado
  const percentualLimite = Math.min(100, (totals.periodReceita / LIMITE_MEI) * 100);

  const smartTarget = useMemo(() => {
    if (progressoMeta < 100) {
      return { pf: 20, pj: 80, label: "Foco em Segurança", motive: "Reserva incompleta. Blinde o caixa da empresa." };
    }
    return { pf: 60, pj: 40, label: "Eficiência Máxima", motive: "Reserva concluída! Priorize sua recompensa pessoal." };
  }, [progressoMeta]);

  const qProfitPF_Recommended = (currentQ.profit * smartTarget.pf) / 100;
  const qProfitPJ_Recommended = currentQ.profit - qProfitPF_Recommended;

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
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 pb-16">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card className="bg-primary/5 border-primary/20 shadow-md">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <div className="flex items-center gap-2 text-primary">
              <ShieldCheck className="w-5 h-5" />
              <CardTitle className="text-sm font-bold uppercase tracking-wider">Colchão de Segurança</CardTitle>
            </div>
            <div className="flex items-center gap-2 bg-background/50 px-2 py-1 rounded-lg border border-primary/20 shadow-sm">
              <span className="text-[10px] font-black text-primary uppercase leading-none">Meta:</span>
              <div className="flex items-center gap-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-5 w-5 rounded-md hover:bg-primary/20 text-primary"
                  onClick={() => setMesesReserva(Math.max(1, mesesReserva - 1))}
                >
                  <ChevronDown className="w-3 h-3" />
                </Button>
                <span className="text-xs font-black w-4 text-center text-primary leading-none">{mesesReserva}</span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-5 w-5 rounded-md hover:bg-primary/20 text-primary"
                  onClick={() => setMesesReserva(Math.min(24, mesesReserva + 1))}
                >
                  <ChevronUp className="w-3 h-3" />
                </Button>
              </div>
              <span className="text-[8px] font-bold text-muted-foreground uppercase leading-none">meses</span>
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
                <div className="text-[10px] text-muted-foreground uppercase font-bold mt-1">Alvo para {mesesReserva} meses</div>
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

        <Card className="bg-secondary/20 border-border/60 border-2 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
            <Settings2 className="w-16 h-16" />
          </div>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2 text-foreground">
              <Settings2 className="w-5 h-5 text-primary" />
              <div>
                <CardTitle className="text-sm font-bold uppercase tracking-wider">Regras de Cálculo</CardTitle>
                <CardDescription className="text-[10px] uppercase font-bold text-muted-foreground">Sincronizado com Config. Mensais</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-[10px] text-blue-500 font-black uppercase">
                  <UserCircle className="w-3 h-3" />
                  Salário PF
                </div>
                <div className="flex items-center gap-2">
                  <StepButtons 
                    onUp={() => setProlabore(prolabore + 100)}
                    onDown={() => setProlabore(Math.max(0, prolabore - 100))}
                    colorClass="text-blue-500"
                  />
                  <Input 
                    className="h-9 px-2 text-xs font-bold bg-background/80 border-blue-500/30" 
                    type="number" 
                    value={prolabore}
                    onChange={(e) => setProlabore(parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-[10px] text-purple-500 font-black uppercase">
                  <Percent className="w-3 h-3" />
                  Reserva PJ
                </div>
                <div className="flex items-center gap-2">
                  <StepButtons 
                    onUp={() => setReservaPct(Math.min(100, reservaPct + 5))}
                    onDown={() => setReservaPct(Math.max(0, reservaPct - 5))}
                    colorClass="text-purple-500"
                  />
                  <Input 
                    className="h-9 px-2 text-xs font-bold bg-background/80 border-purple-500/30 text-right" 
                    type="number" 
                    value={reservaPct}
                    onChange={(e) => setReservaPct(parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-[10px] text-amber-500 font-black uppercase">
                  <Calendar className="w-3 h-3" />
                  Início
                </div>
                <Select value={startMonth.toString()} onValueChange={(v) => setStartMonth(parseInt(v))}>
                  <SelectTrigger className="h-9 text-xs font-bold bg-background/80 border-amber-500/30">
                    <SelectValue placeholder="Mês" />
                  </SelectTrigger>
                  <SelectContent>
                    {MESES.map((mes, idx) => (
                      <SelectItem key={idx} value={idx.toString()} className="text-xs font-medium">{mes}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-[10px] text-emerald-500 font-black uppercase">
                  <Clock className="w-3 h-3" />
                  Duração
                </div>
                <Input 
                  className="h-9 px-2 text-xs font-bold bg-background/80 border-emerald-500/30 text-center" 
                  type="number" 
                  min="1" max="12"
                  value={duration}
                  onChange={(e) => setDuration(Math.min(12, Math.max(1, parseInt(e.target.value) || 1)))}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden border-border/50 shadow-xl">
        <CardHeader className="flex flex-col lg:flex-row lg:items-center justify-between bg-card pb-4 gap-4 px-6 pt-6 border-b">
          <div className="flex-shrink-0">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-primary" />
              Planejamento de Fluxo Anual
            </CardTitle>
            <CardDescription className="text-xs">Simule o ano fiscal baseado nos parâmetros globais</CardDescription>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-2xl">
            <div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
              <div className="text-[9px] font-bold text-muted-foreground uppercase leading-none mb-1">Faturamento (Período)</div>
              <div className="text-lg font-bold text-indigo-500 leading-tight">{formatCurrency(totals.periodReceita || 0)}</div>
              <div className="flex items-center gap-1 mt-1 text-[8px] font-black uppercase text-indigo-500/70">
                <ShieldCheck className="w-2.5 h-2.5" />
                {percentualLimite.toFixed(1)}% do Teto
              </div>
            </div>

            <div className="p-3 bg-primary/10 rounded-xl border border-primary/20">
              <div className="text-[9px] font-bold text-muted-foreground uppercase leading-none mb-1">Lucro Real Acumulado</div>
              <div className="text-lg font-bold text-primary leading-tight">{formatCurrency(totals.periodLucro || 0)}</div>
              <div className="flex items-center gap-1 mt-1 text-[8px] font-black uppercase text-primary/70">
                <Wallet className="w-2.5 h-2.5" />
                Disponibilidade Total
              </div>
            </div>

            <div className="p-3 bg-purple-500/10 rounded-xl border border-purple-500/20">
              <div className="text-[9px] font-bold text-muted-foreground uppercase leading-none mb-1">Reserva (Caixa Empresa)</div>
              <div className="text-lg font-bold text-purple-500 leading-tight">{formatCurrency(totals.periodReserva || 0)}</div>
              <div className="flex items-center gap-1 mt-1 text-[8px] font-black uppercase text-purple-500/70">
                <PiggyBank className="w-2.5 h-2.5" />
                Patrimônio Acumulado
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto no-scrollbar pb-6">
            <Table className="min-w-[1250px] border-collapse">
              <TableHeader className="bg-secondary/30">
                <TableRow className="hover:bg-transparent border-b bg-primary/10">
                  <TableHead colSpan={10} className="h-12 py-0 text-center border-b border-primary/20">
                    <div className="flex items-center justify-between px-8 text-[10px] font-bold uppercase tracking-[0.4em] text-primary/80">
                      <div className="flex items-center gap-4">
                        <ArrowLeftRight className="w-4 h-4" />
                        Área de Rolagem Lateral
                        <ArrowLeftRight className="w-4 h-4" />
                      </div>
                    </div>
                  </TableHead>
                </TableRow>
                
                <TableRow className="hover:bg-transparent border-b">
                  <TableHead className="w-[80px] font-bold text-[10px] uppercase text-center border-r bg-secondary/10">Status</TableHead>
                  <TableHead className="w-[90px] font-bold text-[10px] uppercase border-r text-center bg-secondary/10">Mês</TableHead>
                  <TableHead className="w-[180px] font-bold text-[10px] uppercase px-6 text-indigo-500 bg-indigo-500/5">Faturamento (R$)</TableHead>
                  <TableHead className="w-[180px] font-bold text-[10px] uppercase px-6 text-orange-500 bg-orange-500/5">Custos Op. (R$)</TableHead>
                  <TableHead className="w-[140px] text-right font-bold text-[10px] uppercase px-6">Sobra Bruta</TableHead>
                  <TableHead className="w-[140px] text-right font-bold text-[10px] uppercase text-purple-500 px-6">Reserva PJ</TableHead>
                  <TableHead className="w-[140px] text-right font-bold text-[10px] uppercase text-primary px-6">Lucro Real</TableHead>
                  <TableHead className="w-[180px] text-right font-bold text-[10px] uppercase px-6 opacity-30">Lucro Acum.</TableHead>
                  <TableHead className="w-[180px] text-right font-bold text-[10px] uppercase px-6 opacity-30">Reserva Acum.</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {totals.rows.slice(0, duration).map((row, i) => (
                  <TableRow key={i} className={cn(
                    "transition-all duration-300",
                    !row.active ? "opacity-20 grayscale scale-[0.98]" : "hover:bg-primary/5"
                  )}>
                    <TableCell className="py-3 text-center border-r">
                      <div className="flex justify-center">
                        <Switch 
                          checked={row.active} 
                          onCheckedChange={(checked) => updateMonth(i, 'active', !!checked)}
                          className="scale-90"
                        />
                      </div>
                    </TableCell>
                    <TableCell className="font-bold text-xs py-3 border-r text-center bg-card">
                      {MESES[(i + startMonth) % 12]}
                    </TableCell>
                    <TableCell className="py-2 px-6 bg-indigo-500/5">
                      <Input 
                        type="number" 
                        disabled={!row.active}
                        value={row.receita} 
                        onChange={(e) => updateMonth(i, 'receita', e.target.value)}
                        className="h-10 text-xs font-bold text-indigo-500"
                      />
                    </TableCell>
                    <TableCell className="py-2 px-6 bg-orange-500/5">
                      <Input 
                        type="number" 
                        disabled={!row.active}
                        value={row.custos} 
                        onChange={(e) => updateMonth(i, 'custos', e.target.value)}
                        className="h-10 text-xs font-bold text-orange-500"
                      />
                    </TableCell>
                    <TableCell className="text-right text-xs font-medium tabular-nums px-6 bg-secondary/10">
                      {formatCurrency(row.sobra || 0)}
                    </TableCell>
                    <TableCell className="text-right text-xs font-bold text-purple-500 tabular-nums px-6 bg-purple-500/5">
                      {formatCurrency(row.reserva || 0)}
                    </TableCell>
                    <TableCell className="text-right text-sm font-black text-primary tabular-nums px-6 bg-primary/5">
                      {formatCurrency(row.lucro || 0)}
                    </TableCell>
                    <TableCell className="text-right text-xs font-medium tabular-nums px-6 opacity-30">
                      {formatCurrency(row.acumuladoLucro || 0)}
                    </TableCell>
                    <TableCell className="text-right text-xs font-medium tabular-nums px-6 opacity-30">
                      {formatCurrency(row.acumuladoReserva || 0)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6">
        <div className="p-1 rounded-[40px] bg-gradient-to-br from-amber-500/30 via-primary/20 to-indigo-500/20 shadow-2xl">
          <div className="bg-card/90 backdrop-blur-xl rounded-[39px] p-8 space-y-10 overflow-hidden relative">
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-primary/10 blur-[100px] rounded-full" />
            
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full">
                  <Zap className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-600">Ciclo de Riqueza Trimestral</span>
                </div>
                <h3 className="text-4xl font-black tracking-tighter text-foreground leading-none">
                  Gestão de <span className="text-amber-500">90 Dias</span>
                </h3>
                <p className="text-sm text-muted-foreground font-medium max-w-md leading-relaxed">
                  Analise o acúmulo real e defina as ações táticas para o seu lucro trimestral.
                </p>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {quarterlyTotals.map((q) => (
                  <Button 
                    key={q.id}
                    variant={selectedQuarter === q.id ? "default" : "outline"}
                    className={cn(
                      "h-12 flex flex-col gap-0.5 rounded-xl border-2 transition-all",
                      selectedQuarter === q.id ? "bg-amber-500 border-amber-500" : "hover:border-amber-500/50"
                    )}
                    onClick={() => setSelectedQuarter(q.id)}
                  >
                    <span className="text-[9px] font-black uppercase opacity-60 tracking-widest">{q.name}</span>
                    <span className="text-xs font-bold">{formatCurrency(q.profit)}</span>
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
              <div className="lg:col-span-4 space-y-6">
                <div className="p-6 rounded-3xl bg-secondary/30 border-2 border-amber-500/20 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Lucro Total do Ciclo</span>
                    <Target className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="text-4xl font-black text-foreground tabular-nums tracking-tighter">
                    {formatCurrency(currentQ.profit)}
                  </div>
                  <div className="pt-4 border-t border-amber-500/10 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "p-2 rounded-lg",
                        currentQ.profit > (fat * 1.5) ? "bg-emerald-500/10 text-emerald-500" : "bg-blue-500/10 text-blue-500"
                      )}>
                        <Activity className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-[10px] font-black uppercase text-muted-foreground leading-none">Contexto Tático</div>
                        <div className="text-xs font-bold mt-1">
                          {currentQ.profit === 0 ? "Sem lucro acumulado" : 
                           currentQ.profit > (fat * 2) ? "Escala Exponencial" : 
                           currentQ.profit < (fat * 0.5) ? "Ajuste Operacional" : "Crescimento Estável"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 p-6 rounded-3xl bg-primary/5 border border-primary/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span className="text-[10px] font-black uppercase text-primary tracking-widest">Sugestão Tática (Real)</span>
                  </div>
                  <div className="text-[10px] text-muted-foreground font-bold italic mb-2">
                    {smartTarget.motive}
                  </div>
                  <ul className="space-y-3">
                    {currentQ.profit > 0 ? (
                      <>
                        <li className="flex gap-3 text-xs text-muted-foreground">
                          <ChevronRight className="w-3.5 h-3.5 text-primary shrink-0" />
                          <span>Mover <strong>{formatCurrency(qProfitPF_Recommended)}</strong> ({smartTarget.pf}%) para sua <strong>Corretora PF</strong></span>
                        </li>
                        <li className="flex gap-3 text-xs text-muted-foreground">
                          <ChevronRight className="w-3.5 h-3.5 text-primary shrink-0" />
                          <span>Reinvestir <strong>{formatCurrency(qProfitPJ_Recommended)}</strong> ({smartTarget.pj}%) na <strong>Escala PJ</strong></span>
                        </li>
                      </>
                    ) : (
                      <li className="flex gap-3 text-xs text-muted-foreground italic">
                        <TrendingDown className="w-3.5 h-3.5 text-destructive shrink-0" />
                        <span>Focar em reduzir custos operacionais no próximo ciclo.</span>
                      </li>
                    )}
                  </ul>
                  {currentQ.profit > 0 && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full text-[10px] font-black uppercase tracking-widest h-8 mt-2"
                      onClick={() => setDistribuicaoLucroPct(smartTarget.pf)}
                    >
                      Aplicar Sugestão no Simulador
                    </Button>
                  )}
                </div>
              </div>

              <div className="lg:col-span-8 space-y-8">
                <div className="p-8 rounded-[40px] bg-background/40 border-2 border-dashed border-amber-500/20 space-y-10">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="space-y-1 text-center sm:text-left">
                      <h4 className="text-xl font-black text-foreground tracking-tight">Simulador de Destino</h4>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Defina como sua riqueza será distribuída</p>
                    </div>
                    <div className="flex items-center gap-4 bg-secondary/50 p-3 rounded-2xl border">
                      <div className="text-center">
                        <div className="text-xs font-black text-blue-500">{distribuicaoLucroPct}%</div>
                        <div className="text-[8px] font-bold text-muted-foreground uppercase">Liberdade (PF)</div>
                      </div>
                      <div className="w-px h-6 bg-border" />
                      <div className="text-center">
                        <div className="text-xs font-black text-primary">{100 - distribuicaoLucroPct}%</div>
                        <div className="text-[8px] font-bold text-muted-foreground uppercase">Escala (PJ)</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <Slider 
                      value={[distribuicaoLucroPct]} 
                      min={0} 
                      max={100} 
                      step={5} 
                      onValueChange={([v]) => setDistribuicaoLucroPct(v)}
                      className="py-4"
                    />
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                        Retirada Pessoal
                      </div>
                      <div className="flex items-center gap-2">
                        Investimento Empresa
                        <div className="w-2 h-2 rounded-full bg-primary" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                    <div className="p-6 rounded-3xl bg-blue-500/5 border border-blue-500/20 group hover:bg-blue-500/10 transition-all">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-blue-500/20 rounded-xl text-blue-500">
                          <Landmark className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-black uppercase text-blue-500 tracking-widest">Liberdade (PF/CPF)</span>
                      </div>
                      <div className="text-2xl font-black text-foreground tabular-nums tracking-tighter">
                        {formatCurrency(qProfitPF_Manual)}
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-2 leading-relaxed">
                        Destinado a investimentos pessoais, lazer e construção de patrimônio no seu CPF.
                      </p>
                    </div>

                    <div className="p-6 rounded-3xl bg-primary/5 border border-primary/20 group hover:bg-primary/10 transition-all">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-primary/20 rounded-xl text-primary">
                          <Rocket className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-black uppercase text-primary tracking-widest">Escala (PJ/CNPJ)</span>
                      </div>
                      <div className="text-2xl font-black text-foreground tabular-nums tracking-tighter">
                        {formatCurrency(qProfitPJ_Manual)}
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-2 leading-relaxed">
                        Reinvestimento em marketing, ferramentas, infraestrutura ou reserva extra da empresa.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-amber-500/10 relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
               <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-500/20 rounded-lg text-amber-600">
                    <Lightbulb className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase text-foreground">Protocolo Trimestral de Excelência</h4>
                    <p className="text-[10px] text-muted-foreground leading-tight">Mantenha a reserva intocada e distribua apenas o lucro real a cada 90 dias.</p>
                  </div>
               </div>
               <div className="text-[10px] font-black text-amber-600/50 uppercase tracking-[0.4em]">MEI Flow Strategy Engine</div>
            </div>
          </div>
        </div>
      </div>

      <section className="space-y-6 pt-6">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-secondary rounded-lg">
            <HelpCircle className="w-5 h-5 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-headline font-bold text-lg">Perguntas sobre o Planejamento</h3>
            <p className="text-xs text-muted-foreground">Como usar os dados da planilha na vida real.</p>
          </div>
        </div>

        <Accordion type="single" collapsible className="w-full space-y-2">
          {FAQS_PLANILHA.map((faq, idx) => (
            <AccordionItem key={idx} value={`faq-${idx}`} className="border rounded-xl px-4 bg-card shadow-sm hover:shadow-md transition-shadow">
              <AccordionTrigger className="text-sm font-bold text-left hover:no-underline py-4">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-xs text-muted-foreground leading-relaxed pb-4">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
