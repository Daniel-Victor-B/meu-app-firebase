
"use client"

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/formatters";
import { TrendingUp, Wallet, Target, ShieldCheck, BarChart3, MousePointer2, Info } from "lucide-react";
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
      {/* KPIs com cores sincronizadas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Lucro Real Líquido</p>
                <h3 className="text-2xl font-bold mt-1 text-primary">{formatCurrency(lucroReal)}</h3>
              </div>
              <div className="p-2 bg-primary/20 rounded-lg text-primary">
                <Wallet className="w-5 h-5" />
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground mt-2">Livre para você (além do salário).</p>
          </CardContent>
        </Card>

        <Card className="bg-indigo-500/5 border-indigo-500/20">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Faturamento Mensal</p>
                <h3 className="text-2xl font-bold mt-1 text-indigo-500">{formatCurrency(fat)}</h3>
              </div>
              <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-500">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground mt-2">Total bruto de vendas.</p>
          </CardContent>
        </Card>

        <Card className="bg-purple-500/5 border-purple-500/20">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Reserva Mensal</p>
                <h3 className="text-2xl font-bold mt-1 text-purple-500">{formatCurrency(reservaMensal)}</h3>
              </div>
              <div className="p-2 bg-purple-500/20 rounded-lg text-purple-500">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground mt-2">Patrimônio do seu negócio.</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Projeção com cores sincronizadas */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg">Projeção de Acúmulo (6 meses)</CardTitle>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-primary bg-primary/10 px-2 py-1 rounded-full border border-primary/20">
              <MousePointer2 className="w-3 h-3" />
              TOQUE PARA VER DETALHES
            </div>
          </div>
          <CardDescription>Crescimento previsto do seu lucro e reserva ao longo do tempo</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[280px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={projecaoData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                <XAxis 
                  dataKey="name" 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={12} 
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={10} 
                  tickFormatter={(v) => `R$${v/1000}k`} 
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip 
                  cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 1, strokeDasharray: '4 4' }}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '12px',
                    padding: '12px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                  }}
                  formatter={(value: number) => [formatCurrency(value), '']}
                  labelStyle={{ fontWeight: 'bold', marginBottom: '8px', color: 'hsl(var(--foreground))' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="lucroAcumulado" 
                  name="Lucro Acumulado" 
                  stroke="hsl(var(--primary))" 
                  fillOpacity={1} 
                  fill="url(#colorLucro)" 
                  strokeWidth={3}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
                <Area 
                  type="monotone" 
                  dataKey="reservaAcumulada" 
                  name="Reserva Acumulada" 
                  stroke="#8b5cf6" 
                  fillOpacity={1} 
                  fill="url(#colorReserva)" 
                  strokeWidth={3}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Tabela com cores sincronizadas */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">DRE Simplificada (O Caminho do Dinheiro)</CardTitle>
          </div>
          <CardDescription className="text-xs">Veja como cada real do seu faturamento é fatiado até chegar ao lucro real.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border overflow-hidden">
            <Table>
              <TableHeader className="bg-secondary/30">
                <TableRow>
                  <TableHead className="font-black text-[10px] uppercase tracking-widest py-4">Estrutura de Fluxo</TableHead>
                  <TableHead className="text-right font-black text-[10px] uppercase tracking-widest py-4">Valor Nominal</TableHead>
                  <TableHead className="text-right font-black text-[10px] uppercase tracking-widest py-4">Peso %</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* FATURAMENTO */}
                <TableRow className="bg-indigo-500/10 hover:bg-indigo-500/15 border-indigo-500/20 transition-colors">
                  <TableCell className="py-5">
                    <div className="flex items-center gap-3">
                      <span className="text-indigo-500 font-black text-xl w-8 text-center">(=)</span>
                      <div>
                        <div className="font-bold text-indigo-500 text-sm">Faturamento Bruto</div>
                        <div className="text-[10px] text-indigo-500/70 font-bold uppercase">Total de Vendas</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-black text-lg text-indigo-500">{formatCurrency(fat)}</TableCell>
                  <TableCell className="text-right font-bold text-indigo-500/60">100%</TableCell>
                </TableRow>

                {/* CUSTOS */}
                <TableRow className="hover:bg-orange-500/5 transition-colors">
                  <TableCell className="py-4">
                    <div className="flex items-center gap-3">
                      <span className="text-orange-500 font-black text-xl w-8 text-center">(-)</span>
                      <div>
                        <div className="font-bold text-foreground text-sm">Custos Operacionais</div>
                        <div className="text-[10px] text-orange-500 font-bold uppercase tracking-tighter">Manutenção do Negócio</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-bold text-orange-500">{formatCurrency(custos)}</TableCell>
                  <TableCell className="text-right text-muted-foreground text-xs">-{((custos/fat)*100).toFixed(0)}%</TableCell>
                </TableRow>

                {/* DAS */}
                <TableRow className="hover:bg-red-500/5 transition-colors">
                  <TableCell className="py-4">
                    <div className="flex items-center gap-3">
                      <span className="text-red-500 font-black text-xl w-8 text-center">(-)</span>
                      <div>
                        <div className="font-bold text-foreground text-sm">Imposto DAS</div>
                        <div className="text-[10px] text-red-500 font-bold uppercase tracking-tighter">Obrigação Previdenciária</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-bold text-red-500">{formatCurrency(das)}</TableCell>
                  <TableCell className="text-right text-muted-foreground text-xs">-{((das/fat)*100).toFixed(1)}%</TableCell>
                </TableRow>

                {/* PRÓ-LABORE */}
                <TableRow className="hover:bg-blue-500/5 transition-colors">
                  <TableCell className="py-4">
                    <div className="flex items-center gap-3">
                      <span className="text-blue-500 font-black text-xl w-8 text-center">(-)</span>
                      <div>
                        <div className="font-bold text-foreground text-sm">Pró-labore (Salário)</div>
                        <div className="text-[10px] text-blue-500 font-bold uppercase tracking-tighter">Sua Remuneração PF</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-bold text-blue-500">{formatCurrency(prolabore)}</TableCell>
                  <TableCell className="text-right text-muted-foreground text-xs">-{((prolabore/fat)*100).toFixed(0)}%</TableCell>
                </TableRow>

                {/* RESERVA */}
                <TableRow className="hover:bg-purple-500/5 transition-colors">
                  <TableCell className="py-4">
                    <div className="flex items-center gap-3">
                      <span className="text-purple-500 font-black text-xl w-8 text-center">(-)</span>
                      <div>
                        <div className="font-bold text-foreground text-sm">Reserva de Crescimento</div>
                        <div className="text-[10px] text-purple-500 font-bold uppercase tracking-tighter">Capital de Giro</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-bold text-purple-500">{formatCurrency(reservaMensal)}</TableCell>
                  <TableCell className="text-right text-muted-foreground text-xs">-{((reservaMensal/fat)*100).toFixed(0)}%</TableCell>
                </TableRow>

                {/* LUCRO REAL */}
                <TableRow className="bg-primary/20 hover:bg-primary/25 border-t-2 border-primary/30 transition-colors">
                  <TableCell className="py-6">
                    <div className="flex items-center gap-3">
                      <span className="text-primary font-black text-2xl w-8 text-center">(=)</span>
                      <div>
                        <div className="font-black text-primary text-base uppercase tracking-tight">Lucro Real Disponível</div>
                        <div className="text-[10px] text-primary/70 font-bold uppercase">Seu ganho extra livre</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-black text-2xl text-primary">{formatCurrency(lucroReal)}</TableCell>
                  <TableCell className="text-right font-black text-primary">{margemLucro.toFixed(1)}%</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
          
          <div className="mt-6 p-4 bg-secondary/30 rounded-xl border border-dashed flex gap-3 items-center">
            <Info className="w-5 h-5 text-muted-foreground shrink-0" />
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              <strong>Nota Didática:</strong> O lucro real é o que sobra após você já ter recebido seu salário (Pró-labore) e a empresa ter guardado a parte dela (Reserva). É o dinheiro da sua liberdade financeira.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
