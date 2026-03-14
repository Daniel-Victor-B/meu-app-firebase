
"use client"

import { useState, useMemo, useEffect, useCallback } from "react";
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
  Trash2,
  History
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

type ActivityLogEntry = {
  id: string;
  timestamp: number;
  actionType: 'import' | 'manual_edit' | 'month_toggle' | 'clear_history' | 'clear_log';
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
  // Inicialização de estados usando lazy loading para evitar flash de estado vazio e problemas de hidratação
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
    } catch (e) {
      return new Set();
    }
  });

  const [pendingTransactions, setPendingTransactions] = useState<BankTransaction[]>(() => {
    if (typeof window === "undefined") return [];
    const saved = localStorage.getItem("mei-flow-pending-txs");
    if (!saved) return [];
    try {
      return JSON.parse(saved);
    } catch (e) {
      return [];
    }
  });

  const [activityLog, setActivityLog] = useState<ActivityLogEntry[]>(() => {
    if (typeof window === "undefined") return [];
    const saved = localStorage.getItem("mei-flow-activity-log");
    if (!saved) return [];
    try {
      return JSON.parse(saved);
    } catch (e) {
      return [];
    }
  });

  const [isSyncing, setIsSyncing] = useState(false);
  const [highlightedMonth, setHighlightedMonth] = useState<number | null>(null);
  const [isPendingExpanded, setIsPendingExpanded] = useState(false);
  
  const das = 76;

  // Persistência de alterações de estado
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
      newData[index] = { ...newData[index], active: isActivating };
      addLogEntry({
        actionType: 'month_toggle',
        description: `${MESES[index]} ${isActivating ? 'ativado' : 'desativado'}`,
        monthIndex: index
      });
    } else {
      const newValue = parseFloat(value) || 0;
      if (oldValue !== newValue) {
        newData[index] = { ...newData[index], [field]: newValue };
        addLogEntry({
          actionType: 'manual_edit',
          description: `Alteração em ${MESES[index]}: ${field === 'receita' ? 'Receita' : 'Custo'} de ${formatCurrency(oldValue as number)} para ${formatCurrency(newValue)}`,
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
        toast({ title: "Banco Conectado", description: "Sua conta PJ foi vinculada com sucesso." });
      }

      const newTransactions = data.transactions.filter((tx: BankTransaction) => !importedIds.has(tx.id));
      
      setPendingTransactions(prev => {
        const combined = [...prev, ...newTransactions];
        return combined.filter((tx, index, self) => 
          index === self.findIndex(t => t.id === tx.id)
        );
      });

      const alreadyImportedCount = data.transactions.length - newTransactions.length;
      toast({
        title: "Sincronização Concluída",
        description: alreadyImportedCount > 0 
          ? `${newTransactions.length} novas transações encontradas (${alreadyImportedCount} já ignoradas).` 
          : `${newTransactions.length} novas transações encontradas.`
      });
    } catch (error) {
      toast({ title: "Erro na Sincronização", description: "Não foi possível buscar os dados do banco.", variant: "destructive" });
    } finally {
      setIsSyncing(false);
    }
  };

  const importTransaction = (tx: BankTransaction) => {
    const currentMonthIndex = new Date().getMonth();
    const newData = [...monthlyData];
    
    if (!newData[currentMonthIndex].active) {
      newData[currentMonthIndex] = { ...newData[currentMonthIndex], active: true };
      toast({
        title: "Mês ativado automaticamente",
        description: `O mês de ${MESES[currentMonthIndex]} foi ativado para receber as transações importadas.`,
      });
    }
    
    if (tx.type === "CREDIT") newData[currentMonthIndex].receita += tx.amount;
    else newData[currentMonthIndex].custos += Math.abs(tx.amount);
    
    setMonthlyData(newData);
    
    // Histórico de importações (Set para evitar duplicatas)
    const nextImported = new Set(importedIds);
    nextImported.add(tx.id);
    setImportedIds(nextImported);
    localStorage.setItem("mei-flow-imported-ids", JSON.stringify(Array.from(nextImported)));

    // Limpa das pendências
    setPendingTransactions(prev => prev.filter(t => t.id !== tx.id));
    
    addLogEntry({
      actionType: 'import',
      description: `Importação de ${formatCurrency(Math.abs(tx.amount))} de '${tx.description}' para ${MESES[currentMonthIndex]}`,
      monthIndex: currentMonthIndex,
      amount: tx.amount
    });

    toast({ title: "Transação Importada", description: `${tx.description} adicionada ao mês de ${MESES[currentMonthIndex]}.` });

    setHighlightedMonth(currentMonthIndex);
    setTimeout(() => setHighlightedMonth(null), 1500);
  };

  const clearImportHistory = () => {
    if (confirm("Limpar o histórico permitirá que transações já importadas sejam reimportadas na próxima sincronização. Deseja continuar?")) {
      setImportedIds(new Set());
      localStorage.removeItem("mei-flow-imported-ids");
      addLogEntry({
        actionType: 'clear_history',
        description: 'Histórico de importações limpo pelo usuário'
      });
      toast({ title: "Histórico Limpo", description: "As próximas sincronizações trarão todas as transações como novas." });
    }
  };

  const totals = useMemo(() => {
    let acumuladoReservaTotal = 0;
    let acumuladoReceitaTotal = 0;
    let acumuladoLucroTotal = 0;

    const rows = monthlyData.map((m) => {
      if (!m.active) return { ...m, sobra: 0, reserva: 0, lucro: 0, acumuladoReserva: acumuladoReservaTotal, acumuladoLucro: acumuladoLucroTotal };
      const sobra = Math.max(0, m.receita - m.custos - das - prolabore);
      const reserva = Math.round((sobra * reservaPct) / 100);
      const lucro = sobra - reserva;
      acumuladoReservaTotal += reserva;
      acumuladoReceitaTotal += m.receita;
      acumuladoLucroTotal += lucro;
      return { ...m, sobra, reserva, lucro, acumuladoReserva: acumuladoReservaTotal, acumuladoLucro: acumuladoLucroTotal };
    });

    return { rows, acumuladoReserva: acumuladoReservaTotal, acumuladoReceita: acumuladoReceitaTotal, acumuladoLucro: acumuladoLucroTotal };
  }, [monthlyData, das, prolabore, reservaPct]);

  const metaTotal = (custos + das + prolabore) * mesesReserva;
  const progressoMeta = Math.min(100, (totals.acumuladoReserva / metaTotal) * 100);
  const LIMITE_MEI = 81000;
  const percentualLimite = Math.min(100, (totals.acumuladoReceita / LIMITE_MEI) * 100);

  const displayedTransactions = isPendingExpanded ? pendingTransactions : pendingTransactions.slice(0, 3);

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
                    <Badge variant="outline" className="bg-primary/20 text-primary border-primary/20 text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 animate-in zoom-in duration-300">
                      Conectado a: {connectedBankName}
                    </Badge>
                  )}
                </div>
                <h3 className="text-xl font-bold tracking-tight">Sincronize seu Fluxo de Caixa</h3>
                <p className="text-xs text-muted-foreground font-medium max-w-sm">
                  Conecte sua conta PJ via Open Banking para importar transações automaticamente. Nós apenas lemos os dados para automatizar o preenchimento da sua planilha.
                </p>
              </div>
              <Button onClick={syncBank} disabled={isSyncing} className="rounded-xl h-12 px-8 font-black uppercase tracking-widest text-[10px] gap-2 shadow-xl shadow-primary/20">
                {isSyncing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                {isBankConnected ? "Sincronizar Agora" : "Conectar Conta PJ"}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-4">
          <Card className="h-full border-border/50 bg-card/60 backdrop-blur-sm overflow-hidden transition-all duration-300">
            <CardHeader className="pb-3 px-5 pt-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 cursor-pointer group" onClick={() => setIsPendingExpanded(!isPendingExpanded)}>
                  <TooltipProvider><Tooltip><TooltipTrigger asChild><div className="p-1.5 bg-primary/10 rounded-lg text-primary group-hover:bg-primary/20 transition-colors"><History className="w-4 h-4" /></div></TooltipTrigger><TooltipContent side="top"><p className="text-[10px] font-bold">Transações pendentes</p></TooltipContent></Tooltip></TooltipProvider>
                  <CardTitle className="text-sm font-bold flex items-center gap-2">Pendências <Badge variant="secondary" className="text-[10px] font-black px-1.5 h-4 bg-primary/10 text-primary border-none">{pendingTransactions.length}</Badge></CardTitle>
                </div>
                <div className="flex items-center gap-1">
                  <TooltipProvider><Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={clearImportHistory}><Trash2 className="h-3.5 w-3.5" /></Button></TooltipTrigger><TooltipContent side="top"><p className="text-[10px] font-bold">Limpar histórico de importações</p></TooltipContent></Tooltip></TooltipProvider>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground" onClick={() => setIsPendingExpanded(!isPendingExpanded)}>{isPendingExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}</Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="space-y-2">
                {!monthlyData[new Date().getMonth()]?.active && pendingTransactions.length > 0 && <div className="px-3 py-2 mb-2 text-[9px] font-bold text-amber-500 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-center gap-2 animate-pulse"><AlertCircle className="w-3 h-3 shrink-0" /> Mês atual inativo.</div>}
                <div className={cn("overflow-y-auto space-y-2 no-scrollbar transition-all duration-500", isPendingExpanded ? "max-h-[300px]" : "max-h-[160px]")}>
                  {pendingTransactions.length === 0 ? <div className="py-10 text-center text-[10px] font-bold text-muted-foreground uppercase opacity-40">Tudo conciliado!</div> : displayedTransactions.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between p-2.5 rounded-xl bg-background border border-border/50 group hover:border-primary/30 transition-all">
                      <div className="min-w-0 flex-1">
                        <div className="text-[10px] font-bold truncate pr-2 uppercase text-foreground/80">{tx.description}</div>
                        <div className={cn("text-[10px] font-black mt-0.5", tx.type === "CREDIT" ? "text-primary" : "text-orange-500")}>{tx.type === "CREDIT" ? "+" : "-"}{formatCurrency(Math.abs(tx.amount))}</div>
                      </div>
                      <TooltipProvider><Tooltip><TooltipTrigger asChild><Button size="icon" variant="ghost" onClick={() => importTransaction(tx)} className="h-8 w-8 rounded-full hover:bg-primary/20 text-primary shrink-0"><PlusCircle className="w-4 h-4" /></Button></TooltipTrigger><TooltipContent side="top" className="bg-popover border-border text-foreground"><p className="text-[10px] font-bold">Importar para o mês atual</p></TooltipContent></Tooltip></TooltipProvider>
                    </div>
                  ))}
                </div>
                {pendingTransactions.length > 3 && <Button variant="ghost" size="sm" onClick={() => setIsPendingExpanded(!isPendingExpanded)} className="w-full text-[9px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary h-7 border border-dashed border-border/50 mt-1">{isPendingExpanded ? "Recolher Lista" : `Ver todas (${pendingTransactions.length})`}</Button>}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card className="bg-primary/5 border-primary/20 shadow-md">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <div className="flex items-center gap-2 text-primary"><ShieldCheck className="w-5 h-5" /><CardTitle className="text-sm font-bold uppercase tracking-wider">Colchão de Segurança</CardTitle></div>
            <div className="flex items-center gap-2 bg-background/50 px-2 py-1 rounded-lg border border-primary/20 shadow-sm"><span className="text-[10px] font-black text-primary uppercase leading-none">Meta:</span><div className="flex items-center gap-1"><Button variant="ghost" size="icon" className="h-5 w-5 rounded-md hover:bg-primary/20 text-primary" onClick={() => setMesesReserva(Math.max(1, mesesReserva - 1))}><ChevronDown className="w-3 h-3" /></Button><span className="text-xs font-black w-4 text-center text-primary leading-none">{mesesReserva}</span><Button variant="ghost" size="icon" className="h-5 w-5 rounded-md hover:bg-primary/20 text-primary" onClick={() => setMesesReserva(Math.min(24, mesesReserva + 1))}><ChevronUp className="w-3 h-3" /></Button></div><span className="text-[8px] font-bold text-muted-foreground uppercase leading-none">meses</span></div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-end"><div><div className="text-2xl font-bold">{formatCurrency(totals.acumuladoReserva)}</div><div className="text-[10px] text-muted-foreground uppercase font-bold mt-1">Acumulado na Reserva</div></div><div className="text-right"><div className="text-lg font-bold text-muted-foreground">{formatCurrency(metaTotal)}</div><div className="text-[10px] text-muted-foreground uppercase font-bold mt-1">Alvo para {mesesReserva} meses</div></div></div>
            <div className="space-y-2"><div className="flex justify-between text-[10px] font-bold"><span>PROGRESSO DA RESERVA</span><span>{progressoMeta.toFixed(1)}%</span></div><Progress value={progressoMeta} className="h-2" /></div>
          </CardContent>
        </Card>
        <Card className="bg-secondary/20 border-border/60 border-2 relative overflow-hidden group">
          <CardHeader className="pb-2"><div className="flex items-center gap-2 text-foreground"><Settings2 className="w-5 h-5 text-primary" /><div><CardTitle className="text-sm font-bold uppercase tracking-wider">Parâmetros de Gestão</CardTitle><CardDescription className="text-[10px] uppercase font-bold text-muted-foreground">Configurações globais</CardDescription></div></div></CardHeader>
          <CardContent><div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><div className="space-y-2"><div className="flex items-center gap-1.5 text-[10px] text-blue-500 font-black uppercase"><UserCircle className="w-3 h-3" />Salário PF</div><div className="flex items-center gap-2"><div className="flex flex-col -space-y-px"><Button variant="ghost" size="icon" className="h-4 w-6 rounded-t-md rounded-b-none border border-border hover:bg-secondary text-blue-500" onClick={() => setProlabore(prolabore + 100)}><ChevronUp className="w-3 h-3" /></Button><Button variant="ghost" size="icon" className="h-4 w-6 rounded-b-md rounded-t-none border border-border hover:bg-secondary text-blue-500" onClick={() => setProlabore(Math.max(0, prolabore - 100))}><ChevronDown className="w-3 h-3" /></Button></div><Input className="h-9 px-2 text-xs font-bold bg-background/80 border-blue-500/30" type="number" value={prolabore} onChange={(e) => setProlabore(parseFloat(e.target.value) || 0)} /></div></div><div className="space-y-2"><div className="flex items-center gap-1.5 text-[10px] text-purple-500 font-black uppercase"><Percent className="w-3 h-3" />Reserva PJ (%)</div><div className="flex items-center gap-2"><div className="flex flex-col -space-y-px"><Button variant="ghost" size="icon" className="h-4 w-6 rounded-t-md rounded-b-none border border-border hover:bg-secondary text-purple-500" onClick={() => setReservaPct(Math.min(100, reservaPct + 5))}><ChevronUp className="w-3 h-3" /></Button><Button variant="ghost" size="icon" className="h-4 w-6 rounded-b-md rounded-t-none border border-border hover:bg-secondary text-purple-500" onClick={() => setReservaPct(Math.max(0, reservaPct - 5))}><ChevronDown className="w-3 h-3" /></Button></div><Input className="h-9 px-2 text-xs font-bold bg-background/80 border-purple-500/30 text-right" type="number" value={reservaPct} onChange={(e) => setReservaPct(parseFloat(e.target.value) || 0)} /></div></div></div></CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden border-border/50 shadow-xl">
        <CardHeader className="flex flex-col lg:flex-row lg:items-center justify-between bg-card pb-4 gap-4 px-6 pt-6 border-b"><CardTitle className="text-lg flex items-center gap-2"><BookOpen className="w-5 h-5 text-primary" />Livro de Caixa Anual</CardTitle><div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-2xl"><div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20"><div className="text-[9px] font-bold text-muted-foreground uppercase leading-none mb-1">Acumulado</div><div className="text-lg font-bold text-indigo-500 leading-tight">{formatCurrency(totals.acumuladoReceita || 0)}</div><div className="flex items-center gap-1 mt-1 text-[8px] font-black uppercase text-indigo-500/70"><ShieldCheck className="w-2.5 h-2.5" />{percentualLimite.toFixed(1)}% do Teto</div></div><div className="p-3 bg-primary/10 rounded-xl border border-primary/20"><div className="text-[9px] font-bold text-muted-foreground uppercase leading-none mb-1">Lucro Acumulado</div><div className="text-lg font-bold text-primary leading-tight">{formatCurrency(totals.acumuladoLucro || 0)}</div></div><div className="p-3 bg-purple-500/10 rounded-xl border border-purple-500/20"><div className="text-[9px] font-bold text-muted-foreground uppercase leading-none mb-1">Patrimônio PJ</div><div className="text-lg font-bold text-purple-500 leading-tight">{formatCurrency(totals.acumuladoReserva || 0)}</div></div></div></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto no-scrollbar pb-6">
            <Table className="min-w-[1250px] border-collapse">
              <TableHeader className="bg-secondary/30">
                <TableRow className="hover:bg-transparent border-b bg-primary/10"><TableHead colSpan={9} className="h-12 py-0 text-center border-b border-primary/20"><div className="flex items-center justify-between px-8 text-[10px] font-bold uppercase tracking-[0.4em] text-primary/80"><div className="flex items-center gap-4"><ArrowLeftRight className="w-4 h-4" />Registro Mensal de Faturamento<ArrowLeftRight className="w-4 h-4" /></div></div></TableHead></TableRow>
                <TableRow className="hover:bg-transparent border-b"><TableHead className="w-[80px] font-bold text-[10px] uppercase text-center border-r bg-secondary/10">Ativo</TableHead><TableHead className="w-[120px] font-bold text-[10px] uppercase border-r text-center bg-secondary/10">Mês</TableHead><TableHead className="w-[180px] font-bold text-[10px] uppercase px-6 text-indigo-500 bg-indigo-500/5">Receita Bruta</TableHead><TableHead className="w-[180px] font-bold text-[10px] uppercase px-6 text-orange-500 bg-orange-500/5">Custos Op.</TableHead><TableHead className="w-[140px] text-right font-bold text-[10px] uppercase px-6">Sobra</TableHead><TableHead className="w-[140px] text-right font-bold text-[10px] uppercase text-purple-500 px-6">Reserva PJ</TableHead><TableHead className="w-[140px] text-right font-bold text-[10px] uppercase text-primary px-6">Lucro Real</TableHead><TableHead className="w-[180px] text-right font-bold text-[10px] uppercase px-6 opacity-30">Lucro Acum.</TableHead><TableHead className="w-[180px] text-right font-bold text-[10px] uppercase px-6 opacity-30">Reserva Acum.</TableHead></TableRow>
              </TableHeader>
              <TableBody>
                {totals.rows.map((row, i) => (
                  <TableRow key={i} className={cn("transition-all duration-300", highlightedMonth === i && "bg-primary/20 shadow-[inset_0_0_20px_rgba(34,197,94,0.1)] border-primary/50", !row.active ? "opacity-20 grayscale scale-[0.98]" : "hover:bg-primary/5")}>
                    <TableCell className="py-3 text-center border-r"><div className="flex justify-center"><Switch checked={row.active} onCheckedChange={(checked) => updateMonth(i, 'active', !!checked)} className="scale-90" /></div></TableCell>
                    <TableCell className="font-bold text-xs py-3 border-r text-center bg-card">{MESES[i]}</TableCell>
                    <TableCell className="py-2 px-6 bg-indigo-500/5"><Input type="number" disabled={!row.active} value={row.receita} onChange={(e) => updateMonth(i, 'receita', e.target.value)} className="h-10 text-xs font-bold text-indigo-500" /></TableCell>
                    <TableCell className="py-2 px-6 bg-orange-500/5"><Input type="number" disabled={!row.active} value={row.custos} onChange={(e) => updateMonth(i, 'custos', e.target.value)} className="h-10 text-xs font-bold text-orange-500" /></TableCell>
                    <TableCell className="text-right text-xs font-medium tabular-nums px-6 bg-secondary/10">{formatCurrency(row.sobra || 0)}</TableCell>
                    <TableCell className="text-right text-xs font-bold text-purple-500 tabular-nums px-6 bg-purple-500/5">{formatCurrency(row.reserva || 0)}</TableCell>
                    <TableCell className="text-right text-sm font-black text-primary tabular-nums px-6 bg-primary/5">{formatCurrency(row.lucro || 0)}</TableCell>
                    <TableCell className="text-right text-xs font-medium tabular-nums px-6 opacity-30">{formatCurrency(row.acumuladoLucro || 0)}</TableCell>
                    <TableCell className="text-right text-xs font-medium tabular-nums px-6 opacity-30">{formatCurrency(row.acumuladoReserva || 0)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Histórico de Movimentações (Activity Log) */}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="activity-log" className="border rounded-2xl bg-card/40 shadow-sm overflow-hidden">
          <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-secondary/20 transition-all">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <History className="w-4 h-4" />
              </div>
              <div className="text-left">
                <span className="text-sm font-black uppercase tracking-widest text-foreground">Histórico de Movimentações</span>
                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter mt-0.5">{activityLog.length} registros no log</p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6 pt-2">
            <div className="space-y-3 max-h-80 overflow-y-auto pr-2 no-scrollbar">
              {activityLog.length === 0 ? (
                <div className="py-12 text-center text-[10px] font-black uppercase text-muted-foreground opacity-30 tracking-[0.2em]">Sem movimentações registradas</div>
              ) : (
                activityLog.map((entry) => (
                  <div key={entry.id} className="p-4 rounded-xl bg-background border border-border/50 flex flex-col gap-2 group hover:border-primary/30 transition-all">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                          {new Date(entry.timestamp).toLocaleString('pt-BR')}
                        </div>
                        <p className="text-xs font-bold text-foreground/90 leading-tight">{entry.description}</p>
                      </div>
                      <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest border-primary/20 bg-primary/5 text-primary">
                        {entry.actionType === 'import' && 'Importação'}
                        {entry.actionType === 'manual_edit' && 'Edição'}
                        {entry.actionType === 'month_toggle' && 'Status'}
                        {entry.actionType === 'clear_history' && 'Limpeza'}
                        {entry.actionType === 'clear_log' && 'Reset'}
                      </Badge>
                    </div>
                    {entry.amount !== undefined && entry.amount !== 0 && (
                      <div className={cn("text-right text-[11px] font-black tabular-nums", entry.amount > 0 ? "text-primary" : "text-orange-500")}>
                        {entry.amount > 0 ? '+' : ''}{formatCurrency(entry.amount)}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
            {activityLog.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="mt-6 w-full text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-10 border border-dashed border-border/50 rounded-xl"
                onClick={() => {
                  if (confirm("Limpar todo o histórico de logs? Esta ação não pode ser desfeita.")) {
                    setActivityLog([]);
                    localStorage.removeItem("mei-flow-activity-log");
                    toast({ title: "Log Limpo", description: "O histórico de auditoria foi resetado." });
                  }
                }}
              >
                Limpar Log de Auditoria
              </Button>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <section className="space-y-6 pt-6">
        <div className="flex items-center gap-3 px-1"><div className="p-2.5 bg-primary/10 rounded-xl text-primary shadow-inner"><HelpCircle className="w-6 h-6" /></div><div><h3 className="font-headline font-bold text-xl tracking-tight">FAQ de Gestão</h3></div></div>
        <Accordion type="single" collapsible className="w-full space-y-3">{FAQS_PLANILHA.map((faq, idx) => (<AccordionItem key={idx} value={`faq-${idx}`} className="border rounded-2xl px-5 bg-card/40 shadow-sm hover:shadow-md transition-all hover:bg-card"><AccordionTrigger className="text-sm font-bold text-left hover:no-underline py-5 leading-relaxed group"><span className="group-hover:text-primary transition-colors">{faq.q}</span></AccordionTrigger><AccordionContent className="text-xs text-muted-foreground leading-relaxed pb-6 pt-2 font-medium"><div className="flex gap-4"><div className="w-1 h-full bg-primary/20 rounded-full shrink-0" />{faq.a}</div></AccordionContent></AccordionItem>))} </Accordion>
      </section>

      <style jsx global>{` .no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; } `}</style>
    </div>
  );
}
