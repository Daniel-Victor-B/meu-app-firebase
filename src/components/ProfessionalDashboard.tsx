
"use client"

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/formatters";
import { TrendingUp, Wallet, Target, ShieldCheck, BarChart3, MousePointer2, Info, Lightbulb, ArrowRight, Rocket, PiggyBank, Landmark } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface ProfessionalDashboardProps {
  fat: number;
  custos: number;
  prolabore: number;
  reservaPct: number;
}

export function ProfessionalDashboard({ fat, custos, prolabore, reservaPct }: ProfessionalDashboardProps) {
  const das = 76;
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
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6 space-y-8">
              <div className="flex items-center justify-between border-b border-amber-500/20 pb-4">
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-500">
                  <Info className="w-5 h-5" />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em]">Estudo de Caso: O Ciclo de R$ 5k</span>
                </div>
                <div className="px-3 py-1 bg-amber-500/20 rounded-full border border-amber-500/30 text-[9px] font-black text-amber-600 uppercase tracking-widest">
                  Modelo Didático
                </div>
              </div>

              {/* Visual da Jornada Mensal */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 items-start">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    <h5 className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Fluxo Mensal</h5>
                  </div>
                  <div className="p-4 rounded-xl bg-background/40 border border-amber-500/10 space-y-3 shadow-sm">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground">Faturamento</span>
                      <span className="font-bold text-amber-600">R$ 5.000</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground">Obrigações Totais</span>
                      <span className="font-medium">R$ 2.580</span>
                    </div>
                    <div className="h-px bg-amber-500/10" />
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-black uppercase text-amber-600">Sobra Bruta</span>
                      <span className="text-sm font-black text-amber-700 dark:text-amber-400">R$ 2.420</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <h5 className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Alocação Estratégica</h5>
                  </div>
                  <div className="p-4 rounded-xl bg-background/40 border border-amber-500/10 space-y-3 shadow-sm">
                    <div className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2">
                        <PiggyBank className="w-3.5 h-3.5 text-purple-500" />
                        <span className="text-muted-foreground">PJ Reserva (60%)</span>
                      </div>
                      <span className="font-bold text-purple-500">R$ 1.452</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2">
                        <Landmark className="w-3.5 h-3.5 text-primary" />
                        <span className="text-muted-foreground">Acumulado Op. (40%)</span>
                      </div>
                      <span className="font-bold text-primary">R$ 968</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Lógica do Fechamento Trimestral */}
              <div className="pt-8 border-t border-amber-500/20 space-y-6">
                <div className="text-center space-y-3">
                  <div className="text-[10px] font-black uppercase text-amber-600 tracking-[0.4em]">Fechamento do Trimestre</div>
                  <div className="inline-flex items-center gap-3 px-6 py-2 bg-background/50 rounded-full border border-amber-500/20 shadow-inner">
                    <span className="text-xs text-muted-foreground font-medium">R$ 968 x 3 meses =</span>
                    <span className="text-2xl font-black text-foreground">R$ 2.904</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">Acumulados na PJ Operacional</p>
                </div>

                <div className="relative flex flex-col items-center py-6">
                  {/* Ponto de Decisão com Conector */}
                  <div className="absolute top-[-20px] bottom-0 w-px bg-gradient-to-b from-amber-500/50 to-transparent" />
                  
                  <div className="w-14 h-14 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-xl z-10 animate-pulse border-4 border-background">
                    <Target className="w-7 h-7" />
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full mt-10">
                    {/* Destino 1: Liberdade PF */}
                    <div className="relative group">
                      <div className="p-5 rounded-2xl bg-background border border-amber-500/20 hover:border-amber-500/50 transition-all text-center space-y-3 shadow-md">
                        <div className="mx-auto w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600">
                          <Wallet className="w-5 h-5" />
                        </div>
                        <div className="space-y-1">
                          <div className="text-sm font-black text-amber-600">R$ 1.452 (50%)</div>
                          <div className="text-[10px] text-muted-foreground font-medium leading-tight">
                            Transferência para sua <strong>Conta Pessoal (PF/CPF)</strong>
                          </div>
                        </div>
                        <div className="text-[9px] font-black uppercase tracking-widest text-amber-600/50">Distribuição de Lucro</div>
                      </div>
                    </div>

                    {/* Destino 2: Escala PJ */}
                    <div className="relative group">
                      <div className="p-5 rounded-2xl bg-background border border-amber-500/20 hover:border-amber-500/50 transition-all text-center space-y-3 shadow-md">
                        <div className="mx-auto w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600">
                          <Rocket className="w-5 h-5" />
                        </div>
                        <div className="space-y-1">
                          <div className="text-sm font-black text-amber-600">R$ 1.452 (50%)</div>
                          <div className="text-[10px] text-muted-foreground font-medium leading-tight">
                            Permanece na <strong>PJ Operacional</strong> para Investimento
                          </div>
                        </div>
                        <div className="text-[9px] font-black uppercase tracking-widest text-amber-600/50">Crescimento do Negócio</div>
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
