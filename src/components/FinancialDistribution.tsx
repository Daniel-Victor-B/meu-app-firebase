
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
  Target,
  ArrowRight
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
  setActiveTab?: (v: string) => void;
}

export function FinancialDistribution({ 
  fat, setFat, 
  custos, setCustos, 
  prolabore, setProlabore, 
  reservaPct, setReservaPct,
  setActiveTab
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
        className={cn("h-4 w-6 rounded-t-md rounded-b-none border border-white/10 hover:bg-white/10 transition-all", colorClass)}
        onClick={onUp}
      >
        <ChevronUp className="w-3 h-3" />
      </Button>
      <Button 
        variant="ghost" 
        size="icon" 
        className={cn("h-4 w-6 rounded-b-md rounded-t-none border border-white/10 hover:bg-white/10 transition-all", colorClass)}
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
          <Card className="border-primary/20 shadow-2xl overflow-hidden bg-card/40 backdrop-blur-xl relative group transition-all duration-500">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-indigo-500 via-primary to-purple-500 opacity-50" />
            
            <CardHeader className="pb-6 relative">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-primary/10 rounded-lg text-primary">
                  <Target className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/70">Protocolo de Comando</span>
              </div>
              <CardTitle className="text-2xl font-black tracking-tight text-foreground">Configurações de Blindagem</CardTitle>
              <CardDescription className="text-xs font-medium text-muted-foreground">Otimize seu fluxo com precisão tática.</CardDescription>
            </CardHeader>

            <CardContent className="space-y-12 relative">
              
              {/* Seção 1: Motor de Entrada */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="h-px flex-1 bg-gradient-to-r from-indigo-500/30 to-transparent" />
                  <span className="text-[9px] font-black text-indigo-500 uppercase tracking-[0.3em]">Motor de Entrada</span>
                  <div className="h-px flex-1 bg-gradient-to-l from-indigo-500/30 to-transparent" />
                </div>
                
                <div className="group/item relative p-8 rounded-[32px] bg-indigo-500/5 backdrop-blur-2xl border border-white/20 shadow-[inset_0_0_20px_rgba(99,102,241,0.1),0_10px_40px_rgba(0,0,0,0.2)] hover:scale-[1.02] transition-all duration-500 overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-500/10 via-transparent to-indigo-500/5 pointer-events-none" />
                  <div className="relative flex items-center justify-between gap-6 z-10">
                    <div className="flex items-center gap-5">
                      <div className="p-4 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-2xl text-white shadow-xl shadow-indigo-500/30 group-hover/item:scale-110 transition-transform duration-500 border border-white/20">
                        <TrendingUp className="w-6 h-6" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-black text-indigo-400 uppercase tracking-[0.2em] leading-none drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]">Faturamento Mensal</label>
                        <div className="text-[10px] text-muted-foreground font-bold italic opacity-60">Receita Bruta Total</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <StepButtons 
                        onUp={() => setFat(fat + 100)} 
                        onDown={() => setFat(Math.max(0, fat - 100))} 
                        colorClass="text-indigo-400"
                      />
                      <div className="relative group/field">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-indigo-400/50">R$</span>
                        <Input 
                          type="number" 
                          value={fat} 
                          onChange={(e) => setFat(parseFloat(e.target.value) || 0)}
                          className="w-40 h-16 pl-10 pr-10 text-right font-code font-black text-2xl text-indigo-400 bg-black/20 border-white/10 group-hover/field:border-indigo-400/40 focus-visible:ring-1 focus-visible:ring-indigo-400 transition-all rounded-2xl shadow-xl"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Seção 2: Drenos e Estratégia */}
              <div className="space-y-6 relative">
                <div className="absolute left-[38px] top-8 bottom-8 w-px bg-gradient-to-b from-indigo-500/40 via-orange-500/20 to-purple-500/40 border-l border-dashed border-border/40 z-0 hidden sm:block" />
                
                <div className="flex items-center gap-3 relative z-10">
                  <div className="h-px flex-1 bg-gradient-to-r from-primary/30 to-transparent" />
                  <span className="text-[9px] font-black text-primary uppercase tracking-[0.3em]">Drenos e Estratégia</span>
                  <div className="h-px flex-1 bg-gradient-to-l from-primary/30 to-transparent" />
                </div>
                
                <div className="grid gap-5 relative z-10">
                  {/* Custos Operacionais */}
                  <div className="group/item relative flex items-center justify-between p-5 rounded-[24px] bg-orange-500/5 backdrop-blur-xl border border-white/10 shadow-[inset_0_0_15px_rgba(249,115,22,0.05)] hover:scale-[1.02] transition-all duration-500 overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-orange-500/10 to-transparent pointer-events-none" />
                    <div className="flex items-center gap-5 relative z-10">
                       <div className="p-3.5 bg-black/20 border border-orange-500/20 rounded-xl text-orange-400 group-hover/item:bg-orange-500 group-hover/item:text-white transition-all duration-500 shadow-inner">
                         <Scale className="w-5 h-5" />
                       </div>
                       <div className="space-y-1">
                         <label className="text-[10px] font-black text-orange-400 uppercase tracking-widest leading-none drop-shadow-[0_0_8px_rgba(249,115,22,0.4)]">Operacional</label>
                         <div className="text-[9px] text-muted-foreground font-bold opacity-50">Custo Fixo</div>
                       </div>
                    </div>
                    <div className="flex items-center gap-4 relative z-10">
                      <StepButtons 
                        onUp={() => setCustos(custos + 50)} 
                        onDown={() => setCustos(Math.max(0, custos - 50))} 
                        colorClass="text-orange-400"
                      />
                      <div className="relative group/field">
                        <Input 
                          type="number" 
                          value={custos} 
                          onChange={(e) => setCustos(parseFloat(e.target.value) || 0)}
                          className="w-32 h-14 text-right font-code font-black text-lg text-orange-400 bg-black/20 border-white/10 group-hover/field:border-orange-400/40 transition-all rounded-xl shadow-md"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Pró-labore */}
                  <div className="group/item relative flex items-center justify-between p-5 rounded-[24px] bg-blue-500/5 backdrop-blur-xl border border-white/10 shadow-[inset_0_0_15px_rgba(59,130,246,0.05)] hover:scale-[1.02] transition-all duration-500 overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-500/10 to-transparent pointer-events-none" />
                    <div className="flex items-center gap-5 relative z-10">
                       <div className="p-3.5 bg-black/20 border border-blue-500/20 rounded-xl text-blue-400 group-hover/item:bg-blue-500 group-hover/item:text-white transition-all duration-500 shadow-inner">
                         <UserCircle className="w-5 h-5" />
                       </div>
                       <div className="space-y-1">
                         <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest leading-none drop-shadow-[0_0_8px_rgba(59,130,246,0.4)]">Seu Salário</label>
                         <div className="text-[9px] text-muted-foreground font-bold opacity-50">Retirada PF</div>
                       </div>
                    </div>
                    <div className="flex items-center gap-4 relative z-10">
                      <StepButtons 
                        onUp={() => setProlabore(prolabore + 50)} 
                        onDown={() => setProlabore(Math.max(0, prolabore - 50))} 
                        colorClass="text-blue-400"
                      />
                      <div className="relative group/field">
                        <Input 
                          type="number" 
                          value={prolabore} 
                          onChange={(e) => setProlabore(parseFloat(e.target.value) || 0)}
                          className="w-32 h-14 text-right font-code font-black text-lg text-blue-400 bg-black/20 border-white/10 group-hover/field:border-blue-400/40 transition-all rounded-xl shadow-md"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Reserva Percentual */}
                  <div className="group/item relative flex items-center justify-between p-5 rounded-[24px] bg-purple-500/5 backdrop-blur-xl border border-white/10 shadow-[inset_0_0_15px_rgba(168,85,247,0.05)] hover:scale-[1.02] transition-all duration-500 overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-purple-500/10 to-transparent pointer-events-none" />
                    <div className="flex items-center gap-5 relative z-10">
                       <div className="p-3.5 bg-black/20 border border-purple-500/20 rounded-xl text-purple-400 group-hover/item:bg-purple-500 group-hover/item:text-white transition-all duration-500 shadow-inner">
                         <ShieldCheck className="w-5 h-5" />
                       </div>
                       <div className="space-y-1">
                         <label className="text-[10px] font-black text-purple-400 uppercase tracking-widest leading-none drop-shadow-[0_0_8px_rgba(168,85,247,0.4)]">Blindagem PJ</label>
                         <div className="text-[9px] text-muted-foreground font-bold opacity-50">Segurança</div>
                       </div>
                    </div>
                    <div className="flex items-center gap-4 relative z-10">
                      <StepButtons 
                        onUp={() => setReservaPct(Math.min(100, reservaPct + 5))} 
                        onDown={() => setReservaPct(Math.max(0, reservaPct - 5))} 
                        colorClass="text-purple-400"
                      />
                      <div className="relative group/field">
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-purple-400/50">%</span>
                        <Input 
                          type="number" 
                          value={reservaPct} 
                          onChange={(e) => setReservaPct(parseFloat(e.target.value) || 0)}
                          className="w-28 h-14 text-center font-code font-black text-lg text-purple-400 bg-black/20 border-white/10 group-hover/field:border-purple-400/40 transition-all rounded-xl pr-8 shadow-md"
                        />
                      </div>
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
                      <div className="p-2.5 bg-amber-500/10 rounded-xl text-amber-500 shadow-inner">
                        <Zap className="w-5 h-5 text-amber-500" />
                      </div>
                      <div>
                        <div className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Sobra Real</div>
                        <div className="text-lg font-black text-foreground">{formatCurrency(sobra)} <span className="text-[10px] text-amber-500 font-bold uppercase">Disponível</span></div>
                      </div>
                   </div>
                   <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-purple-500/10 rounded-xl text-purple-500 shadow-inner">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Blindagem PJ</div>
                        <div className="text-lg font-black text-foreground">{formatCurrency(reservaVal)} <span className="text-[10px] text-purple-500 font-bold uppercase">Acumulado</span></div>
                      </div>
                   </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Manifesto Educativo de Rodapé */}
      <section className="relative p-1 rounded-[40px] bg-gradient-to-br from-primary/20 via-border/50 to-indigo-500/10 shadow-2xl overflow-hidden group transition-all duration-700 hover:shadow-primary/10">
        <div className="bg-card/40 backdrop-blur-xl rounded-[39px] p-8 md:p-12 flex flex-col lg:flex-row items-center justify-between gap-12 relative">
          
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 blur-[100px] rounded-full group-hover:bg-primary/20 transition-all duration-1000" />
          
          <div className="flex flex-col lg:flex-row items-center gap-10 relative z-10 max-w-4xl">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner border border-primary/20 shrink-0">
               <ShieldCheck className="w-8 h-8" />
            </div>
            
            <div className="space-y-4 text-center lg:text-left">
               <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 border border-primary/20 rounded-full mb-1">
                 <Zap className="w-3.5 h-3.5 text-primary animate-pulse" />
                 <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Protocolo de Autoridade</span>
               </div>
               <h4 className="text-2xl md:text-3xl font-black tracking-tight text-foreground leading-none">
                 O Poder da Distribuição <span className="text-primary">Disciplinada</span>
               </h4>
               <p className="text-sm md:text-base text-muted-foreground leading-relaxed font-medium text-balance">
                  No MEI Flow, o faturamento não é seu salário. Ele é a energia que sustenta a sua <strong>Blindagem Patrimonial</strong>. 
                  Mantenha a disciplina mensal e veja o seu lucro trimestral se transformar em <span className="text-primary italic font-bold">liberdade inegociável</span>.
               </p>
            </div>
          </div>

          <div className="relative z-10 shrink-0 mt-6 lg:mt-0">
             <Button 
               onClick={() => setActiveTab?.('contas')}
               variant="default" 
               className="rounded-2xl font-black uppercase tracking-widest text-[10px] gap-3 group/btn h-14 px-10 shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:scale-105 transition-all duration-500"
             >
                Saiba mais sobre a Blindagem
                <div className="w-6 h-6 rounded-full bg-primary-foreground/20 flex items-center justify-center group-hover/btn:translate-x-1 transition-transform">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
             </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
