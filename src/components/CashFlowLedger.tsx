
"use client"

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { formatCurrency } from "@/lib/formatters";
import { FileSpreadsheet, ShieldCheck, Info, AlertTriangle, HelpCircle, ArrowLeftRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const MESES = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun", 
  "Jul", "Ago", "Set", "Out", "Nov", "Dez"
];

interface MonthlyData {
  receita: number;
  custos: number;
  active: boolean;
}

const FAQS_PLANILHA = [
  {
    q: "Como projetar meses com faturamento incerto?",
    a: "No MEI, a sazonalidade é comum. Use a média dos últimos 3 meses para os meses futuros ou, se for comércio, projete 20-30% a mais em meses como Dezembro (Natal). A planilha serve justamente para você ver o impacto desses picos na sua reserva."
  },
  {
    q: "O que entra como 'Custos Operacionais' na planilha?",
    a: "Tudo o que a empresa gasta para existir: ferramentas (SaaS), internet, materiais, embalagens, fretes e assinaturas. Não inclua aqui o seu Pró-labore nem o DAS, pois a planilha já calcula esses valores separadamente para te dar a Sobra Real."
  },
  {
    q: "Por que separar a 'Reserva' do 'Lucro Disponível'?",
    a: "O Lucro Disponível é o dinheiro que você pode gastar com você (além do salário) ou reinvestir. A Reserva é o dinheiro da empresa para emergências. Sem essa separação, você corre o risco de ficar sem caixa no primeiro mês que o faturamento cair."
  }
];

export function CashFlowLedger() {
  const [data, setData] = useState<MonthlyData[]>(
    Array(12).fill(null).map(() => ({ receita: 5000, custos: 500, active: true }))
  );
  
  const [globalParams, setGlobalParams] = useState({
    prolabore: 2000,
    reservaPct: 50,
    das: 76
  });

  const updateMonth = (index: number, field: keyof MonthlyData, value: any) => {
    const newData = [...data];
    if (field === 'active') {
      newData[index] = { ...newData[index], active: value };
    } else {
      const newValue = parseFloat(value) || 0;
      newData[index] = { ...newData[index], [field]: newValue };
    }
    setData(newData);
  };

  const totals = useMemo(() => {
    let acumuladoReserva = 0;
    let acumuladoReceita = 0;

    const rows = data.map((m) => {
      if (!m.active) {
        return {
          ...m,
          sobra: 0,
          reserva: 0,
          lucro: 0,
          acumuladoReserva
        };
      }

      const sobra = Math.max(0, m.receita - m.custos - globalParams.das - globalParams.prolabore);
      const reserva = Math.round((sobra * globalParams.reservaPct) / 100);
      const lucro = sobra - reserva;
      
      acumuladoReserva += reserva;
      acumuladoReceita += m.receita;

      return {
        ...m,
        sobra,
        reserva,
        lucro,
        acumuladoReserva
      };
    });

    return { rows, acumuladoReserva, acumuladoReceita };
  }, [data, globalParams]);

  const custoEmpresaMensal = (data.filter(m => m.active).reduce((acc, curr) => acc + curr.custos, 0) / (data.filter(m => m.active).length || 1)) + globalParams.das;
  const metaTotal = (custoEmpresaMensal + globalParams.prolabore) * 6;
  const progressoMeta = Math.min(100, (totals.acumuladoReserva / metaTotal) * 100);

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 pb-16">
      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-primary/5 border-primary/20 shadow-md">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2 text-primary">
              <ShieldCheck className="w-5 h-5" />
              <CardTitle className="text-sm font-bold uppercase tracking-wider">Colchão de Segurança (6 meses)</CardTitle>
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
                <div className="text-[10px] text-muted-foreground uppercase font-bold mt-1">Meta de Segurança</div>
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

        <Card className="bg-secondary/30 border-dashed border-2">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Info className="w-5 h-5" />
              <CardTitle className="text-sm font-bold uppercase tracking-wider">Parâmetros de Cálculo</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-[10px] text-muted-foreground font-bold mb-1 uppercase">Pró-labore</div>
                <Input 
                  className="h-8 text-xs font-bold bg-background/50 border-primary/20" 
                  type="number" 
                  value={globalParams.prolabore}
                  onChange={(e) => setGlobalParams({...globalParams, prolabore: parseFloat(e.target.value) || 0})}
                />
              </div>
              <div>
                <div className="text-[10px] text-muted-foreground font-bold mb-1 uppercase">% Reserva</div>
                <Input 
                  className="h-8 text-xs font-bold bg-background/50 border-purple-500/20" 
                  type="number" 
                  value={globalParams.reservaPct}
                  onChange={(e) => setGlobalParams({...globalParams, reservaPct: parseFloat(e.target.value) || 0})}
                />
              </div>
              <div>
                <div className="text-[10px] text-muted-foreground font-bold mb-1 uppercase">DAS Fixo</div>
                <div className="h-8 flex items-center text-xs font-bold px-3 bg-secondary/50 rounded-md border border-input/50">{formatCurrency(globalParams.das)}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Planejamento */}
      <Card className="overflow-hidden border-border/50 shadow-xl">
        {/* ESPAÇO DE INSTRUÇÃO: Pista visual para deslizar com o dedo */}
        <div className="bg-secondary/40 border-b border-border/50 py-4 px-6 flex items-center justify-center gap-3 group cursor-grab active:cursor-grabbing">
          <div className="p-2 bg-primary/20 rounded-full animate-pulse">
            <ArrowLeftRight className="w-5 h-5 text-primary" />
          </div>
          <div className="text-center">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-foreground block">Deslize para o lado</span>
            <span className="text-[10px] text-muted-foreground font-medium uppercase mt-0.5">Use o dedo para ver Receita, Custos e Lucro</span>
          </div>
          <div className="p-2 bg-primary/20 rounded-full animate-pulse">
            <ArrowLeftRight className="w-5 h-5 text-primary" />
          </div>
        </div>

        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between bg-card pb-4 gap-4 px-6 pt-6">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-primary" />
              Planejamento de Fluxo Anual
            </CardTitle>
            <CardDescription className="text-xs">Configure seus meses para simular o ano fiscal</CardDescription>
          </div>
          <div className="text-right p-3 bg-primary/5 rounded-xl border border-primary/10">
            <div className="text-[10px] font-bold text-muted-foreground uppercase">Receita Total Projetada</div>
            <div className="text-xl font-bold text-primary">{formatCurrency(totals.acumuladoReceita)}</div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {/* Container com scroll horizontal e barra escondida */}
          <div className="overflow-x-auto no-scrollbar pb-6">
            <Table className="min-w-[1100px] border-collapse">
              <TableHeader className="bg-secondary/30">
                <TableRow className="hover:bg-transparent border-b">
                  <TableHead className="w-[80px] font-bold text-[10px] uppercase text-center border-r bg-secondary/10">Status</TableHead>
                  <TableHead className="w-[90px] font-bold text-[10px] uppercase border-r text-center bg-secondary/10">Mês</TableHead>
                  <TableHead className="w-[180px] font-bold text-[10px] uppercase px-6 text-blue-500">Receita Mensal (R$)</TableHead>
                  <TableHead className="w-[180px] font-bold text-[10px] uppercase px-6 text-orange-500">Custos Operacionais (R$)</TableHead>
                  <TableHead className="w-[140px] text-right font-bold text-[10px] uppercase px-6">Sobra Bruta</TableHead>
                  <TableHead className="w-[140px] text-right font-bold text-[10px] uppercase text-purple-500 px-6">Reserva PJ</TableHead>
                  <TableHead className="w-[140px] text-right font-bold text-[10px] uppercase text-primary px-6">Lucro Disp.</TableHead>
                  <TableHead className="w-[180px] text-right font-bold text-[10px] uppercase px-6 opacity-30">Reserva Acum.</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {totals.rows.map((row, i) => (
                  <TableRow key={i} className={cn(
                    "transition-all duration-300",
                    !row.active ? "opacity-20 grayscale scale-[0.98]" : "hover:bg-primary/5"
                  )}>
                    <TableCell className="py-3 text-center border-r">
                      <div className="flex justify-center">
                        <Switch 
                          checked={row.active} 
                          onCheckedChange={(checked) => updateMonth(i, 'active', !!checked)}
                          className="scale-90 data-[state=checked]:bg-primary"
                        />
                      </div>
                    </TableCell>
                    <TableCell className="font-bold text-xs py-3 border-r text-center bg-card">
                      {MESES[i]}
                    </TableCell>
                    <TableCell className="py-2 px-6">
                      <Input 
                        type="number" 
                        disabled={!row.active}
                        value={row.receita} 
                        onChange={(e) => updateMonth(i, 'receita', e.target.value)}
                        className="h-10 text-xs font-bold bg-transparent border-transparent hover:border-input focus:border-blue-500 focus:bg-background/50 transition-all text-blue-500"
                      />
                    </TableCell>
                    <TableCell className="py-2 px-6">
                      <Input 
                        type="number" 
                        disabled={!row.active}
                        value={row.custos} 
                        onChange={(e) => updateMonth(i, 'custos', e.target.value)}
                        className="h-10 text-xs font-bold bg-transparent border-transparent hover:border-input focus:border-orange-500 focus:bg-background/50 transition-all text-orange-500"
                      />
                    </TableCell>
                    <TableCell className="text-right text-xs font-medium tabular-nums px-6">
                      {formatCurrency(row.sobra)}
                    </TableCell>
                    <TableCell className="text-right text-xs font-bold text-purple-500 tabular-nums px-6">
                      {formatCurrency(row.reserva)}
                    </TableCell>
                    <TableCell className="text-right text-xs font-bold text-primary tabular-nums px-6">
                      {formatCurrency(row.lucro)}
                    </TableCell>
                    <TableCell className="text-right text-xs font-medium tabular-nums px-6 opacity-30">
                      {formatCurrency(row.acumuladoReserva)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Alerta Financeiro */}
      <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5">
        <h4 className="text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2 text-amber-500">
          <AlertTriangle className="w-4 h-4" />
          Importante
        </h4>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Sempre que um mês ficar com a sobra negativa, o sistema não calculará reserva ou lucro. Desative os meses de férias ou inatividade para ter uma projeção real de fechamento de ano.
        </p>
      </div>

      <section className="space-y-6 pt-6">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-secondary rounded-lg">
            <HelpCircle className="w-5 h-5 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-headline font-bold text-lg">Perguntas sobre o Planejamento</h3>
            <p className="text-xs text-muted-foreground">Como usar os dados da planilha na vida real.</p>
          </div>
        </div>

        <Accordion type="single" collapsible className="w-full space-y-2">
          {FAQS_PLANILHA.map((faq, idx) => (
            <AccordionItem key={idx} value={`faq-${idx}`} className="border rounded-xl px-4 bg-card shadow-sm hover:shadow-md transition-shadow">
              <AccordionTrigger className="text-sm font-bold text-left hover:no-underline py-4">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-xs text-muted-foreground leading-relaxed pb-4">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* Estilo para esconder a barra de rolagem */}
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
      `}</style>
    </div>
  );
}
