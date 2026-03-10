
"use client"

import { useState, useMemo, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/formatters";
import { FileSpreadsheet, ShieldCheck, Info, AlertTriangle, CheckCircle2, HelpCircle, MoveHorizontal } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
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
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [scrollPos, setScrollPos] = useState(0);
  const [maxScroll, setMaxScroll] = useState(100);

  const [data, setData] = useState<MonthlyData[]>(
    Array(12).fill(null).map(() => ({ receita: 5000, custos: 500, active: true }))
  );
  
  const [globalParams, setGlobalParams] = useState({
    prolabore: 2000,
    reservaPct: 50,
    das: 76
  });

  // Atualiza o limite máximo de scroll quando a tabela carrega ou redimensiona
  useEffect(() => {
    const updateMaxScroll = () => {
      if (tableContainerRef.current) {
        const { scrollWidth, clientWidth } = tableContainerRef.current;
        setMaxScroll(scrollWidth - clientWidth);
      }
    };

    updateMaxScroll();
    window.addEventListener('resize', updateMaxScroll);
    return () => window.removeEventListener('resize', updateMaxScroll);
  }, [data]);

  // Sincroniza o slider com o scroll da tabela
  const handleScroll = () => {
    if (tableContainerRef.current) {
      setScrollPos(tableContainerRef.current.scrollLeft);
    }
  };

  // Sincroniza a tabela com o movimento do slider
  const handleSliderChange = (value: number[]) => {
    if (tableContainerRef.current) {
      tableContainerRef.current.scrollLeft = value[0];
      setScrollPos(value[0]);
    }
  };

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
      {/* Resumo de Metas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-primary/5 border-primary/20">
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

        <Card className="bg-secondary/30 border-dashed">
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
                  className="h-8 text-xs font-bold bg-background/50" 
                  type="number" 
                  value={globalParams.prolabore}
                  onChange={(e) => setGlobalParams({...globalParams, prolabore: parseFloat(e.target.value) || 0})}
                />
              </div>
              <div>
                <div className="text-[10px] text-muted-foreground font-bold mb-1 uppercase">% Reserva</div>
                <Input 
                  className="h-8 text-xs font-bold bg-background/50" 
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

      {/* Navegador Superior */}
      <div className="px-2 py-1 flex items-center gap-4 bg-secondary/20 rounded-t-xl border border-b-0 border-border/50">
        <MoveHorizontal className="w-4 h-4 text-muted-foreground shrink-0" />
        <Slider 
          value={[scrollPos]} 
          max={maxScroll} 
          step={1} 
          onValueChange={handleSliderChange} 
          className="flex-1"
        />
      </div>

      {/* Planilha */}
      <Card className="overflow-hidden border-border/50 rounded-none border-y">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between bg-secondary/10 pb-4 gap-4">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-primary" />
              Planejamento Anual
            </CardTitle>
            <CardDescription>Arraste a barra para navegar lateralmente</CardDescription>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-bold text-muted-foreground uppercase">Receita Total Projetada</div>
            <div className="text-xl font-bold text-primary">{formatCurrency(totals.acumuladoReceita)}</div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div 
            ref={tableContainerRef}
            onScroll={handleScroll}
            className="overflow-x-auto scroll-smooth scrollbar-hide"
          >
            <Table className="min-w-[1000px]">
              <TableHeader className="bg-secondary/30">
                <TableRow className="hover:bg-transparent border-b">
                  <TableHead className="w-[80px] font-bold text-[10px] uppercase text-center border-r">Status</TableHead>
                  <TableHead className="w-[100px] font-bold text-[10px] uppercase border-r">Mês</TableHead>
                  <TableHead className="w-[150px] font-bold text-[10px] uppercase px-4 text-blue-500">Receita (R$)</TableHead>
                  <TableHead className="w-[150px] font-bold text-[10px] uppercase px-4 text-orange-500">Custos (R$)</TableHead>
                  <TableHead className="w-[120px] text-right font-bold text-[10px] uppercase px-4">Sobra</TableHead>
                  <TableHead className="w-[120px] text-right font-bold text-[10px] uppercase text-purple-500 px-4">Reserva</TableHead>
                  <TableHead className="w-[120px] text-right font-bold text-[10px] uppercase text-primary px-4">Lucro Disp.</TableHead>
                  <TableHead className="w-[150px] text-right font-bold text-[10px] uppercase px-4 opacity-50">Reserva Acum.</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {totals.rows.map((row, i) => (
                  <TableRow key={i} className={cn(
                    "transition-colors group",
                    !row.active ? "opacity-30 grayscale" : "hover:bg-primary/5"
                  )}>
                    <TableCell className="py-3 text-center border-r">
                      <div className="flex justify-center">
                        <Switch 
                          checked={row.active} 
                          onCheckedChange={(checked) => updateMonth(i, 'active', !!checked)}
                          className="scale-75"
                        />
                      </div>
                    </TableCell>
                    <TableCell className="font-bold text-xs py-3 border-r">
                      {MESES[i]}
                    </TableCell>
                    <TableCell className="py-2 px-4">
                      <Input 
                        type="number" 
                        disabled={!row.active}
                        value={row.receita} 
                        onChange={(e) => updateMonth(i, 'receita', e.target.value)}
                        className="h-8 text-xs font-bold bg-transparent border-transparent hover:border-input focus:border-blue-500 focus:ring-0"
                      />
                    </TableCell>
                    <TableCell className="py-2 px-4">
                      <Input 
                        type="number" 
                        disabled={!row.active}
                        value={row.custos} 
                        onChange={(e) => updateMonth(i, 'custos', e.target.value)}
                        className="h-8 text-xs font-bold bg-transparent border-transparent hover:border-input focus:border-orange-500 focus:ring-0"
                      />
                    </TableCell>
                    <TableCell className="text-right text-xs font-medium tabular-nums px-4">
                      {formatCurrency(row.sobra)}
                    </TableCell>
                    <TableCell className="text-right text-xs font-bold text-purple-500 tabular-nums px-4 bg-purple-500/5">
                      {formatCurrency(row.reserva)}
                    </TableCell>
                    <TableCell className="text-right text-xs font-bold text-primary tabular-nums px-4 bg-primary/5">
                      {formatCurrency(row.lucro)}
                    </TableCell>
                    <TableCell className="text-right text-xs font-medium tabular-nums px-4 opacity-50">
                      {formatCurrency(row.acumuladoReserva)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Navegador Inferior */}
      <div className="px-2 py-1 flex items-center gap-4 bg-secondary/20 rounded-b-xl border border-t-0 border-border/50">
        <MoveHorizontal className="w-4 h-4 text-muted-foreground shrink-0" />
        <Slider 
          value={[scrollPos]} 
          max={maxScroll} 
          step={1} 
          onValueChange={handleSliderChange} 
          className="flex-1"
        />
      </div>

      {/* Dicas e Alertas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl border border-border bg-card/50">
          <h4 className="text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            Dica de Navegação
          </h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Use as barras de deslizar acima e abaixo da planilha para visualizar todas as colunas de resultado. Em dispositivos móveis, você também pode arrastar a tabela diretamente com o dedo.
          </p>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card/50">
          <h4 className="text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2 text-amber-500">
            <AlertTriangle className="w-4 h-4" />
            Análise de Sustentabilidade
          </h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Se a "Sobra" mensal for menor que o valor do Pró-labore, você está "comendo" o capital da empresa. Use a planilha para simular períodos de baixa e planejar o caixa.
          </p>
        </div>
      </div>

      {/* FAQ Section */}
      <section className="space-y-6 pt-6">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-secondary rounded-lg">
            <HelpCircle className="w-5 h-5 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-headline font-bold text-lg">Dúvidas sobre o Controle Mensal</h3>
            <p className="text-xs text-muted-foreground">Como usar a planilha para tomar decisões melhores.</p>
          </div>
        </div>

        <Accordion type="single" collapsible className="w-full space-y-2">
          {FAQS_PLANILHA.map((faq, idx) => (
            <AccordionItem key={idx} value={`faq-${idx}`} className="border rounded-xl px-4 bg-card/50">
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
    </div>
  );
}
