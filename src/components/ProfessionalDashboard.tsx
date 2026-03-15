"use client"

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/formatters";
import { calculateDasValue } from "@/lib/dasCalculator";
import { useBusiness } from "@/contexts/BusinessContext";
import { TrendingUp, Wallet, Target, ShieldCheck, BarChart3, MousePointer2, Info, Lightbulb, ArrowRight, Rocket, PiggyBank, Landmark, Sparkles, ArrowDownRight, ArrowDownLeft, ChevronRight } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Badge } from "@/components/ui/badge";

interface ProfessionalDashboardProps {
  fat: number;
  custos: number;
  prolabore: number;
  reservaPct: number;
}

export function ProfessionalDashboard({ fat, custos, prolabore, reservaPct }: ProfessionalDashboardProps) {
  const { businessData } = useBusiness();
  const das = calculateDasValue(businessData.ramo);
  
  const totalDespesas = custos + das + prolabore;
  const sobraMensal = Math.max(0, fat - totalDespesas);
  const reservaMensal = Math.round((sobraMensal * reservaPct) / 100);
  const lucroReal = sobraMensal - reservaMensal;
  
  const margemLucro = fat > 0 ? (lucroReal / fat) * 100 : 0;

  const projecaoData = useMemo(() => {
    return Array.from({ length: 6 }).map((_, i) => {
      const mes = i + 1;
      return {
        name: `Mês ${mes}`,
        reservaAcumulada: reservaMensal * mes,
        lucroAcumulado: lucroReal * mes,
      };
    });
  }, [reservaMensal, lucroReal]);

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      {/* KPIs compactos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-4 pb-4 px-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Lucro Real Líquido</p>
                <h3 className="text-xl font-bold mt-1 text-primary">{formatCurrency(lucroReal)}</h3>
              </div>
              <div className="p-1.5 bg-primary/20 rounded-lg text-primary">
                <Wallet className="w-4 h-4" />
              </div>
            </div>
            <p className="text-[9px] text-muted-foreground mt-1.5">Livre para você (extra).</p>
          </CardContent>
        </Card>

        <Card className="bg-indigo-500/5 border-indigo-500/20">
          <CardContent className="pt-4 pb-4 px-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Vendas (Faturamento)</p>
                <h3 className="text-xl font-bold mt-1 text-indigo-500">{formatCurrency(fat)}</h3>
              </div>
              <div className="p-1.5 bg-indigo-500/20 rounded-lg text-indigo-500">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <p className="text-[9px] text-muted-foreground mt-1.5">Total bruto do mês.</p>
          </CardContent>
        </Card>

        <Card className="bg-purple-500/5 border-purple-500/20">
          <CardContent className="pt-4 pb-4 px-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Reserva Mensal</p>
                <h3 className="text-xl font-bold mt-1 text-purple-500">{formatCurrency(reservaMensal)}</h3>
              </div>
              <div className="p-1.5 bg-purple-500/20 rounded-lg text-purple-500">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <p className="text-[9px] text-muted-foreground mt-1.5">Patrimônio do negócio.</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Projeção */}
      <Card>
        <CardHeader className="pb-2 pt-4 px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              <CardTitle className="text-base font-bold">Projeção (6 meses)</CardTitle>
            </div>
            <div className="flex items-center gap-1 text-[9px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
              <MousePointer2 className="w-2.5 h-2.5" />
              TOQUE PARA VER
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-2 pb-2">
          <div className="h-[220px] w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={projecaoData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorLucro" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorReserva" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis 
                  dataKey="name" 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={10} 
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={9} 
                  tickFormatter={(v) => `R$${v/1000}k`} 
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip 
                  cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 1, strokeDasharray: '4 4' }}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    padding: '8px',
                    fontSize: '11px'
                  }}
                  formatter={(value: number) => [formatCurrency(value), '']}
                />
                <Area 
                  type="monotone" 
                  dataKey="lucroAcumulado" 
                  name="Lucro" 
                  stroke="hsl(var(--primary))" 
                  fillOpacity={1} 
                  fill="url(#colorLucro)" 
                  strokeWidth={2}
                  activeDot={{ r: 4 }}
                />
                <Area 
                  type="monotone" 
                  dataKey="reservaAcumulada" 
                  name="Reserva" 
                  stroke="#8b5cf6" 
                  fillOpacity={1} 
                  fill="url(#colorReserva)" 
                  strokeWidth={2}
                  activeDot={{ r: 4 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* DRE Simplificada Otimizada */}
      <Card>
        <CardHeader className="pb-3 pt-4 px-4">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" />
            <CardTitle className="text-base font-bold">DRE: O Caminho do Dinheiro</CardTitle>
          </div>
          <CardDescription className="text-[10px]">Visão didática do faturamento até o lucro real.</CardDescription>
        </CardHeader>
        <CardContent className="px-3 pb-3">
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader className="bg-secondary/20">
                <TableRow className="h-8">
                  <TableHead className="font-bold text-[9px] uppercase tracking-wider py-0">Fluxo</TableHead>
                  <TableHead className="text-right font-bold text-[9px] uppercase tracking-wider py-0">Valor</TableHead>
                  <TableHead className="text-right font-bold text-[9px] uppercase tracking-wider py-0">%</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* FATURAMENTO */}
                <TableRow className="bg-indigo-500/5 hover:bg-indigo-500/10 border-indigo-500/20">
                  <TableCell className="py-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-indigo-500 font-black text-sm w-5 text-center">(=)</span>
                      <div>
                        <div className="font-bold text-indigo-500 text-[11px]">Vendas Brutas</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-bold text-xs text-indigo-500">{formatCurrency(fat)}</TableCell>
                  <TableCell className="text-right text-[10px] text-indigo-500/60 font-medium">100%</TableCell>
                </TableRow>

                {/* CUSTOS */}
                <TableRow className="h-10">
                  <TableCell className="py-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-orange-500 font-bold text-sm w-5 text-center">(-)</span>
                      <span className="text-foreground text-[11px] font-medium">Custos Operacionais</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-bold text-[11px] text-orange-500">{formatCurrency(custos)}</TableCell>
                  <TableCell className="text-right text-muted-foreground text-[10px]">-{((custos/fat)*100).toFixed(0)}%</TableCell>
                </TableRow>

                {/* DAS */}
                <TableRow className="h-10">
                  <TableCell className="py-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-red-500 font-bold text-sm w-5 text-center">(-)</span>
                      <span className="text-foreground text-[11px] font-medium">Imposto DAS</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-bold text-[11px] text-red-500">{formatCurrency(das)}</TableCell>
                  <TableCell className="text-right text-muted-foreground text-[10px]">-{((das/fat)*100).toFixed(1)}%</TableCell>
                </TableRow>

                {/* PRÓ-LABORE */}
                <TableRow className="h-10">
                  <TableCell className="py-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-blue-500 font-bold text-sm w-5 text-center">(-)</span>
                      <span className="text-foreground text-[11px] font-medium">Salário (Pró-labore)</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-bold text-[11px] text-blue-500">{formatCurrency(prolabore)}</TableCell>
                  <TableCell className="text-right text-muted-foreground text-[10px]">-{((prolabore/fat)*100).toFixed(0)}%</TableCell>
                </TableRow>

                {/* RESERVA */}
                <TableRow className="h-10">
                  <TableCell className="py-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-purple-500 font-bold text-sm w-5 text-center">(-)</span>
                      <span className="text-foreground text-[11px] font-medium">Reserva PJ</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-bold text-[11px] text-purple-500">{formatCurrency(reservaMensal)}</TableCell>
                  <TableCell className="text-right text-muted-foreground text-[10px]">-{((reservaMensal/fat)*100).toFixed(0)}%</TableCell>
                </TableRow>

                {/* LUCRO REAL */}
                <TableRow className="bg-primary/10 border-t border-primary/20">
                  <TableCell className="py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-primary font-black text-base w-5 text-center">(=)</span>
                      <div className="font-black text-primary text-[11px] uppercase tracking-tight">Lucro Livre</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-black text-sm text-primary">{formatCurrency(lucroReal)}</TableCell>
                  <TableCell className="text-right font-bold text-[11px] text-primary">{margemLucro.toFixed(0)}%</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
          
          <div className="mt-6 space-y-6">
            <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5">
              <div className="flex gap-3 items-start">
                <Lightbulb className="w-5 h-5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-amber-600 dark:text-amber-500">Regra de Ouro: Lucro não é salário.</h4>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    O Pró-labore é sua retirada mensal fixa. O Lucro deve ser acumulado na <strong>conta PJ Operacional</strong> e distribuído <strong>trimestralmente</strong> conforme a saúde do negócio.
                  </p>
                  
                  <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase text-amber-600/70 tracking-widest">Você decide o destino do lucro acumulado:</p>
                    <div className="grid gap-2">
                      <div className="flex items-center gap-3 bg-background/40 p-2.5 rounded-lg border border-amber-500/10 transition-all hover:bg-background/60">
                        <Wallet className="w-3.5 h-3.5 text-amber-600" />
                        <p className="text-[10px] text-muted-foreground"><strong>Investir</strong>: Mandar para sua corretora <strong>Pessoal (PF/CPF) (ex.: XP, BTG, RICO)</strong></p>
                      </div>
                      <div className="flex items-center gap-3 bg-background/40 p-2.5 rounded-lg border border-amber-500/10 transition-all hover:bg-background/60">
                        <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                        <p className="text-[10px] text-muted-foreground"><strong>Guardar</strong>: Manter na reserva da <strong>conta PJ Operacional</strong> como segurança extra</p>
                      </div>
                      <div className="flex items-center gap-3 bg-background/40 p-2.5 rounded-lg border border-amber-500/10 transition-all hover:bg-background/60">
                        <Rocket className="w-3.5 h-3.5 text-amber-600" />
                        <p className="text-[10px] text-muted-foreground"><strong>Escalar</strong>: Reinvestir na empresa para aumentar sua capacidade, estoque ou marketing</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Estudo de Caso Trimestral - Nível Unicórnio */}
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6 space-y-10 shadow-lg">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-amber-500/20 pb-6 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-amber-600 dark:text-amber-500">
                    <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-70">Estudo de Caso</span>
                  </div>
                  <h4 className="text-xl font-black text-foreground tracking-tight">O Ciclo de R$ 5k</h4>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-px w-8 bg-amber-500/30 hidden sm:block" />
                  <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30 font-black text-[9px] uppercase tracking-widest px-3 py-1">
                    Modelo Educativo Profissional
                  </Badge>
                </div>
              </div>

              {/* Jornada Mensal com Conector Explícito */}
              <div className="relative">
                <div className="grid grid-cols-1 md:grid-cols-11 gap-4 items-center">
                  {/* Bloco 1: Sobra */}
                  <div className="md:col-span-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      <h5 className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Resultado Mensal</h5>
                    </div>
                    <div className="relative p-5 rounded-2xl bg-background border-2 border-amber-500/30 shadow-md group">
                      <div className="flex justify-between items-center">
                        <div className="space-y-0.5">
                          <span className="text-[10px] font-black uppercase text-amber-600/60 leading-none">Sobra Bruta</span>
                          <div className="text-2xl font-black text-amber-700 dark:text-amber-400">R$ 2.420</div>
                        </div>
                        <div className="p-2.5 bg-amber-500/10 rounded-xl text-amber-600">
                          <Target className="w-6 h-6" />
                        </div>
                      </div>
                      <div className="absolute -right-3 top-1/2 -translate-y-1/2 hidden md:flex">
                        <div className="bg-background border-2 border-amber-500/30 rounded-full p-1 shadow-sm">
                          <ChevronRight className="w-4 h-4 text-amber-600" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bloco 2: Conector Matemático Central */}
                  <div className="md:col-span-1 flex md:flex-col items-center justify-center gap-4 py-4">
                    <div className="h-px md:h-12 w-12 md:w-px bg-gradient-to-r md:bg-gradient-to-b from-amber-500/50 to-transparent" />
                    <div className="text-[9px] font-black text-amber-600/40 uppercase rotate-0 md:rotate-90 whitespace-nowrap tracking-widest">DIVISÃO ESTRATÉGICA</div>
                    <div className="h-px md:h-12 w-12 md:w-px bg-gradient-to-l md:bg-gradient-to-t from-amber-500/50 to-transparent" />
                  </div>

                  {/* Bloco 3: Alocação */}
                  <div className="md:col-span-6 space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      <h5 className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Alocação (60/40)</h5>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="p-4 rounded-xl bg-background/60 border border-purple-500/20 space-y-2 group hover:border-purple-500/40 transition-all">
                        <div className="flex items-center justify-between">
                          <PiggyBank className="w-4 h-4 text-purple-500" />
                          <span className="text-[10px] font-black text-purple-500/60">60%</span>
                        </div>
                        <div className="space-y-0.5">
                          <div className="text-lg font-black text-purple-600">R$ 1.452</div>
                          <div className="text-[9px] font-bold text-muted-foreground uppercase leading-none">PJ Reserva</div>
                        </div>
                      </div>
                      <div className="p-4 rounded-xl bg-background/60 border border-primary/20 space-y-2 group hover:border-primary/40 transition-all">
                        <div className="flex items-center justify-between">
                          <Landmark className="w-4 h-4 text-primary" />
                          <span className="text-[10px] font-black text-primary/60">40%</span>
                        </div>
                        <div className="space-y-0.5">
                          <div className="text-lg font-black text-primary">R$ 968</div>
                          <div className="text-[9px] font-bold text-muted-foreground uppercase leading-none">Acumulado Op.</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Lógica do Fechamento Trimestral com Visual Unicórnio */}
              <div className="pt-10 border-t border-amber-500/20 space-y-8">
                <div className="text-center space-y-4">
                  <div className="inline-flex flex-col items-center">
                    <div className="text-[10px] font-black uppercase text-amber-600 tracking-[0.5em] mb-2">Ciclo de 90 Dias Concluído</div>
                    <div className="relative group">
                      <div className="absolute -inset-4 bg-amber-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="relative px-8 py-3 bg-background rounded-2xl border-2 border-amber-500/40 shadow-xl flex items-center gap-4">
                        <div className="text-xs text-muted-foreground font-bold italic">R$ 968 <span className="text-[10px] opacity-40">x3 meses</span> =</div>
                        <div className="text-3xl font-black text-foreground tracking-tighter">R$ 2.904</div>
                        <div className="p-2 bg-amber-500/10 rounded-lg">
                          <Rocket className="w-5 h-5 text-amber-600" />
                        </div>
                      </div>
                    </div>
                    <div className="text-[9px] text-muted-foreground font-black uppercase mt-3 tracking-widest">Patrimônio Acumulado na PJ Operacional</div>
                  </div>
                </div>

                <div className="relative grid grid-cols-1 sm:grid-cols-2 gap-8 items-start">
                  {/* Conectores de Fluxo Finais */}
                  <div className="absolute top-[-30px] left-1/2 -translate-x-1/2 hidden sm:flex items-center justify-center w-full">
                    <div className="w-[45%] h-8 border-l-2 border-t-2 border-amber-500/20 rounded-tl-2xl mr-4" />
                    <div className="w-[45%] h-8 border-r-2 border-t-2 border-amber-500/20 rounded-tr-2xl ml-4" />
                  </div>

                  {/* Destino 1: Liberdade PF */}
                  <div className="relative">
                    <div className="p-6 rounded-3xl bg-background border border-amber-500/20 hover:border-amber-500/50 transition-all text-center space-y-4 shadow-xl group">
                      <div className="mx-auto w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
                        <Wallet className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <div className="text-xl font-black text-amber-600">R$ 1.452 <span className="text-xs opacity-60">(50%)</span></div>
                        <div className="text-[11px] text-muted-foreground font-semibold leading-tight px-4">
                          Transferência para sua <strong>Conta Corrente Pessoal (PF/CPF)</strong>
                        </div>
                      </div>
                      <div className="pt-2 border-t border-amber-500/10">
                        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-600/50">Distribuição de Lucro</div>
                      </div>
                    </div>
                  </div>

                  {/* Destino 2: Escala PJ */}
                  <div className="relative">
                    <div className="p-6 rounded-3xl bg-background border border-amber-500/20 hover:border-amber-500/50 transition-all text-center space-y-4 shadow-xl group">
                      <div className="mx-auto w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
                        <Sparkles className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <div className="text-xl font-black text-amber-600">R$ 1.452 <span className="text-xs opacity-60">(50%)</span></div>
                        <div className="text-[11px] text-muted-foreground font-semibold leading-tight px-4">
                          Permanece na <strong>PJ Operacional</strong> para Escala/Caixa
                        </div>
                      </div>
                      <div className="pt-2 border-t border-amber-500/10">
                        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-600/50">Reinvestimento/Reserva</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
