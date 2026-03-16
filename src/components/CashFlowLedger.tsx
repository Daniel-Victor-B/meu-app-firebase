
"use client"

import { useState, useMemo, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/formatters";
import { calculateDasValue } from "@/lib/dasCalculator";
import { useBusiness } from "@/contexts/BusinessContext";
import { 
  FileSpreadsheet, 
  ShieldCheck, 
  HelpCircle, 
  ArrowLeftRight, 
  Wallet, 
  Settings2, 
  UserCircle, 
  Percent, 
  ChevronUp,
  ChevronDown,
  Target,
  Rocket,
  Landmark,
  Sparkles,
  Zap,
  BookOpen,
  RefreshCw,
  PlusCircle,
  Save,
  Trash2,
  History,
  Scale,
  ArrowRight,
  Activity,
  AlertCircle,
  CheckCircle2,
  Unlink,
  Receipt,
  Banknote,
  FileText
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
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

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

type ActivityLogEntry = {
  id: string;
  timestamp: number;
  actionType: 'import' | 'manual_edit' | 'month_toggle' | 'clear_history' | 'distribution';
  description: string;
  details?: any;
  monthIndex?: number;
  amount?: number;
};

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
    q: "Como funcionam as 'Saídas' da Reserva e do Caixa?",
    a: "Esses campos permitem registrar quando você retira dinheiro que já estava guardado. Por exemplo, se você teve uma emergência e usou R$ 1.000 da reserva, lance esse valor em 'Saída Reserva'. O saldo do card 'Colchão de Segurança' será atualizado automaticamente."
  },
  {
    q: "O que é 'Imposto Extra'?",
    a: "É qualquer tributo além do DAS mensal. Use para registrar multas por atraso, diferença de alíquota interestadual (DIFAL) ou parcelamentos de dívidas fiscais antigas."
  },
  {
    q: "O que é Imutabilidade Paramétrica?",
    a: "É o sistema do MEI Flow que garante que seus dados passados fiquem protegidos. Se você aumentar seu pró-labore hoje, os lucros de meses passados não mudam, pois eles guardam as configurações da época."
  },
  {
    q: "Por que os valores de lucro de meses passados não mudam quando altero meu pró-labore?",
    a: "Isso acontece devido ao sistema de Snapshot. Cada mês salva uma 'foto' das suas configurações de custos no momento do lançamento. Isso evita que uma mudança estratégica hoje distorça a realidade do que aconteceu meses atrás."
  }
];

export function CashFlowLedger({ 
  fat, setFat, 
  custos, setCustos, 
  prolabore, setProlabore, 
  reservaPct, setReservaPct,
  monthlyData, setMonthlyData
}: CashFlowLedgerProps) {
  const { businessData } = useBusiness();
  const dasValue = calculateDasValue(businessData.ramo);

  const [mesesReserva, setMesesReserva] = useState(() => {
    if (typeof window === "undefined") return 6;
    const saved = localStorage.getItem("mei-flow-ledger-meses-reserva");
    return saved ? parseInt(saved, 10) || 6 : 6;
  });

  const [distribuicaoLucroPct, setDistribuicaoLucroPct] = useState(() => {
    if (typeof window === "undefined") return 50;
    const saved = localStorage.getItem("mei-flow-ledger-dist-lucro");
    return saved ? parseInt(saved, 10) || 50 : 50;
  });

  const [selectedQuarter, setSelectedQuarter] = useState(0);

  const [isBankConnected, setIsBankConnected] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("mei-flow-bank-connected") === "true";
  });

  const [connectedBankName, setConnectedBankName] = useState<string>(() => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem("mei-flow-connected-bank-name") || "";
  });

  const [importedIds, setImportedIds] = useState<Set<string>>(() => {
    if (typeof window === "undefined") return new Set();
    const saved = localStorage.getItem("mei-flow-imported-ids");
    if (!saved) return new Set();
    try {
      const parsed = JSON.parse(saved);
      return new Set(Array.isArray(parsed) ? parsed : []);
    } catch (e) { return new Set(); }
  });

  const [pendingTransactions, setPendingTransactions] = useState<BankTransaction[]>(() => {
    if (typeof window === "undefined") return [];
    const saved = localStorage.getItem("mei-flow-pending-txs");
    if (!saved) return [];
    try { return JSON.parse(saved); } catch (e) { return []; }
  });

  const [activityLog, setActivityLog] = useState<ActivityLogEntry[]>(() => {
    if (typeof window === "undefined") return [];
    const saved = localStorage.getItem("mei-flow-activity-log");
    if (!saved) return [];
    try { return JSON.parse(saved); } catch (e) { return []; }
  });

  const [isSyncing, setIsSyncing] = useState(false);
  const [highlightedMonth, setHighlightedMonth] = useState<number | null>(null);
  const [isPendingExpanded, setIsPendingExpanded] = useState(false);

  useEffect(() => {
    localStorage.setItem("mei-flow-pending-txs", JSON.stringify(pendingTransactions));
  }, [pendingTransactions]);

  useEffect(() => {
    localStorage.setItem("mei-flow-activity-log", JSON.stringify(activityLog));
  }, [activityLog]);

  useEffect(() => {
    localStorage.setItem("mei-flow-ledger-meses-reserva", mesesReserva.toString());
  }, [mesesReserva]);

  useEffect(() => {
    localStorage.setItem("mei-flow-ledger-dist-lucro", distribuicaoLucroPct.toString());
  }, [distribuicaoLucroPct]);

  useEffect(() => {
    let precisaAtualizar = false;
    const newData = monthlyData.map(m => {
      if (m.sobra === undefined || m.reserva === undefined || m.lucro === undefined) {
        precisaAtualizar = true;
        const currentDas = calculateDasValue(businessData.ramo);
        const sobra = Math.max(0, m.receita - m.custos - currentDas - prolabore);
        const reserva = Math.round((sobra * reservaPct) / 100);
        const lucro = sobra - reserva;
        return {
          ...m,
          prolabore_usado: prolabore,
          reservaPct_usado: reservaPct,
          sobra,
          reserva,
          lucro,
          saidaReserva: m.saidaReserva || 0,
          saidaCaixaOperacional: m.saidaCaixaOperacional || 0,
          impostoExtra: m.impostoExtra || 0
        };
      }
      return m;
    });
    if (precisaAtualizar) {
      setMonthlyData(newData);
    }
  }, [businessData.ramo, prolabore, reservaPct]);

  const addLogEntry = useCallback((entry: Omit<ActivityLogEntry, 'id' | 'timestamp'>) => {
    const newEntry: ActivityLogEntry = {
      ...entry,
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      timestamp: Date.now(),
    };
    setActivityLog(prev => [newEntry, ...prev]);
  }, []);

  const updateMonth = (index: number, field: keyof MonthlyData, value: any) => {
    const newData = [...monthlyData];
    const oldValue = newData[index][field];
    
    if (field === 'active') {
      const isActivating = !!value;
      if (isActivating) {
        const sobra = Math.max(0, newData[index].receita - newData[index].custos - dasValue - prolabore);
        const reserva = Math.round((sobra * reservaPct) / 100);
        const lucro = sobra - reserva;
        newData[index] = { 
          ...newData[index], 
          active: true,
          prolabore_usado: prolabore,
          reservaPct_usado: reservaPct,
          sobra,
          reserva,
          lucro
        };
      } else {
        newData[index] = { 
          ...newData[index], 
          active: false,
          prolabore_usado: undefined,
          reservaPct_usado: undefined,
          sobra: undefined,
          reserva: undefined,
          lucro: undefined
        };
      }
      addLogEntry({
        actionType: 'month_toggle',
        description: `${MESES[index]} ${isActivating ? 'ativado' : 'desativado'}`,
        monthIndex: index
      });
    } else {
      const newValue = parseFloat(value) || 0;
      if (oldValue !== newValue) {
        newData[index] = { ...newData[index], [field]: newValue };
        
        // Se for campo de entrada/snapshot, recalcular snapshot
        if (field === 'receita' || field === 'custos') {
          const sobra = Math.max(0, newData[index].receita - newData[index].custos - dasValue - prolabore);
          const reserva = Math.round((sobra * reservaPct) / 100);
          const lucro = sobra - reserva;
          newData[index] = {
            ...newData[index],
            prolabore_usado: prolabore,
            reservaPct_usado: reservaPct,
            sobra,
            reserva,
            lucro
          };
        }

        addLogEntry({
          actionType: 'manual_edit',
          description: `Alteração em ${MESES[index]}: Campo ${field} ajustado.`,
          monthIndex: index,
          amount: newValue - (oldValue as number)
        });
      }
    }
    setMonthlyData(newData);
  };

  const syncBank = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/bank/sync');
      const data = await res.json();
      
      if (!isBankConnected) {
        setIsBankConnected(true);
        localStorage.setItem("mei-flow-bank-connected", "true");
        if (data.bankName) {
          setConnectedBankName(data.bankName);
          localStorage.setItem("mei-flow-connected-bank-name", data.bankName);
        }
      }

      const newTransactions = data.transactions.filter((tx: BankTransaction) => !importedIds.has(tx.id));
      
      setPendingTransactions(prev => {
        const combined = [...prev, ...newTransactions];
        return combined.filter((tx, index, self) => 
          index === self.findIndex(t => t.id === tx.id)
        );
      });

      toast({
        title: "Sincronização Concluída",
        description: `${newTransactions.length} novas transações encontradas.`
      });
    } catch (error) {
      toast({ title: "Erro na Sincronização", variant: "destructive" });
    } finally {
      setIsSyncing(false);
    }
  };

  const importTransaction = (tx: BankTransaction) => {
    const currentMonthIndex = new Date().getMonth();
    const newData = [...monthlyData];
    
    if (!newData[currentMonthIndex].active) {
      newData[currentMonthIndex] = { ...newData[currentMonthIndex], active: true };
    }
    
    if (tx.type === "CREDIT") newData[currentMonthIndex].receita += tx.amount;
    else newData[currentMonthIndex].custos += Math.abs(tx.amount);

    const sobra = Math.max(0, newData[currentMonthIndex].receita - newData[currentMonthIndex].custos - dasValue - prolabore);
    const reserva = Math.round((sobra * reservaPct) / 100);
    const lucro = sobra - reserva;
    newData[currentMonthIndex] = {
      ...newData[currentMonthIndex],
      prolabore_usado: prolabore,
      reservaPct_usado: reservaPct,
      sobra,
      reserva,
      lucro
    };
    
    setMonthlyData(newData);
    
    const nextImported = new Set(importedIds);
    nextImported.add(tx.id);
    setImportedIds(nextImported);
    localStorage.setItem("mei-flow-imported-ids", JSON.stringify(Array.from(nextImported)));

    setPendingTransactions(prev => prev.filter(t => t.id !== tx.id));
    
    addLogEntry({
      actionType: 'import',
      description: `Importação de ${formatCurrency(Math.abs(tx.amount))} para ${MESES[currentMonthIndex]}`,
      monthIndex: currentMonthIndex,
      amount: tx.amount
    });

    setHighlightedMonth(currentMonthIndex);
    setTimeout(() => setHighlightedMonth(null), 10000); // 10 segundos de destaque
  };

  const totals = useMemo(() => {
    let acumuladoReservaTotal = 0;
    let acumuladoReceitaTotal = 0;
    let acumuladoLucroTotal = 0;
    let acumuladoSaldoPJ = 0;
    let totalImpostosAno = 0;
    let totalSaidasReservaAno = 0;

    const rows = monthlyData.map((m) => {
      const das = calculateDasValue(businessData.ramo);
      const impExtra = m.impostoExtra || 0;
      const impTotal = m.active ? (das + impExtra) : 0;

      if (!m.active) return { 
        ...m, 
        sobra: 0, reserva: 0, lucro: 0, distribuicao: m.distribuicao || 0,
        impostoTotal: 0, saidaReserva: 0, saidaCaixaOperacional: 0,
        saldoAcumulado: acumuladoSaldoPJ, acumuladoReserva: acumuladoReservaTotal
      };
      
      const sobra = m.sobra || 0;
      const reserva = m.reserva || 0;
      const lucroBase = m.lucro || 0;
      const dist = m.distribuicao || 0;
      const saidaRes = m.saidaReserva || 0;
      const saidaCaixa = m.saidaCaixaOperacional || 0;

      // Lucro final após imposto extra
      const lucroRealFinal = lucroBase - impExtra;
      
      // Fluxo de Saldo PJ: (Lucro Real Final - Distribuições - Saídas Operacionais)
      // Nota: Instrução pediu para subtrair saidaReserva também do acumulado PJ
      const saldoMensalPJ = lucroRealFinal - dist - saidaRes - saidaCaixa;
      
      acumuladoReservaTotal += (reserva - saidaRes);
      acumuladoReceitaTotal += m.receita;
      acumuladoLucroTotal += lucroRealFinal;
      acumuladoSaldoPJ += saldoMensalPJ;
      totalImpostosAno += impTotal;
      totalSaidasReservaAno += saidaRes;
      
      return { 
        ...m, 
        sobra, 
        reserva, 
        lucro: lucroRealFinal, 
        impostoTotal: impTotal,
        distribuicao: dist,
        saldoAcumulado: acumuladoSaldoPJ,
        acumuladoReserva: acumuladoReservaTotal
      };
    });

    return { 
      rows, 
      acumuladoReserva: acumuladoReservaTotal, 
      acumuladoReceita: acumuladoReceitaTotal, 
      acumuladoLucro: acumuladoLucroTotal,
      acumuladoSaldoPJ,
      totalImpostosAno,
      totalSaidasReservaAno
    };
  }, [monthlyData, businessData.ramo]);

  const metaTotal = (custos + dasValue + prolabore) * mesesReserva;
  const progressoMeta = Math.min(100, (totals.acumuladoReserva / metaTotal) * 100);
  const percentualLimite = Math.min(100, (totals.acumuladoReceita / 81000) * 100);

  const quarterlyTotals = useMemo(() => {
    const quarters = [0, 0, 0, 0];
    totals.rows.forEach((row, i) => {
      const q = Math.floor(i / 3);
      quarters[q] += row.lucro || 0;
    });
    return quarters;
  }, [totals]);

  const qProfit = quarterlyTotals[selectedQuarter];
  const qProfitPF_Manual = Math.round((qProfit * distribuicaoLucroPct) / 100);
  const qProfitPJ_Manual = qProfit - qProfitPF_Manual;

  const handleRegisterDistribution = () => {
    const lastMonthOfQuarter = selectedQuarter * 3 + 2;
    const newData = [...monthlyData];
    const currentDist = newData[lastMonthOfQuarter].distribuicao || 0;
    newData[lastMonthOfQuarter] = {
      ...newData[lastMonthOfQuarter],
      distribuicao: currentDist + qProfitPF_Manual,
    };
    setMonthlyData(newData);
    addLogEntry({
      actionType: 'distribution',
      description: `Distribuição do ${selectedQuarter + 1}º trimestre: R$ ${formatCurrency(qProfitPF_Manual)} registrada em ${MESES[lastMonthOfQuarter]}.`,
      amount: qProfitPF_Manual,
      monthIndex: lastMonthOfQuarter
    });
    toast({ title: "Distribuição registrada!" });
  };

  const formatInputCurrency = (val: number) => {
    return `R$ ${val.toLocaleString('pt-BR')}`;
  };

  const parseInputCurrency = (val: string) => {
    const numeric = val.replace(/\D/g, '');
    return parseFloat(numeric) || 0;
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 pb-16">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <Card className="border-primary/20 bg-primary/5 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-5"><Landmark className="w-32 h-32" /></div>
            <CardContent className="p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
              <div className="space-y-2 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-3 text-primary">
                  <div className="flex items-center gap-2">
                    <RefreshCw className={cn("w-5 h-5", isSyncing && "animate-spin")} />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Automação Bancária</span>
                  </div>
                  {isBankConnected && connectedBankName && (
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-primary/20 text-primary border-primary/20 text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5">
                        Conectado: {connectedBankName} <CheckCircle2 className="ml-1 w-3 h-3 inline" />
                      </Badge>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-muted-foreground hover:text-destructive transition-colors"
                              onClick={() => {
                                if (confirm("Desconectar conta bancária? Isso não afetará os dados já importados.")) {
                                  setIsBankConnected(false);
                                  setConnectedBankName("");
                                  localStorage.removeItem("mei-flow-bank-connected");
                                  localStorage.removeItem("mei-flow-connected-bank-name");
                                  toast({ title: "Conta desconectada" });
                                }
                              }}
                            >
                              <Unlink className="h-3.5 w-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="top">Desconectar conta</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  )}
                </div>
                <h3 className="text-xl font-bold tracking-tight">
                  {isBankConnected ? "Sincronização em Tempo Real" : "Importação Automática via Open Banking"}
                </h3>
                <p className="text-xs text-muted-foreground font-medium max-w-sm">
                  {isBankConnected 
                    ? `Sua conta ${connectedBankName} está vinculada.`
                    : "Conecte sua conta PJ via Open Banking para importar transações."}
                </p>
              </div>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="relative">
                      <Button 
                        onClick={syncBank} 
                        disabled={isSyncing} 
                        className="rounded-xl h-12 px-8 font-black uppercase tracking-widest text-[10px] gap-2 shadow-xl shadow-primary/20"
                      >
                        {isSyncing ? "Sincronizando..." : (isBankConnected ? "SINCRONIZAR AGORA" : "CONECTAR CONTA PJ")}
                        {pendingTransactions.length > 0 && isBankConnected && !isSyncing && (
                          <Badge className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-[8px] h-4 min-w-4 flex items-center justify-center border-2 border-background px-1">
                            {pendingTransactions.length}
                          </Badge>
                        )}
                      </Button>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top">Busca novas movimentações no seu banco.</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-4">
          <Card className="h-full border-border/50 bg-card/60 backdrop-blur-sm overflow-hidden transition-all duration-300">
            <CardHeader className="pb-3 px-5 pt-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 cursor-pointer group" onClick={() => setIsPendingExpanded(!isPendingExpanded)}>
                  <div className="p-1.5 bg-primary/10 rounded-lg text-primary"><History className="w-4 h-4" /></div>
                  <CardTitle className="text-sm font-bold flex items-center gap-2">Pendências <Badge variant="secondary" className="text-[10px] font-black px-1.5 h-4 bg-primary/10 text-primary">{pendingTransactions.length}</Badge></CardTitle>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground" onClick={() => setIsPendingExpanded(!isPendingExpanded)}>{isPendingExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}</Button>
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="space-y-2">
                <div className={cn("overflow-y-auto space-y-2 no-scrollbar transition-all", isPendingExpanded ? "max-h-[300px]" : "max-h-[160px]")}>
                  {pendingTransactions.length === 0 ? <div className="py-10 text-center text-[10px] font-bold text-muted-foreground uppercase opacity-40">Tudo em ordem!</div> : (isPendingExpanded ? pendingTransactions : pendingTransactions.slice(0, 3)).map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between p-2.5 rounded-xl bg-background border border-border/50 group hover:border-primary/30 transition-all">
                      <div className="min-w-0 flex-1">
                        <div className="text-[10px] font-bold truncate pr-2 uppercase">{tx.description}</div>
                        <div className={cn("text-[10px] font-black mt-0.5", tx.type === "CREDIT" ? "text-primary" : "text-orange-500")}>{tx.type === "CREDIT" ? "+" : "-"}{formatCurrency(Math.abs(tx.amount))}</div>
                      </div>
                      <Button size="icon" variant="ghost" onClick={() => importTransaction(tx)} className="h-8 w-8 rounded-full hover:bg-primary/20 text-primary shrink-0"><PlusCircle className="w-4 h-4" /></Button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4 space-y-3">
            <div className="flex justify-between items-start">
              <div className="p-2 bg-primary/10 rounded-lg text-primary"><ShieldCheck className="w-5 h-5" /></div>
              <TooltipProvider><Tooltip><TooltipTrigger asChild><div className="cursor-help"><Info className="w-3.5 h-3.5 text-muted-foreground opacity-50" /></div></TooltipTrigger>
              <TooltipContent><p className="text-[10px]">Reservas Acumuladas - Saídas: {formatCurrency(totals.totalSaidasReservaAno)}</p></TooltipContent></Tooltip></TooltipProvider>
            </div>
            <div>
              <div className="text-[10px] font-black text-primary uppercase tracking-widest">Colchão de Segurança</div>
              <div className="text-2xl font-bold mt-1">{formatCurrency(totals.acumuladoReserva)}</div>
              <div className="text-[9px] font-bold text-muted-foreground mt-1 uppercase">Meta {mesesReserva} Meses: {formatCurrency(metaTotal)}</div>
            </div>
            <Progress value={progressoMeta} className="h-1.5" />
          </CardContent>
        </Card>

        <Card className="bg-emerald-500/5 border-emerald-500/20">
          <CardContent className="p-4 space-y-3">
            <div className="flex justify-between items-start">
              <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500"><Banknote className="w-5 h-5" /></div>
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[8px] font-black">LIQUIDEZ PJ</Badge>
            </div>
            <div>
              <div className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Caixa PJ Operacional</div>
              <div className="text-2xl font-bold mt-1 text-emerald-500">{formatCurrency(totals.acumuladoSaldoPJ)}</div>
              <div className="text-[9px] font-bold text-muted-foreground mt-1 uppercase">Saldo retido após todas as saídas</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-amber-500/5 border-amber-500/20">
          <CardContent className="p-4 space-y-3">
            <div className="flex justify-between items-start">
              <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500"><Receipt className="w-5 h-5" /></div>
              <TooltipProvider><Tooltip><TooltipTrigger asChild><div className="cursor-help"><Info className="w-3.5 h-3.5 text-muted-foreground opacity-50" /></div></TooltipTrigger>
              <TooltipContent><p className="text-[10px]">Inclui DAS dinâmico + impostos extras manuais.</p></TooltipContent></Tooltip></TooltipProvider>
            </div>
            <div>
              <div className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Impostos Pagos</div>
              <div className="text-2xl font-bold mt-1 text-amber-500">{formatCurrency(totals.totalImpostosAno)}</div>
              <div className="text-[9px] font-bold text-muted-foreground mt-1 uppercase">Carga tributária total no ano</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-indigo-500/5 border-indigo-500/20">
          <CardContent className="p-4 space-y-3">
            <div className="flex justify-between items-start">
              <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-500"><TrendingUp className="w-5 h-5" /></div>
              <Badge variant="outline" className="bg-indigo-500/10 text-indigo-500 border-indigo-500/20 text-[8px] font-black">{percentualLimite.toFixed(1)}% DO TETO</Badge>
            </div>
            <div>
              <div className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Faturamento Acumulado</div>
              <div className="text-2xl font-bold mt-1 text-indigo-500">{formatCurrency(totals.acumuladoReceita)}</div>
              <div className="text-[9px] font-bold text-muted-foreground mt-1 uppercase">Restante para teto: {formatCurrency(81000 - totals.acumuladoReceita)}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden border-border/50 shadow-xl">
        <CardHeader className="flex flex-col lg:flex-row lg:items-center justify-between bg-card pb-4 gap-4 px-6 pt-6 border-b">
          <div className="flex flex-col gap-2">
            <CardTitle className="text-lg flex items-center gap-2"><BookOpen className="w-5 h-5 text-primary" />Livro de Caixa</CardTitle>
            {/* Bloco de Scroll Tip */}
            <div className="flex md:hidden items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full w-fit animate-pulse">
              <ArrowRight className="w-3 h-3 text-primary" />
              <span className="text-[9px] font-black text-primary uppercase">Deslize para ver todas as colunas →</span>
            </div>
          </div>
          <div className="flex items-center gap-4 p-2 bg-secondary/30 rounded-xl border border-border/50">
            <div className="space-y-1 px-3 border-r">
              <div className="text-[9px] font-black uppercase text-muted-foreground">Meta Reserva</div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-5 w-5 hover:bg-primary/20 text-primary" onClick={() => setMesesReserva(Math.max(1, mesesReserva - 1))}><ChevronDown className="w-3 h-3" /></Button>
                <span className="text-xs font-black">{mesesReserva}m</span>
                <Button variant="ghost" size="icon" className="h-5 w-5 hover:bg-primary/20 text-primary" onClick={() => setMesesReserva(Math.min(24, mesesReserva + 1))}><ChevronUp className="w-3 h-3" /></Button>
              </div>
            </div>
            <div className="space-y-1 px-3">
              <div className="text-[9px] font-black uppercase text-muted-foreground">Parâmetros Atuais</div>
              <div className="text-[10px] font-bold flex gap-3">
                <span className="text-blue-500">S: {formatCurrency(prolabore)}</span>
                <span className="text-purple-500">R: {reservaPct}%</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto no-scrollbar pb-6">
            <Table className="min-w-[2200px] border-collapse">
              <TableHeader className="bg-secondary/30">
                <TableRow className="hover:bg-transparent border-b">
                  <TableHead className="w-[60px] font-bold text-[10px] uppercase text-center border-r">Ativo</TableHead>
                  <TableHead className="w-[100px] font-bold text-[10px] uppercase border-r text-center">Mês</TableHead>
                  <TableHead className="w-[160px] font-bold text-[10px] uppercase px-4 text-indigo-500">Receita Bruta</TableHead>
                  <TableHead className="w-[160px] font-bold text-[10px] uppercase px-4 text-orange-500">Custos Op.</TableHead>
                  <TableHead className="w-[120px] font-bold text-[10px] uppercase px-4 text-amber-500">Imposto (DAS)</TableHead>
                  <TableHead className="w-[120px] font-bold text-[10px] uppercase px-4 text-amber-600">Extra (Imp)</TableHead>
                  <TableHead className="w-[130px] text-right font-bold text-[10px] uppercase px-4">Sobra</TableHead>
                  <TableHead className="w-[130px] text-right font-bold text-[10px] uppercase text-purple-500 px-4">Reserva PJ</TableHead>
                  <TableHead className="w-[120px] text-right font-bold text-[10px] uppercase text-red-400 px-4">Saída Reserva</TableHead>
                  <TableHead className="w-[130px] text-right font-bold text-[10px] uppercase text-amber-500 px-4">Lucro Real</TableHead>
                  <TableHead className="w-[130px] text-right font-bold text-[10px] uppercase text-red-500 px-4">Distribuição</TableHead>
                  <TableHead className="w-[130px] text-right font-bold text-[10px] uppercase text-emerald-600 px-4">Saída Caixa Op.</TableHead>
                  <TableHead className="w-[150px] text-right font-bold text-[10px] uppercase text-emerald-500 px-4 font-black bg-emerald-500/5">Saldo Acumulado</TableHead>
                  <TableHead className="w-[180px] text-right font-bold text-[10px] uppercase px-4 opacity-30 italic">Ref. Snapshot</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {totals.rows.map((row, i) => (
                  <TableRow key={i} className={cn("transition-all duration-300", highlightedMonth === i && "bg-primary/20 shadow-inner ring-2 ring-primary/50", !row.active && "opacity-20 grayscale")}>
                    <TableCell className="py-3 text-center border-r"><Switch checked={row.active} onCheckedChange={(c) => updateMonth(i, 'active', c)} className="scale-90" /></TableCell>
                    <TableCell className="font-bold text-xs py-3 border-r text-center bg-card">{MESES[i]}</TableCell>
                    <TableCell className="py-2 px-4">
                      <Input type="text" disabled={!row.active} value={formatInputCurrency(row.receita)} onChange={(e) => updateMonth(i, 'receita', parseInputCurrency(e.target.value))} className="h-9 text-xs font-bold text-indigo-500" />
                    </TableCell>
                    <TableCell className="py-2 px-4">
                      <Input type="text" disabled={!row.active} value={formatInputCurrency(row.custos)} onChange={(e) => updateMonth(i, 'custos', parseInputCurrency(e.target.value))} className="h-9 text-xs font-bold text-orange-500" />
                    </TableCell>
                    <TableCell className="py-2 px-4 font-bold text-amber-500 text-xs text-center">{formatCurrency(calculateDasValue(businessData.ramo))}</TableCell>
                    <TableCell className="py-2 px-4">
                      <Input type="text" disabled={!row.active} value={formatInputCurrency(row.impostoExtra || 0)} onChange={(e) => updateMonth(i, 'impostoExtra', parseInputCurrency(e.target.value))} className="h-9 text-xs font-bold text-amber-600" />
                    </TableCell>
                    <TableCell className="text-right text-xs font-medium px-4">{formatCurrency(row.sobra || 0)}</TableCell>
                    <TableCell className="text-right text-xs font-bold text-purple-500 px-4">{formatCurrency(row.reserva || 0)}</TableCell>
                    <TableCell className="py-2 px-4">
                      <Input type="text" disabled={!row.active} value={formatInputCurrency(row.saidaReserva || 0)} onChange={(e) => updateMonth(i, 'saidaReserva', parseInputCurrency(e.target.value))} className="h-9 text-xs font-bold text-red-400 text-right" />
                    </TableCell>
                    <TableCell className="text-right text-sm font-black text-amber-500 px-4">{formatCurrency(row.lucro || 0)}</TableCell>
                    <TableCell className="text-right text-xs font-bold text-red-500 px-4">{formatCurrency(row.distribuicao || 0)}</TableCell>
                    <TableCell className="py-2 px-4">
                      <Input type="text" disabled={!row.active} value={formatInputCurrency(row.saidaCaixaOperacional || 0)} onChange={(e) => updateMonth(i, 'saidaCaixaOperacional', parseInputCurrency(e.target.value))} className="h-9 text-xs font-bold text-emerald-600 text-right" />
                    </TableCell>
                    <TableCell className="text-right text-xs font-black text-emerald-500 px-4 bg-emerald-500/5">{formatCurrency(row.saldoAcumulado || 0)}</TableCell>
                    <TableCell className="text-right text-[10px] font-medium text-muted-foreground px-4 opacity-30 italic">
                      {row.prolabore_usado ? `S: ${formatCurrency(row.prolabore_usado)} | R: ${row.reservaPct_usado}%` : "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <section className="relative p-1 rounded-[40px] bg-gradient-to-br from-primary/10 via-border/40 to-indigo-500/5 shadow-2xl">
        <div className="bg-card/40 backdrop-blur-xl rounded-[39px] p-8 md:p-10 space-y-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border/50 pb-8">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20"><Zap className="w-7 h-7" /></div>
              <div className="space-y-1">
                <div className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/70">Ciclo de Riqueza Trimestral</div>
                <h4 className="text-2xl md:text-3xl font-black tracking-tighter">Gestão de <span className="text-primary italic">90 Dias</span></h4>
              </div>
            </div>
            <div className="flex flex-nowrap overflow-x-auto no-scrollbar gap-2 p-1.5 bg-background/50 rounded-2xl border border-border/50">
              {["1º T", "2º T", "3º T", "4º T"].map((t, i) => (
                <Button key={i} variant={selectedQuarter === i ? "default" : "ghost"} onClick={() => setSelectedQuarter(i)} className={cn("rounded-xl font-bold h-12 px-5 transition-all text-[11px] uppercase tracking-wider flex flex-col gap-0.5 shrink-0", selectedQuarter === i && "shadow-lg shadow-primary/20 scale-105")}>
                  <span>{t}</span>
                  <span className={cn("text-[9px] font-black", selectedQuarter === i ? "text-primary-foreground/70" : "text-primary")}>{formatCurrency(quarterlyTotals[i] || 0)}</span>
                </Button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="p-8 rounded-[32px] bg-secondary/20 border border-border/50 space-y-8 relative overflow-hidden">
              <div className="space-y-2 relative z-10">
                <div className="text-[10px] font-black uppercase text-primary/70 tracking-widest">Lucro Total do Ciclo</div>
                <div className="text-5xl font-black tracking-tighter tabular-nums">{formatCurrency(qProfit)}</div>
              </div>
              <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 flex gap-3 items-start relative z-10">
                <Activity className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <p className="text-[11px] text-primary/80 leading-relaxed font-medium italic">Recomendação IA (Meta {distribuicaoLucroPct}%): Transferir {formatCurrency(Math.round((qProfit * distribuicaoLucroPct)/100))} para o seu CPF.</p>
              </div>
            </div>

            <Card className="bg-background/30 border-2 border-dashed border-border/60 rounded-[32px] p-8 space-y-10 flex flex-col">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3"><div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-500 border border-indigo-500/20"><Scale className="w-5 h-5" /></div><h5 className="font-black text-xs uppercase tracking-widest">Ajuste de Alocação</h5></div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleRegisterDistribution}
                  className="rounded-full h-8 px-4 text-[9px] font-black uppercase tracking-widest gap-2 bg-primary/5 border-primary/20 text-primary hover:bg-primary/20"
                >
                  <Save className="w-3 h-3" />
                  Registrar
                </Button>
              </div>
              <div className="space-y-6 flex-1 flex flex-col justify-center">
                <div className="flex justify-between items-end mb-2">
                  <div className="space-y-1"><span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">PF (CPF)</span><div className="text-3xl font-black">{distribuicaoLucroPct}%</div></div>
                  <div className="space-y-1 text-right"><span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">MANTER/RETER PJ (CNPJ)</span><div className="text-3xl font-black">{100 - distribuicaoLucroPct}%</div></div>
                </div>
                <Slider value={[distribuicaoLucroPct]} min={0} max={100} step={5} onValueChange={([v]) => setDistribuicaoLucroPct(v)} className="py-4" />
                <div className="grid grid-cols-2 gap-6 pt-6 border-t border-border/50">
                  <div className="space-y-1"><div className="text-[9px] font-black uppercase text-muted-foreground">Transferir</div><div className="text-2xl font-black text-blue-400">{formatCurrency(qProfitPF_Manual)}</div></div>
                  <div className="space-y-1 text-right"><div className="text-[9px] font-black uppercase text-muted-foreground">Manter/Reter</div><div className="text-2xl font-black text-muted-foreground">{formatCurrency(qProfitPJ_Manual)}</div></div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="activity-log" className="border rounded-2xl bg-card/40 shadow-sm overflow-hidden">
          <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-secondary/20 transition-all">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg text-primary"><History className="w-4 h-4" /></div>
              <div className="text-left"><span className="text-sm font-black uppercase tracking-widest">Histórico de Movimentações</span></div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6 pt-2">
            <div className="space-y-3 max-h-80 overflow-y-auto pr-2 no-scrollbar">
              {activityLog.length === 0 ? <div className="py-12 text-center text-[10px] font-black uppercase text-muted-foreground opacity-30">Sem registros</div> : activityLog.map((entry) => (
                <div key={entry.id} className="p-4 rounded-xl bg-background border border-border/50 flex flex-col gap-2 group hover:border-primary/30">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="text-[10px] font-black text-muted-foreground uppercase">{new Date(entry.timestamp).toLocaleString('pt-BR')}</div>
                      <p className="text-xs font-bold text-foreground/90 leading-tight">{entry.description}</p>
                    </div>
                    <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest border-primary/20 text-primary">
                      {entry.actionType === 'import' ? 'Importação' : entry.actionType === 'manual_edit' ? 'Edição' : entry.actionType === 'month_toggle' ? 'Status' : entry.actionType === 'distribution' ? 'Distribuição' : 'Limpeza'}
                    </Badge>
                  </div>
                  {entry.amount !== undefined && entry.amount !== 0 && (
                    <div className={cn("text-right text-[11px] font-black tabular-nums", entry.amount > 0 ? "text-primary" : "text-orange-500")}>
                      {entry.amount > 0 ? '+' : ''}{formatCurrency(entry.amount)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <section className="space-y-6 pt-6">
        <div className="flex items-center gap-3 px-1"><div className="p-2.5 bg-primary/10 rounded-xl text-primary shadow-inner"><HelpCircle className="w-6 h-6" /></div><div><h3 className="font-headline font-bold text-xl tracking-tight">FAQ de Gestão</h3></div></div>
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

      <style jsx global>{` .no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; } `}</style>
    </div>
  );
}
