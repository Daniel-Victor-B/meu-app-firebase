
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
  ChevronUp,
  ChevronDown,
  Target,
  Rocket,
  Landmark,
  Sparkles,
  ChevronRight,
  Zap,
  TrendingDown,
  BookOpen,
  RefreshCw,
  PlusCircle,
  Banknote,
  CheckCircle2,
  AlertCircle,
  Trash2
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
import { Slider } from "@/components/ui/slider";
import { type MonthlyData } from "@/app/page";
import { toast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", 
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

interface BankTransaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: "CREDIT" | "DEBIT";
  category: string;
}

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
    q: "Como funciona a Integração Bancária?",
    a: "O MEI Flow se conecta à sua conta PJ via Open Banking. Nós apenas lemos as transações para automatizar o preenchimento da sua planilha. Suas credenciais nunca são armazenadas."
  },
  {
    q: "Qual o valor ideal para o Colchão de Segurança?",
    a: "Para um MEI, o ideal é ter entre 6 a 12 meses de custos totais guardados. Isso garante que as contas continuem pagas mesmo em meses de baixa."
  },
  {
    q: "O lucro deve ser sacado mensalmente?",
    a: "Não! A regra de ouro é: Pró-labore é mensal, Lucro é trimestral. Isso garante fôlego financeiro para o seu negócio."
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
  const [distribuicaoLucroPct, setDistribuicaoLucroPct] = useState(50);
  const [selectedQuarter, setSelectedQuarter] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isBankConnected, setIsBankConnected] = useState(false);
  const [highlightedMonth, setHighlightedMonth] = useState<number | null>(null);
  const [showAllPending, setShowAllPending] = useState(false);
  
  // Persistência de Transações Pendentes
  const [pendingTransactions, setPendingTransactions] = useState<BankTransaction[]>([]);

  // Persistência de IDs Importados (para evitar duplicatas)
  const [importedIds, setImportedIds] = useState<Set<string>>(new Set());

  const das = 76;

  // Efeito de Inicialização (Client-side only)
  useEffect(() => {
    const savedReserva = localStorage.getItem("mei-flow-ledger-meses-reserva");
    if (savedReserva) setMesesReserva(parseInt(savedReserva, 10) || 6);
    
    const savedDist = localStorage.getItem("mei-flow-ledger-dist-lucro");
    if (savedDist) setDistribuicaoLucroPct(parseInt(savedDist, 10) || 50);

    const connected = localStorage.getItem("mei-flow-bank-connected");
    if (connected === "true") setIsBankConnected(true);

    const savedPending = localStorage.getItem("mei-flow-pending-txs");
    if (savedPending) {
      try {
        setPendingTransactions(JSON.parse(savedPending));
      } catch (e) { console.error("Erro ao carregar pendências", e); }
    }

    const savedImported = localStorage.getItem("mei-flow-imported-ids");
    if (savedImported) {
      try {
        setImportedIds(new Set(JSON.parse(savedImported)));
      } catch (e) { console.error("Erro ao carregar histórico de IDs", e); }
    }
  }, []);

  // Persistência Automática de Configurações
  useEffect(() => {
    localStorage.setItem("mei-flow-ledger-meses-reserva", mesesReserva.toString());
  }, [mesesReserva]);

  useEffect(() => {
    localStorage.setItem("mei-flow-ledger-dist-lucro", distribuicaoLucroPct.toString());
  }, [distribuicaoLucroPct]);

  // Persistência de Pendências
  useEffect(() => {
    localStorage.setItem("mei-flow-pending-txs", JSON.stringify(pendingTransactions));
  }, [pendingTransactions]);

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

  const syncBank = async () => {
    if (!isBankConnected) {
      setIsBankConnected(true);
      localStorage.setItem("mei-flow-bank-connected", "true");
      toast({
        title: "Banco Conectado",
        description: "Sua conta PJ foi vinculada com sucesso.",
      });
    }

    setIsSyncing(true);
    try {
      const res = await fetch('/api/bank/sync');
      const data = await res.json();
      
      // 1. Filtrar transações que já foram importadas para o histórico (importedIds)
      const newTransactions = data.transactions.filter((tx: BankTransaction) => !importedIds.has(tx.id));
      const alreadyImportedCount = data.transactions.length - newTransactions.length;
      
      setPendingTransactions(prev => {
        // 2. Filtrar transações que já estão na lista de pendências atual para evitar duplicatas visuais
        const currentPendingIds = new Set(prev.map(t => t.id));
        const finalNew = newTransactions.filter((t: BankTransaction) => !currentPendingIds.has(t.id));
        
        const combined = [...prev, ...finalNew];
        
        // 3. Garantir unicidade absoluta por ID
        return combined.filter((tx, index, self) => 
          index === self.findIndex(t => t.id === tx.id)
        );
      });

      if (alreadyImportedCount > 0) {
        toast({
          title: "Sincronização Concluída",
          description: `${newTransactions.length} novas transações encontradas (${alreadyImportedCount} já ignoradas por duplicidade).`,
        });
      } else {
        toast({
          title: "Sincronização Concluída",
          description: `${newTransactions.length} novas transações encontradas.`,
        });
      }
    } catch (error) {
      toast({
        title: "Erro na Sincronização",
        description: "Não foi possível buscar os dados do banco.",
        variant: "destructive"
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const importTransaction = (tx: BankTransaction) => {
    const currentMonthIndex = new Date().getMonth();
    const newData = [...monthlyData];
    
    // Ativação automática do mês se estiver inativo
    let wasInactive = false;
    if (!newData[currentMonthIndex].active) {
      newData[currentMonthIndex] = { ...newData[currentMonthIndex], active: true };
      wasInactive = true;
    }
    
    // Incrementa valores na planilha
    if (tx.type === "CREDIT") {
      newData[currentMonthIndex].receita += tx.amount;
    } else {
      newData[currentMonthIndex].custos += Math.abs(tx.amount);
    }
    
    setMonthlyData(newData);
    
    // Adiciona ID ao histórico e persiste imediatamente
    setImportedIds(prev => {
      const next = new Set(prev);
      next.add(tx.id);
      localStorage.setItem("mei-flow-imported-ids", JSON.stringify(Array.from(next)));
      return next;
    });

    // Remove a transação da lista de pendências
    setPendingTransactions(prev => prev.filter(t => t.id !== tx.id));
    
    if (wasInactive) {
      toast({
        title: "Mês ativado automaticamente",
        description: `O mês de ${MESES[currentMonthIndex]} foi ativado para receber as transações importadas.`,
      });
    }

    toast({
      title: "Transação Importada",
      description: `${tx.description} adicionada ao mês de ${MESES[currentMonthIndex]}.`,
    });

    // Feedback visual na linha da tabela
    setHighlightedMonth(currentMonthIndex);
    setTimeout(() => setHighlightedMonth(null), 1500);
  };

  const clearImportHistory = () => {
    setImportedIds(new Set());
    localStorage.removeItem("mei-flow-imported-ids");
    toast({
      title: "Histórico Limpo",
      description: "Agora você pode reimportar transações antigas.",
    });
  };

  const totals = useMemo(() => {
    let acumuladoReservaTotal = 0;
    let acumuladoReceitaTotal = 0;
    let acumuladoLucroTotal = 0;

    const rows = monthlyData.map((m) => {
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
      acumuladoLucro: acumuladoLucroTotal
    };
  }, [monthlyData, das, prolabore, reservaPct]);

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
  const percentualLimite = Math.min(100, (totals.acumuladoReceita / LIMITE_MEI) * 100);

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

  const displayedTransactions = showAllPending ? pendingTransactions : pendingTransactions.slice(0, 3);

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 pb-16">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <Card className="border-primary/20 bg-primary/5 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Landmark className="w-32 h-32" />
            </div>
            <CardContent className="p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
              <div className="space-y-2 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2 text-primary">
                  <RefreshCw className={cn("w-5 h-5", isSyncing && "animate-spin")} />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">Automação Bancária</span>
                </div>
                <h3 className="text-xl font-bold tracking-tight">Sincronize seu Fluxo de Caixa</h3>
                <p className="text-xs text-muted-foreground font-medium max-w-sm">
                  Conecte sua conta PJ para importar transações automaticamente e economizar tempo no preenchimento.
                </p>
              </div>
              <div className="flex flex-col gap-3 w-full md:w-auto">
                <Button 
                  onClick={syncBank} 
                  disabled={isSyncing}
                  className="rounded-xl h-12 px-8 font-black uppercase tracking-widest text-[10px] gap-2 shadow-xl shadow-primary/20"
                >
                  {isSyncing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                  {isBankConnected ? "Sincronizar Agora" : "Conectar Conta PJ"}
                </Button>
                {isBankConnected && (
                  <div className="flex items-center justify-center gap-4">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-primary">
                      <CheckCircle2 className="w-3 h-3" />
                      Banco Ativo
                    </div>
                    <Button 
                      variant="ghost" 
                      onClick={clearImportHistory}
                      className="text-[9px] font-bold text-muted-foreground hover:text-destructive h-auto p-0"
                    >
                      <Trash2 className="w-3 h-3 mr-1" /> Limpar Histórico
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-4">
          <Card className="h-full border-border/50 bg-card/40 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Banknote className="w-4 h-4 text-primary" />
                  Pendentes ({pendingTransactions.length})
                </div>
                {pendingTransactions.length > 0 && (
                  <Badge variant="secondary" className="text-[9px] font-black px-1.5 h-4 bg-primary/10 text-primary border-none">LIVE</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="px-4 pb-4 space-y-2">
                {!monthlyData[new Date().getMonth()]?.active && pendingTransactions.length > 0 && (
                  <div className="px-3 py-2 mb-2 text-[9px] font-bold text-amber-500 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-center gap-2 animate-pulse">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    Mês atual inativo. Ativação automática ao importar.
                  </div>
                )}
                
                <div className="max-h-[160px] overflow-y-auto space-y-2 no-scrollbar">
                  {pendingTransactions.length === 0 ? (
                    <div className="py-8 text-center text-[10px] font-bold text-muted-foreground uppercase opacity-40">
                      Nenhuma transação pendente
                    </div>
                  ) : (
                    displayedTransactions.map((tx) => (
                      <div key={tx.id} className="flex items-center justify-between p-2 rounded-lg bg-background border border-border/50 group hover:border-primary/30 transition-all animate-in fade-in slide-in-from-right-2 duration-300">
                        <div className="min-w-0 flex-1">
                          <div className="text-[10px] font-bold truncate pr-2 uppercase">{tx.description}</div>
                          <div className={cn("text-[10px] font-black", tx.type === "CREDIT" ? "text-primary" : "text-orange-500")}>
                            {tx.type === "CREDIT" ? "+" : "-"}{formatCurrency(Math.abs(tx.amount))}
                          </div>
                        </div>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                onClick={() => importTransaction(tx)}
                                className="h-7 w-7 rounded-full hover:bg-primary/20 text-primary shrink-0"
                              >
                                <PlusCircle className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="bg-popover border-border text-foreground">
                              <p className="text-[10px] font-bold">Importar para o mês atual. O mês será ativado se necessário.</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    ))
                  )}
                </div>

                {pendingTransactions.length > 3 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setShowAllPending(!showAllPending)}
                    className="w-full text-[9px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary h-6"
                  >
                    {showAllPending ? "Mostrar Menos" : `Ver todas (${pendingTransactions.length})`}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

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
                <CardTitle className="text-sm font-bold uppercase tracking-wider">Parâmetros de Gestão</CardTitle>
                <CardDescription className="text-[10px] uppercase font-bold text-muted-foreground">Configurações globais do negócio</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-[10px] text-blue-500 font-black uppercase">
                  <UserCircle className="w-3 h-3" />
                  Salário PF (Pró-labore)
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
                  Reserva PJ (%)
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
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden border-border/50 shadow-xl">
        <CardHeader className="flex flex-col lg:flex-row lg:items-center justify-between bg-card pb-4 gap-4 px-6 pt-6 border-b">
          <div className="flex-shrink-0">
            <CardTitle className="text-lg flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              Livro de Caixa Anual
            </CardTitle>
            <CardDescription className="text-xs">Registro oficial de faturamento e custos do exercício</CardDescription>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-2xl">
            <div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
              <div className="text-[9px] font-bold text-muted-foreground uppercase leading-none mb-1">Faturamento Acumulado</div>
              <div className="text-lg font-bold text-indigo-500 leading-tight">{formatCurrency(totals.acumuladoReceita || 0)}</div>
              <div className="flex items-center gap-1 mt-1 text-[8px] font-black uppercase text-indigo-500/70">
                <ShieldCheck className="w-2.5 h-2.5" />
                {percentualLimite.toFixed(1)}% do Teto MEI
              </div>
            </div>

            <div className="p-3 bg-primary/10 rounded-xl border border-primary/20">
              <div className="text-[9px] font-bold text-muted-foreground uppercase leading-none mb-1">Lucro Real Acumulado</div>
              <div className="text-lg font-bold text-primary leading-tight">{formatCurrency(totals.acumuladoLucro || 0)}</div>
              <div className="flex items-center gap-1 mt-1 text-[8px] font-black uppercase text-primary/70">
                <Wallet className="w-2.5 h-2.5" />
                Disponibilidade Total
              </div>
            </div>

            <div className="p-3 bg-purple-500/10 rounded-xl border border-purple-500/20">
              <div className="text-[9px] font-bold text-muted-foreground uppercase leading-none mb-1">Patrimônio PJ Acumulado</div>
              <div className="text-lg font-bold text-purple-500 leading-tight">{formatCurrency(totals.acumuladoReserva || 0)}</div>
              <div className="flex items-center gap-1 mt-1 text-[8px] font-black uppercase text-purple-500/70">
                <PiggyBank className="w-2.5 h-2.5" />
                Blindagem de Caixa
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
                        Registro Mensal de Faturamento (Fonte de Verdade)
                        <ArrowLeftRight className="w-4 h-4" />
                      </div>
                    </div>
                  </TableHead>
                </TableRow>
                
                <TableRow className="hover:bg-transparent border-b">
                  <TableHead className="w-[80px] font-bold text-[10px] uppercase text-center border-r bg-secondary/10">Ativo</TableHead>
                  <TableHead className="w-[120px] font-bold text-[10px] uppercase border-r text-center bg-secondary/10">Mês</TableHead>
                  <TableHead className="w-[180px] font-bold text-[10px] uppercase px-6 text-indigo-500 bg-indigo-500/5">Receita Bruta (R$)</TableHead>
                  <TableHead className="w-[180px] font-bold text-[10px] uppercase px-6 text-orange-500 bg-orange-500/5">Custos Op. (R$)</TableHead>
                  <TableHead className="w-[140px] text-right font-bold text-[10px] uppercase px-6">Sobra Bruta</TableHead>
                  <TableHead className="w-[140px] text-right font-bold text-[10px] uppercase text-purple-500 px-6">Reserva PJ</TableHead>
                  <TableHead className="w-[140px] text-right font-bold text-[10px] uppercase text-primary px-6">Lucro Real</TableHead>
                  <TableHead className="w-[180px] text-right font-bold text-[10px] uppercase px-6 opacity-30">Lucro Acum.</TableHead>
                  <TableHead className="w-[180px] text-right font-bold text-[10px] uppercase px-6 opacity-30">Reserva Acum.</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {totals.rows.map((row, i) => (
                  <TableRow key={i} className={cn(
                    "transition-all duration-300",
                    highlightedMonth === i && "bg-primary/20 shadow-[inset_0_0_20px_rgba(34,197,94,0.1)] border-primary/50",
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
                      {MESES[i]}
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
                  Consolide o lucro real do trimestre e defina sua distribuição tática.
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
                    <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Lucro do Ciclo</span>
                    <Target className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="text-4xl font-black text-foreground tabular-nums tracking-tighter">
                    {formatCurrency(currentQ.profit)}
                  </div>
                </div>

                <div className="space-y-4 p-6 rounded-3xl bg-primary/5 border border-primary/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span className="text-[10px] font-black uppercase text-primary tracking-widest">Recomendação de Elite</span>
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
                          <span>Manter <strong>{formatCurrency(qProfitPJ_Recommended)}</strong> ({smartTarget.pj}%) para <strong>Escala PJ</strong></span>
                        </li>
                      </>
                    ) : (
                      <li className="flex gap-3 text-xs text-muted-foreground italic">
                        <TrendingDown className="w-3.5 h-3.5 text-destructive shrink-0" />
                        <span>Focar na margem de lucro para o próximo trimestre.</span>
                      </li>
                    )}
                  </ul>
                </div>
              </div>

              <div className="lg:col-span-8 space-y-8">
                <div className="p-8 rounded-[40px] bg-background/40 border-2 border-dashed border-amber-500/20 space-y-10">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="space-y-1 text-center sm:text-left">
                      <h4 className="text-xl font-black text-foreground tracking-tight">Distribuição de Resultados</h4>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Organize o destino da sua riqueza</p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setDistribuicaoLucroPct(smartTarget.pf)}
                      className="rounded-full gap-2 border-amber-500/30 text-amber-500 hover:bg-amber-500/10 h-9 px-4"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Sincronizar IA ({smartTarget.pf}%)
                    </Button>
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
                        Saque PF ({distribuicaoLucroPct}%)
                      </div>
                      <div className="flex items-center gap-2">
                        Retenção PJ ({100 - distribuicaoLucroPct}%)
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
                        <span className="text-[10px] font-black uppercase text-blue-500 tracking-widest">Liberdade (CPF)</span>
                      </div>
                      <div className="text-2xl font-black text-foreground tabular-nums tracking-tighter">
                        {formatCurrency(qProfitPF_Manual)}
                      </div>
                    </div>

                    <div className="p-6 rounded-3xl bg-primary/5 border border-primary/20 group hover:bg-primary/10 transition-all">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-primary/20 rounded-xl text-primary">
                          <Rocket className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-black uppercase text-primary tracking-widest">Escala (CNPJ)</span>
                      </div>
                      <div className="text-2xl font-black text-foreground tabular-nums tracking-tighter">
                        {formatCurrency(qProfitPJ_Manual)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="space-y-6 pt-6">
        <div className="flex items-center gap-3 px-1">
          <div className="p-2.5 bg-primary/10 rounded-xl text-primary shadow-inner">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-headline font-bold text-xl tracking-tight">FAQ de Gestão</h3>
            <p className="text-xs text-muted-foreground font-medium mt-1">Orientações para o registro fiel das suas finanças e proteção do lucro.</p>
          </div>
        </div>

        <Accordion type="single" collapsible className="w-full space-y-3">
          {FAQS_PLANILHA.map((faq, idx) => (
            <AccordionItem key={idx} value={`faq-${idx}`} className="border rounded-2xl px-5 bg-card/40 shadow-sm hover:shadow-md transition-all hover:bg-card">
              <AccordionTrigger className="text-sm font-bold text-left hover:no-underline py-5 leading-relaxed group">
                <span className="group-hover:text-primary transition-colors">{faq.q}</span>
              </AccordionTrigger>
              <AccordionContent className="text-xs text-muted-foreground leading-relaxed pb-6 pt-2 font-medium">
                <div className="flex gap-4">
                  <div className="w-1 h-full bg-primary/20 rounded-full shrink-0" />
                  {faq.a}
                </div>
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
