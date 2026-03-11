
"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatPercent } from "@/lib/formatters";
import { 
  AlertCircle, 
  PenLine, 
  ChevronUp, 
  ChevronDown, 
  TrendingUp, 
  Scale, 
  UserCircle, 
  ShieldCheck, 
  Wallet, 
  Zap,
  Info,
  ArrowRight,
  Target
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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
    { label: "Faturamento", val: fat, color: "bg-indigo-500", text: "text-indigo-500", hidden: true, icon: <TrendingUp className="w-4 h-4" /> }, 
    { label: "Custos Operacionais", val: custos, color: "bg-orange-500", text: "text-orange-500", icon: <Scale className="w-4 h-4" /> },
    { label: "DAS (Imposto MEI)", val: das, color: "bg-red-500", text: "text-red-500", icon: <ShieldCheck className="w-4 h-4" /> },
    { label: "Pró-labore (Salário)", val: prolabore, color: "bg-blue-500", text: "text-blue-500", icon: <UserCircle className="w-4 h-4" /> },
    { label: "Reserva Empresa", val: reservaVal, color: "bg-purple-500", text: "text-purple-500", icon: <ShieldCheck className="w-4 h-4" /> },
    { label: "Lucro Disponível", val: lucroDisp, color: "bg-primary", text: "text-primary", icon: <Wallet className="w-4 h-4" /> },
  ];

  const displayItems = items.filter(i => !i.hidden);

  const StepButtons = ({ onUp, onDown, colorClass }: { onUp: () => void, onDown: () => void, colorClass: string }) => (
    <div className="flex flex-col -space-y-px">
      <Button 
        variant="ghost" 
        size="icon" 
        className={cn("h-4 w-6 rounded-t-md rounded-b-none border border-border hover:bg-secondary transition-all", colorClass)}
        onClick={onUp}
      >
        <ChevronUp className="w-3 h-3" />
      </Button>
      <Button 
        variant="ghost" 
        size="icon" 
        className={cn("h-4 w-6 rounded-b-md rounded-t-none border border-border hover:bg-secondary transition-all", colorClass)}
        onClick={onDown}
      >
        <ChevronDown className="w-3 h-3" />
      </Button>
    </div>
  );

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-16">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Painel de Parâmetros Financeiros */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="border-border/50 shadow-xl overflow-hidden group">
            <div className="h-1 w-full bg-gradient-to-r from-indigo-500 via-primary to-accent" />
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2 mb-1">
                <Target className="w-4 h-4 text-primary" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Configurações de Blindagem</span>
              </div>
              <CardTitle className="text-2xl font-headline font-bold">Diagnóstico Mensal</CardTitle>
              <CardDescription className="text-xs font-medium">Ajuste os parâmetros para otimizar sua operação.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Seção 1: Entrada (Energia do Negócio) */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-500/70">
                   <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                   Motor de Entrada
                </div>
                <div className="flex items-center justify-between p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/20 group/input transition-all hover:bg-indigo-500/10 hover:border-indigo-500/40">
                  <div className="flex items-center gap-3">
                    <StepButtons 
                      onUp={() => setFat(fat + 100)} 
                      onDown={() => setFat(Math.max(0, fat - 100))} 
                      colorClass="text-indigo-500"
                    />
                    <label className="text-xs font-bold text-indigo-500 uppercase tracking-tight">Faturamento Bruto</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">R$</span>
                    <div className="relative">
                      <Input 
                        type="number" 
                        value={fat} 
                        onChange={(e) => setFat(parseFloat(e.target.value) || 0)}
                        className="w-28 h-10 text-right font-code font-bold text-indigo-500 bg-background/50 border-indigo-500/20 focus-visible:ring-1 focus-visible:ring-indigo-500 pr-7 transition-all"
                      />
                      <PenLine className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-indigo-500/30 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Seção 2: Drenos (Saídas Obrigatórias) */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-orange-500/70">
                   <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                   Drenos de Saída
                </div>
                <div className="grid gap-3">
                  {/* Custos */}
                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-orange-500/5 border border-orange-500/10 transition-all hover:border-orange-500/30">
                    <div className="flex items-center gap-3">
                      <StepButtons 
                        onUp={() => setCustos(custos + 50)} 
                        onDown={() => setCustos(Math.max(0, custos - 50))} 
                        colorClass="text-orange-500"
                      />
                      <label className="text-xs font-bold text-orange-500 uppercase tracking-tight">Operacional</label>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">R$</span>
                      <Input 
                        type="number" 
                        value={custos} 
                        onChange={(e) => setCustos(parseFloat(e.target.value) || 0)}
                        className="w-24 h-9 text-right font-code font-bold text-orange-500 bg-background/50 border-orange-500/20 focus-visible:ring-1 focus-visible:ring-orange-500 transition-all"
                      />
                    </div>
                  </div>

                  {/* Pró-labore */}
                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-blue-500/5 border border-blue-500/10 transition-all hover:border-blue-500/30">
                    <div className="flex items-center gap-3">
                      <StepButtons 
                        onUp={() => setProlabore(prolabore + 50)} 
                        onDown={() => setProlabore(Math.max(0, prolabore - 50))} 
                        colorClass="text-blue-500"
                      />
                      <label className="text-xs font-bold text-blue-500 uppercase tracking-tight">Seu Salário (PF)</label>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">R$</span>
                      <Input 
                        type="number" 
                        value={prolabore} 
                        onChange={(e) => setProlabore(parseFloat(e.target.value) || 0)}
                        className="w-24 h-9 text-right font-code font-bold text-blue-500 bg-background/50 border-blue-500/20 focus-visible:ring-1 focus-visible:ring-blue-500 transition-all"
                      />
                    </div>
                  </div>

                  {/* Reserva */}
                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-purple-500/5 border border-purple-500/10 transition-all hover:border-purple-500/30">
                    <div className="flex items-center gap-3">
                      <StepButtons 
                        onUp={() => setReservaPct(Math.min(100, reservaPct + 5))} 
                        onDown={() => setReservaPct(Math.max(0, reservaPct - 5))} 
                        colorClass="text-purple-500"
                      />
                      <label className="text-xs font-bold text-purple-500 uppercase tracking-tight">Reserva Estratégica</label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input 
                        type="number" 
                        value={reservaPct} 
                        onChange={(e) => setReservaPct(parseFloat(e.target.value) || 0)}
                        className="w-16 h-9 text-right font-code font-bold text-purple-500 bg-background/50 border-purple-500/20 focus-visible:ring-1 focus-visible:ring-purple-500 transition-all"
                      />
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">%</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Painel de Visualização de Resultados */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="border-border/50 shadow-xl overflow-hidden h-full flex flex-col">
            <CardHeader className="bg-secondary/20 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-headline font-bold">Mapa do Capital</CardTitle>
                  <CardDescription className="text-xs">Distribuição proporcional do faturamento.</CardDescription>
                </div>
                <Badge variant="outline" className={cn(
                  "font-black text-[10px] uppercase tracking-widest px-3 py-1",
                  sobra > 0 ? "bg-primary/20 text-primary border-primary/20" : "bg-destructive/20 text-destructive border-destructive/20"
                )}>
                  {sobra > 0 ? "Operação Saudável" : "Cuidado Fiscais"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-8 space-y-8">
              
              {/* Barra de Distribuição Horizontal */}
              <div className="space-y-4">
                <div className="flex h-5 w-full rounded-2xl overflow-hidden bg-secondary shadow-inner p-1 border">
                  {displayItems.map((item, idx) => (
                    <div 
                      key={idx} 
                      className={cn(item.color, "transition-all duration-1000 first:rounded-l-xl last:rounded-r-xl")} 
                      style={{ width: formatPercent(item.val, fat) }} 
                    />
                  ))}
                </div>
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                   <span>Drenos</span>
                   <div className="h-px flex-1 mx-4 bg-border/50" />
                   <span>Reserva & Lucro</span>
                </div>
              </div>

              {/* Lista Detalhada */}
              <div className="grid gap-4">
                {displayItems.map((item, idx) => (
                  <div key={idx} className="group relative overflow-hidden flex items-center justify-between p-4 rounded-2xl bg-secondary/30 border border-border/50 hover:bg-secondary/60 hover:border-primary/30 transition-all shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className={cn("p-3 rounded-xl shadow-lg transition-transform group-hover:scale-110", item.color, "text-white")}>
                        {item.icon}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-foreground">{item.label}</div>
                        <div className="text-[10px] text-muted-foreground font-black uppercase tracking-wider">{formatPercent(item.val, fat)} do total</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={cn("font-code font-bold text-xl tabular-nums tracking-tighter", item.text)}>{formatCurrency(item.val)}</div>
                    </div>
                  </div>
                ))}
              </div>

              {sobra <= 0 && (
                <div className="flex gap-4 items-center p-5 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive animate-pulse">
                  <AlertCircle className="w-6 h-6 shrink-0" />
                  <div className="space-y-1">
                    <p className="text-sm font-bold uppercase tracking-tight">Atenção: Déficit Operacional</p>
                    <p className="text-xs opacity-80">Suas saídas superam o faturamento. Reduza custos ou aumente o ticket imediatamente.</p>
                  </div>
                </div>
              )}

              {/* Resumo de Eficiência */}
              {sobra > 0 && (
                <div className="pt-6 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-6">
                   <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-primary/10 rounded-xl text-primary shadow-inner">
                        <Zap className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Sobra Real</div>
                        <div className="text-lg font-black text-foreground">{formatCurrency(sobra)} <span className="text-[10px] text-primary">Disponível</span></div>
                      </div>
                   </div>
                   <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-purple-500/10 rounded-xl text-purple-500 shadow-inner">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Blindagem PJ</div>
                        <div className="text-lg font-black text-foreground">{formatCurrency(reservaVal)} <span className="text-[10px] text-purple-500">Acumulado</span></div>
                      </div>
                   </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Manifesto Educativo de Rodapé */}
      <section className="p-8 rounded-[32px] bg-secondary/20 border border-border/50 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden group">
         <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
            <Info className="w-24 h-24" />
         </div>
         <div className="space-y-3 relative z-10 max-w-2xl text-center md:text-left">
            <h4 className="text-lg font-bold tracking-tight">O Poder da Distribuição Disciplinada</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
               No MEI Flow, o faturamento não é seu salário. Ele é a energia que sustenta a sua <strong>Blindagem Patrimonial</strong>. 
               Mantenha a disciplina mensal e veja o seu lucro trimestral se transformar em liberdade inegociável.
            </p>
         </div>
         <div className="relative z-10">
            <Button variant="outline" className="rounded-xl font-bold gap-2 group/btn h-11 px-8 border-primary/30 hover:bg-primary/10 transition-all">
               Saiba mais sobre a Blindagem
               <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
            </Button>
         </div>
      </section>
    </div>
  );
}
