
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
  PenLine, 
  Wallet, 
  TrendingUp, 
  PiggyBank, 
  Scale, 
  Settings2, 
  UserCircle, 
  Percent, 
  Lightbulb,
  ChevronUp,
  ChevronDown,
  CalendarClock,
  Info,
  ArrowRight,
  Target,
  Rocket,
  Landmark,
  Sparkles,
  ChevronRight,
  Zap
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
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
  const das = 76;

  // Persistência local para configurações da planilha
  useEffect(() => {
    const saved = localStorage.getItem("mei-flow-ledger-meses-reserva");
    if (saved) setMesesReserva(parseInt(saved, 10) || 6);
  }, []);

  useEffect(() => {
    localStorage.setItem("mei-flow-ledger-meses-reserva", mesesReserva.toString());
  }, [mesesReserva]);

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
    let acumuladoReserva = 0;
    let acumuladoReceita = 0;
    let acumuladoLucroTotal = 0;

    const rows = monthlyData.map((m) => {
      if (!m.active) {
        return {
          ...m,
          sobra: 0,
          reserva: 0,
          lucro: 0,
          acumuladoReserva,
          acumuladoLucro: acumuladoLucroTotal
        };
      }

      const sobra = Math.max(0, m.receita - m.custos - das - prolabore);
      const reserva = Math.round((sobra * reservaPct) / 100);
      const lucro = sobra - reserva;
      
      acumuladoReserva += reserva;
      acumuladoReceita += m.receita;
      acumuladoLucroTotal += lucro;

      return {
        ...m,
        sobra,
        reserva,
        lucro,
        acumuladoReserva,
        acumuladoLucro: acumuladoLucroTotal
      };
    });

    return { rows, acumuladoReserva, acumuladoReceita, acumuladoLucro: acumuladoLucroTotal };
  }, [monthlyData, fat, custos, prolabore, reservaPct]);

  const metaTotal = (custos + das + prolabore) * mesesReserva;
  const progressoMeta = Math.min(100, (totals.acumuladoReserva / metaTotal) * 100);

  const LIMITE_MEI = 81000;
  const percentualLimite = Math.min(100, (totals.acumuladoReceita / LIMITE_MEI) * 100);

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
        {/* Bloco de Reserva */}
        <Card className="bg-primary/5 border-primary/20 shadow-md">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2 text-primary">
              <ShieldCheck className="w-5 h-5" />
              <CardTitle className="text-sm font-bold uppercase tracking-wider">Colchão de Segurança ({mesesReserva} meses)</CardTitle>
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
                <div className="text-[10px] text-muted-foreground uppercase font-bold mt-1">Meta Personalizada</div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-bold">
                <span>PROGRESSO DA RESERVA</span>
                <span>{progressoMeta.toFixed(1)}%</span>
              </div>
              <Progress value={progressoMeta} className="h-2" />
            </div>
            <div className="pt-2 flex items-start gap-2 text-[10px] text-muted-foreground leading-tight italic">
              <Lightbulb className="w-3 h-3 text-primary shrink-0" />
              <span>Sua meta é cobrir seus gastos totais de {formatCurrency(custos + das + prolabore)}/mês por {mesesReserva} meses.</span>
            </div>
          </CardContent>
        </Card>

        {/* Bloco de Regras do Jogo */}
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
                  <div className="relative flex-1 group/param">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-muted-foreground">R$</span>
                    <Input 
                      className="h-9 pl-7 pr-7 text-xs font-bold bg-background/80 border-blue-500/30 focus:border-blue-500 focus:ring-blue-500/20" 
                      type="number" 
                      value={prolabore}
                      onChange={(e) => setProlabore(parseFloat(e.target.value) || 0)}
                    />
                    <PenLine className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-blue-500/30 group-hover/param:text-blue-500 transition-colors pointer-events-none" />
                  </div>
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
                  <div className="relative flex-1 group/param">
                    <span className="absolute right-7 top-1/2 -translate-y-1/2 text-[10px] font-bold text-muted-foreground">%</span>
                    <Input 
                      className="h-9 pr-12 text-xs font-bold bg-background/80 border-purple-500/30 focus:border-purple-500 focus:ring-purple-500/20 text-right" 
                      type="number" 
                      value={reservaPct}
                      onChange={(e) => setReservaPct(parseFloat(e.target.value) || 0)}
                    />
                    <PenLine className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-purple-500/30 group-hover/param:text-blue-500 transition-colors pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-[10px] text-primary font-black uppercase">
                  <CalendarClock className="w-3 h-3" />
                  Meta (Meses)
                </div>
                <div className="flex items-center gap-2">
                  <StepButtons 
                    onUp={() => setMesesReserva(Math.min(24, mesesReserva + 1))}
                    onDown={() => setMesesReserva(Math.max(1, mesesReserva - 1))}
                    colorClass="text-primary"
                  />
                  <div className="relative flex-1 group/param">
                    <Input 
                      className="h-9 pr-8 text-xs font-bold bg-background/80 border-primary/30 focus:border-primary focus:ring-primary/20 text-center" 
                      type="number" 
                      value={mesesReserva}
                      onChange={(e) => setMesesReserva(parseInt(e.target.value) || 1)}
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-bold text-muted-foreground uppercase">mês</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-[10px] text-red-500 font-black uppercase">
                  <ShieldCheck className="w-3 h-3" />
                  Imposto DAS
                </div>
                <div className="h-9 flex items-center justify-center text-xs font-bold bg-secondary/80 rounded-md border border-red-500/30 text-red-500 tabular-nums">
                  {formatCurrency(das)}
                </div>
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
              <div className="text-[9px] font-bold text-muted-foreground uppercase leading-none mb-1">Faturamento Anual (Limite MEI)</div>
              <div className="text-lg font-bold text-indigo-500 leading-tight">{formatCurrency(totals.acumuladoReceita || 0)}</div>
              <div className="flex items-center gap-1 mt-1 text-[8px] font-black uppercase text-indigo-500/70">
                <ShieldCheck className="w-2.5 h-2.5" />
                {percentualLimite.toFixed(1)}% do Teto de 81k
              </div>
            </div>

            <div className="p-3 bg-primary/10 rounded-xl border border-primary/20">
              <div className="text-[9px] font-bold text-muted-foreground uppercase leading-none mb-1">Lucro Real (Livre para Você)</div>
              <div className="text-lg font-bold text-primary leading-tight">{formatCurrency(totals.acumuladoLucro || 0)}</div>
              <div className="flex items-center gap-1 mt-1 text-[8px] font-black uppercase text-primary/70">
                <Wallet className="w-2.5 h-2.5" />
                Dinheiro Extra (Trimestral)
              </div>
            </div>

            <div className="p-3 bg-purple-500/10 rounded-xl border border-purple-500/20">
              <div className="text-[9px] font-bold text-muted-foreground uppercase leading-none mb-1">Reserva (Caixa da Empresa)</div>
              <div className="text-lg font-bold text-purple-500 leading-tight">{formatCurrency(totals.acumuladoReserva || 0)}</div>
              <div className="flex items-center gap-1 mt-1 text-[8px] font-black uppercase text-purple-500/70">
                <PiggyBank className="w-2.5 h-2.5" />
                Patrimônio do Negócio
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto no-scrollbar pb-6">
            <Table className="min-w-[1250px] border-collapse">
              <TableHeader className="bg-secondary/30">
                <TableRow className="hover:bg-transparent border-b bg-primary/10">
                  <TableHead colSpan={9} className="h-12 py-0 text-center border-b border-primary/20">
                    <div className="flex items-center justify-between px-8 animate-pulse text-[10px] font-bold uppercase tracking-[0.4em] text-primary/80">
                      <div className="flex items-center gap-4">
                        <ArrowLeftRight className="w-4 h-4" />
                        Área de Rolagem Lateral
                        <ArrowLeftRight className="w-4 h-4" />
                      </div>
                      <div className="flex items-center gap-4">
                        <ArrowLeftRight className="w-4 h-4" />
                        Área de Rolagem Lateral
                        <ArrowLeftRight className="w-4 h-4" />
                      </div>
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
                  <TableHead className="w-[180px] font-bold text-[10px] uppercase px-6 text-indigo-500 bg-indigo-500/5">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-3 h-3" />
                      Faturamento Mensal (R$)
                    </div>
                  </TableHead>
                  <TableHead className="w-[180px] font-bold text-[10px] uppercase px-6 text-orange-500 bg-orange-500/5">
                    <div className="flex items-center gap-2">
                      <Scale className="w-3 h-3" />
                      Custos Operacionais (R$)
                    </div>
                  </TableHead>
                  <TableHead className="w-[140px] text-right font-bold text-[10px] uppercase px-6">Sobra Bruta</TableHead>
                  <TableHead className="w-[140px] text-right font-bold text-[10px] uppercase text-purple-500 px-6">
                    <div className="flex items-center justify-end gap-2">
                      <PiggyBank className="w-3 h-3" />
                      Reserva PJ
                    </div>
                  </TableHead>
                  <TableHead className="w-[140px] text-right font-bold text-[10px] uppercase text-primary px-6">
                    <div className="flex items-center justify-end gap-2">
                      <Wallet className="w-3 h-3" />
                      Lucro Extra
                    </div>
                  </TableHead>
                  <TableHead className="w-[180px] text-right font-bold text-[10px] uppercase px-6 opacity-30">Lucro Acum.</TableHead>
                  <TableHead className="w-[180px] text-right font-bold text-[10px] uppercase px-6 opacity-30">Reserva Acum.</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {totals.rows.map((row, i) => (
                  <TableRow key={i} className={cn(
                    "transition-all duration-300",
                    !row.active ? "opacity-20 grayscale scale-[0.98]" : "hover:bg-primary/5"
                  )}>
                    <TableCell className="py-3 text-center border-r">
                      <div className="flex justify-center">
                        <Switch 
                          checked={row.active} 
                          onCheckedChange={(checked) => updateMonth(i, 'active', !!checked)}
                          className="scale-90 data-[state=checked]:bg-primary"
                        />
                      </div>
                    </TableCell>
                    <TableCell className="font-bold text-xs py-3 border-r text-center bg-card">
                      {MESES[i]}
                    </TableCell>
                    <TableCell className="py-2 px-6 bg-indigo-500/5">
                      <div className="relative group/input">
                        <Input 
                          type="number" 
                          disabled={!row.active}
                          value={row.receita} 
                          onChange={(e) => updateMonth(i, 'receita', e.target.value)}
                          className="h-10 text-xs font-bold bg-background/40 border-indigo-500/20 hover:border-indigo-500 focus:border-indigo-500 focus:bg-background/80 transition-all text-indigo-500 pr-8"
                        />
                        <PenLine className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-indigo-500/30 group-hover/input:text-indigo-500 transition-colors pointer-events-none" />
                      </div>
                    </TableCell>
                    <TableCell className="py-2 px-6 bg-orange-500/5">
                      <div className="relative group/input">
                        <Input 
                          type="number" 
                          disabled={!row.active}
                          value={row.custos} 
                          onChange={(e) => updateMonth(i, 'custos', e.target.value)}
                          className="h-10 text-xs font-bold bg-background/40 border-orange-500/20 hover:border-orange-500 focus:border-orange-500 focus:bg-background/80 transition-all text-orange-500 pr-8"
                        />
                        <PenLine className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-orange-500/30 group-hover/input:text-orange-500 transition-colors pointer-events-none" />
                      </div>
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
        <div className="p-1 rounded-3xl bg-gradient-to-br from-amber-500/40 via-amber-500/10 to-transparent shadow-2xl">
          <div className="bg-background/95 backdrop-blur-xl rounded-[22px] p-8 space-y-10 overflow-hidden relative">
            {/* Background Decorativo */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-amber-500/5 blur-[100px] rounded-full" />
            
            {/* Header: Motor de Prosperidade */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full">
                  <Zap className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-600">Gestão de Destino Profissional</span>
                </div>
                <h3 className="text-4xl font-black tracking-tighter text-foreground leading-none">
                  O Ciclo do Capital <span className="text-amber-500">R$ 10k</span>
                </h3>
                <p className="text-sm text-muted-foreground font-medium max-w-md leading-relaxed">
                  Visualize o potencial explosivo de uma operação otimizada com 10% de custos. 
                  Transforme faturamento bruto em patrimônio real.
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Padrão de Excelência</div>
                  <div className="text-xl font-black text-amber-600">Unicórnio</div>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-amber-500 flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
                  <Target className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Fluxo Visual: Nível Unicórnio */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
              {/* Coluna 1: Input de Energia (Faturamento) */}
              <div className="lg:col-span-3 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Faturamento Mensal</span>
                </div>
                <div className="p-6 rounded-3xl bg-secondary/30 border-2 border-amber-500/20 shadow-inner group hover:border-amber-500/40 transition-all">
                  <div className="text-3xl font-black text-foreground tabular-nums tracking-tighter">R$ 10.000</div>
                  <div className="mt-2 flex items-center gap-2 text-[9px] font-black uppercase text-amber-600/70">
                    <Rocket className="w-3 h-3" />
                    Potencial de Escala 10x
                  </div>
                </div>
                
                {/* Deduções Visuais */}
                <div className="space-y-2 pl-4 border-l-2 border-dashed border-amber-500/20">
                  <div className="flex justify-between text-xs py-1">
                    <span className="text-muted-foreground">Custos (10%)</span>
                    <span className="font-bold text-orange-500">- R$ 1.000</span>
                  </div>
                  <div className="flex justify-between text-xs py-1">
                    <span className="text-muted-foreground">DAS (Fixo)</span>
                    <span className="font-bold text-red-500">- R$ 76</span>
                  </div>
                  <div className="flex justify-between text-xs py-1">
                    <span className="text-muted-foreground">Pró-labore</span>
                    <span className="font-bold text-blue-500">- R$ 2.000</span>
                  </div>
                </div>
              </div>

              {/* Conector Central: O Filtro de Lucro */}
              <div className="lg:col-span-1 flex items-center justify-center py-4">
                <div className="h-px lg:h-full w-full lg:w-px bg-gradient-to-b from-amber-500/50 via-amber-500/10 to-transparent relative">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background border-2 border-amber-500/30 flex items-center justify-center shadow-xl">
                    <ChevronRight className="w-4 h-4 text-amber-500 rotate-90 lg:rotate-0" />
                  </div>
                </div>
              </div>

              {/* Coluna 2: A Sobra Explosiva */}
              <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Bloco de Resultado Mensal */}
                <div className="space-y-6">
                   <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Resultado Líquido do Mês</span>
                  </div>
                  
                  <div className="p-8 rounded-[40px] bg-amber-500/10 border-2 border-amber-500/30 shadow-2xl relative group overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                      <Sparkles className="w-20 h-20" />
                    </div>
                    <div className="text-[10px] font-black uppercase text-amber-600 mb-2 tracking-[0.3em]">Sobra Bruta Mensal</div>
                    <div className="text-5xl font-black text-foreground tracking-tighter tabular-nums">R$ 6.924</div>
                    <div className="mt-4 flex items-center gap-2">
                       <Badge className="bg-amber-500 text-white border-none font-black text-[9px] uppercase tracking-widest">Taxa de Eficiência: 69%</Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-secondary/50 border border-purple-500/20 space-y-1">
                      <div className="text-[8px] font-black text-purple-500 uppercase tracking-widest">Reserva PJ (60%)</div>
                      <div className="text-lg font-black text-foreground">R$ 4.154</div>
                    </div>
                    <div className="p-4 rounded-2xl bg-secondary/50 border border-primary/20 space-y-1">
                      <div className="text-[8px] font-black text-primary uppercase tracking-widest">Acumulado Op (40%)</div>
                      <div className="text-lg font-black text-foreground">R$ 2.770</div>
                    </div>
                  </div>
                </div>

                {/* Bloco de Explosão Trimestral */}
                <div className="space-y-6">
                   <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">O Poder dos 90 Dias</span>
                  </div>

                  <div className="relative h-full">
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-transparent blur-3xl opacity-30 rounded-full" />
                    <div className="relative h-full flex flex-col justify-between p-8 rounded-[40px] border-2 border-dashed border-amber-500/30 bg-background/40 backdrop-blur-md shadow-xl group">
                      <div className="space-y-1">
                        <div className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Fechamento do Trimestre</div>
                        <div className="text-2xl font-black text-foreground">R$ 8.310 <span className="text-xs font-normal text-muted-foreground opacity-60">acumulados</span></div>
                        <div className="text-[9px] font-bold text-amber-600 uppercase italic">Cálculo: R$ 2.770 x 3 meses</div>
                      </div>

                      <div className="py-8 flex items-center justify-center relative">
                        <div className="absolute h-px w-full bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />
                        <div className="w-16 h-16 rounded-3xl bg-amber-500 text-white flex items-center justify-center shadow-2xl shadow-amber-500/40 z-10 group-hover:scale-110 transition-transform">
                          <Landmark className="w-8 h-8" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center space-y-2">
                          <div className="mx-auto w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600">
                             <Wallet className="w-5 h-5" />
                          </div>
                          <div className="space-y-0.5">
                            <div className="text-sm font-black text-amber-600">R$ 4.155</div>
                            <div className="text-[8px] font-black text-muted-foreground uppercase leading-none">PF: Sua Liberdade (50%)</div>
                          </div>
                        </div>
                        <div className="text-center space-y-2">
                          <div className="mx-auto w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600">
                             <Rocket className="w-5 h-5" />
                          </div>
                          <div className="space-y-0.5">
                            <div className="text-sm font-black text-amber-600">R$ 4.155</div>
                            <div className="text-[8px] font-black text-muted-foreground uppercase leading-none">PJ: Sua Escala (50%)</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Educativo */}
            <div className="pt-8 border-t border-amber-500/10 relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
               <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-500/20 rounded-lg text-amber-600">
                    <Lightbulb className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase text-foreground">Regra de Ouro: Disciplina gera Liberdade</h4>
                    <p className="text-[10px] text-muted-foreground leading-tight">O Pró-labore é sua sobrevivência. O Lucro trimestral é sua construção de riqueza.</p>
                  </div>
               </div>
               <div className="text-[10px] font-black text-amber-600/50 uppercase tracking-[0.4em]">MEI Flow Elite Model</div>
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
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
      `}</style>
    </div>
  );
}
