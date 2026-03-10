"use client"

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/formatters";
import { TrendingUp, Wallet, ArrowUpRight, ArrowDownRight, Target, ShieldCheck, BarChart3 } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

interface ProfessionalDashboardProps {
  fat: number;
  custos: number;
  prolabore: number;
  reservaPct: number;
}

export function ProfessionalDashboard({ fat, custos, prolabore, reservaPct }: ProfessionalDashboardProps) {
  const das = 75;
  const totalDespesas = custos + das + prolabore;
  const sobraMensal = Math.max(0, fat - totalDespesas);
  const reservaMensal = Math.round((sobraMensal * reservaPct) / 100);
  const lucroReal = sobraMensal - reservaMensal;
  
  // Margem de Lucro Real
  const margemLucro = fat > 0 ? (lucroReal / fat) * 100 : 0;

  // Projeção de 6 meses
  const projecaoData = useMemo(() => {
    return Array.from({ length: 6 }).map((_, i) => {
      const mes = i + 1;
      return {
        name: `Mês ${mes}`,
        reservaAcumulada: reservaMensal * mes,
        lucroAcumulado: lucroReal * mes,
        faturamento: fat,
      };
    });
  }, [reservaMensal, lucroReal, fat]);

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      {/* KPIs Profissionais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Lucro Real Líquido</p>
                <h3 className="text-2xl font-bold mt-1">{formatCurrency(lucroReal)}</h3>
              </div>
              <div className="p-2 bg-primary/20 rounded-lg text-primary">
                <ArrowUpRight className="w-5 h-5" />
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground mt-2">
              Livre de impostos, custos e reserva.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-blue-500/5 border-blue-500/20">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Margem de Lucro</p>
                <h3 className="text-2xl font-bold mt-1 text-blue-500">{margemLucro.toFixed(1)}%</h3>
              </div>
              <div className="p-2 bg-blue-500/20 rounded-lg text-blue-500">
                <Target className="w-5 h-5" />
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground mt-2">
              Eficiência financeira do seu negócio.
            </p>
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
            <p className="text-[10px] text-muted-foreground mt-2">
              Destinado ao crescimento e segurança.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Projeção */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">Projeção de Acúmulo (6 meses)</CardTitle>
          </div>
          <CardDescription>Crescimento previsto do caixa e da reserva financeira</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={projecaoData}>
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
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `R$${v/1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Area type="monotone" dataKey="lucroAcumulado" name="Lucro Acumulado" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorLucro)" strokeWidth={2} />
                <Area type="monotone" dataKey="reservaAcumulada" name="Reserva Acumulada" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorReserva)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Gestão Profissional */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">DRE Simplificada (Mês Atual)</CardTitle>
          <CardDescription>Demonstrativo de Resultados do Exercício para MEI</CardDescription>
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
              <TableRow className="bg-primary/5">
                <TableCell className="font-bold">(=) Receita Bruta (Faturamento)</TableCell>
                <TableCell className="text-right font-bold">{formatCurrency(fat)}</TableCell>
                <TableCell className="text-right font-bold">100%</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>(-) Custos Operacionais</TableCell>
                <TableCell className="text-right text-destructive">{formatCurrency(custos)}</TableCell>
                <TableCell className="text-right text-destructive">-{((custos/fat)*100).toFixed(0)}%</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>(-) DAS (Impostos Fixos)</TableCell>
                <TableCell className="text-right text-destructive">{formatCurrency(das)}</TableCell>
                <TableCell className="text-right text-destructive">-{((das/fat)*100).toFixed(1)}%</TableCell>
              </TableRow>
              <TableRow className="bg-secondary/30">
                <TableCell className="font-medium">(=) Lucro Bruto da Empresa</TableCell>
                <TableCell className="text-right font-medium">{formatCurrency(fat - custos - das)}</TableCell>
                <TableCell className="text-right font-medium">{(((fat - custos - das)/fat)*100).toFixed(0)}%</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>(-) Pró-labore (Salário)</TableCell>
                <TableCell className="text-right text-orange-500">{formatCurrency(prolabore)}</TableCell>
                <TableCell className="text-right text-orange-500">-{((prolabore/fat)*100).toFixed(0)}%</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>(-) Reserva de Crescimento ({reservaPct}%)</TableCell>
                <TableCell className="text-right text-purple-500">{formatCurrency(reservaMensal)}</TableCell>
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

      {/* Alerta de Caixa */}
      {lucroReal < fat * 0.1 && lucroReal > 0 && (
        <Card className="border-yellow-500/50 bg-yellow-500/10">
          <CardContent className="pt-4 flex gap-3">
            <ArrowDownRight className="w-5 h-5 text-yellow-500 shrink-0" />
            <div className="text-sm text-yellow-600 dark:text-yellow-500 font-medium">
              Alerta de Margem: Seu lucro real está abaixo de 10% do faturamento. 
              Recomendamos revisar custos operacionais ou aumentar o ticket médio para garantir a saúde do negócio.
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
