
"use client"

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/formatters";
import { TrendingUp, Wallet, ArrowUpRight, ArrowDownRight, Target, ShieldCheck, BarChart3, MousePointer2 } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Dot } from "recharts";

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
        <CardHeader>
          <CardTitle className="text-lg">DRE Simplificada (Mês Atual)</CardTitle>
          <CardDescription>Fluxo de caixa detalhado com a separação por cores</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader className="bg-secondary/50">
              <TableRow>
                <TableHead className="font-bold text-xs uppercase tracking-wider">Descrição</TableHead>
                <TableHead className="text-right font-bold text-xs uppercase tracking-wider">Valor</TableHead>
                <TableHead className="text-right font-bold text-xs uppercase tracking-wider">%</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className="bg-indigo-500/5">
                <TableCell className="font-bold text-indigo-500">(=) Faturamento (Vendas)</TableCell>
                <TableCell className="text-right font-bold text-indigo-500">{formatCurrency(fat)}</TableCell>
                <TableCell className="text-right font-bold text-indigo-500">100%</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>(-) Custos Operacionais</TableCell>
                <TableCell className="text-right text-orange-500 font-medium">{formatCurrency(custos)}</TableCell>
                <TableCell className="text-right text-orange-500">-{((custos/fat)*100).toFixed(0)}%</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>(-) DAS (Impostos Fixos)</TableCell>
                <TableCell className="text-right text-red-500 font-medium">{formatCurrency(das)}</TableCell>
                <TableCell className="text-right text-red-500">-{((das/fat)*100).toFixed(1)}%</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>(-) Pró-labore (Salário)</TableCell>
                <TableCell className="text-right text-blue-500 font-medium">{formatCurrency(prolabore)}</TableCell>
                <TableCell className="text-right text-blue-500">-{((prolabore/fat)*100).toFixed(0)}%</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>(-) Reserva de Crescimento</TableCell>
                <TableCell className="text-right text-purple-500 font-medium">{formatCurrency(reservaMensal)}</TableCell>
                <TableCell className="text-right text-purple-500">-{((reservaMensal/fat)*100).toFixed(0)}%</TableCell>
              </TableRow>
              <TableRow className="bg-primary/20">
                <TableCell className="font-bold text-primary">(=) LUCRO REAL DISPONÍVEL</TableCell>
                <TableCell className="text-right font-bold text-primary">{formatCurrency(lucroReal)}</TableCell>
                <TableCell className="text-right font-bold text-primary">{margemLucro.toFixed(1)}%</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
