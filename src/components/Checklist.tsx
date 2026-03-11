
"use client"

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Rocket, 
  CalendarDays, 
  CalendarCheck, 
  ShieldAlert, 
  CheckCircle2, 
  ListChecks, 
  HelpCircle,
  Zap,
  ArrowRight,
  ShieldCheck,
  Landmark,
  Wallet,
  Sparkles,
  ChevronRight,
  Target,
  Trophy,
  TrendingUp,
  Flame,
  MousePointer2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { formatCurrency } from "@/lib/formatters";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { BarChart, Bar, XAxis, ResponsiveContainer, Cell, Tooltip } from 'recharts';

interface ChecklistProps {
  fat: number;
  custos: number;
  prolabore: number;
}

const SECTIONS = [
  {
    id: "setup",
    titulo: "Arquitetura de Fundação",
    subtitulo: "Configuração única para blindar o início do negócio",
    icon: <Rocket className="w-5 h-5" />,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20",
    tasks: [
      { id: "s1", text: "Emitir Certificado CCMEI Atualizado", detail: "O seu 'Contrato Social'. Guarde o PDF original e atualizado." },
      { id: "s2", text: "Abertura de Conta PJ Operacional", detail: "Separar o CPF do CNPJ é o primeiro passo da blindagem patrimonial." },
      { id: "s3", text: "Credenciamento no Emissor Nacional (NFS-e)", detail: "Configurar e-mail, telefone e 'Serviços Favoritos' para agilizar vendas." },
      { id: "s4", text: "Consulta de Inscrição Municipal/Alvará", detail: "Verificar se sua prefeitura exige licenciamento específico para sua sede." },
    ],
  },
  {
    id: "mensal",
    titulo: "Ritual de Operação Mensal",
    subtitulo: "Manutenção da saúde fiscal e fluxo de caixa",
    icon: <CalendarDays className="w-5 h-5" />,
    color: "text-primary",
    bgColor: "bg-primary/10",
    borderColor: "border-primary/20",
    tasks: [
      { id: "m1", text: "Liquidação do DAS (Guia Mensal)", detail: "Vencimento todo dia 20. O custo fixo que garante seus benefícios." },
      { id: "m2", text: "Relatório Mensal de Faturamento Bruto", detail: "Planilhar todas as vendas (com e sem nota) para a Declaração Anual." },
      { id: "m3", text: "Transferência de PF Pró-labore", detail: "O pagamento do seu salário executivo. Da conta PJ para a PF Pró-labore." },
      { id: "m4", text: "Organização de Notas de Compra", detail: "Arquivar NFs de insumos e ferramentas adquiridas pelo CNPJ." },
    ],
  },
  {
    id: "anual",
    titulo: "Ciclo de Fechamento Anual",
    subtitulo: "Obrigações críticas de prestação de contas",
    icon: <CalendarCheck className="w-5 h-5" />,
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/20",
    tasks: [
      { id: "a1", text: "Envio da DASN-SIMEI", detail: "Declaração faturamento bruto total. Prazo limite: 31 de Maio." },
      { id: "a2", text: "Auditoria do Limite de 81k", detail: "Conferir se o crescimento exige migração antecipada para ME." },
      { id: "a3", text: "Declaração de Imposto de Renda PF", detail: "Informar os rendimentos isentos (lucro distribuído) do seu CPF." },
    ],
  },
  {
    id: "blindagem",
    titulo: "Protocolo de Blindagem",
    subtitulo: "Segurança máxima para o caixa da empresa",
    icon: <ShieldAlert className="w-5 h-5" />,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/20",
    tasks: [
      { id: "sg1", text: "Respeito à Regra do 100%", detail: "Todo faturamento entra na PJ Operacional. Nenhuma exceção para o CPF." },
      { id: "sg2", text: "Manutenção da PJ Reserva", detail: "Garantir que o 'Pulmão Financeiro' tenha 6 meses de custos totais." },
      { id: "sg3", text: "Check de Emissão Obrigatória (CNPJ)", detail: "Garantir nota fiscal para toda venda realizada para outras empresas." },
    ],
  },
];

const FAQS_GUIDE = [
  {
    q: "O MEI é obrigado a emitir nota fiscal?",
    a: "Para empresas (CNPJ), sim. Para pessoas físicas (CPF), a emissão é opcional, a menos que o cliente exija. No entanto, o faturamento deve ser sempre registrado no relatório mensal."
  },
  {
    q: "O que acontece se eu não pagar o DAS?",
    a: "Você perde a cobertura previdenciária (auxílio-doença, aposentadoria), acumula juros diários e pode ter o CNPJ cancelado e a dívida transferida para o seu CPF."
  },
  {
    q: "Posso ser MEI e ter carteira assinada (CLT)?",
    a: "Sim. O único detalhe é que, em caso de demissão sem justa causa, você perde o direito ao Seguro-Desemprego, pois o governo entende que você já possui uma fonte de renda (o MEI)."
  },
  {
    q: "Preciso de contador para fechar o ano?",
    a: "Não é obrigatório, mas é altamente recomendado para calcular o 'Lucro Isento' no seu Imposto de Renda PF, evitando que você pague impostos desnecessários no seu CPF."
  }
];

export function Checklist({ fat, custos, prolabore }: ChecklistProps) {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [isEliteMode, setIsEliteMode] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("mei-flow-checklist");
    if (saved) setCheckedItems(JSON.parse(saved));
  }, []);

  const toggleTask = (id: string) => {
    const next = { ...checkedItems, [id]: !checkedItems[id] };
    setCheckedItems(next);
    localStorage.setItem("mei-flow-checklist", JSON.stringify(next));
  };

  const getProgress = (tasks: { id: string }[]) => {
    const completed = tasks.filter(t => checkedItems[t.id]).length;
    return (completed / tasks.length) * 100;
  };

  const totalTasks = SECTIONS.reduce((acc, s) => acc + s.tasks.length, 0);
  const totalCompleted = Object.values(checkedItems).filter(Boolean).length;
  const globalProgress = (totalCompleted / totalTasks) * 100;

  const scrollToSection = (id: string) => {
    const element = document.getElementById(`section-${id}`);
    if (element) {
      const elementRect = element.getBoundingClientRect();
      const absoluteElementTop = elementRect.top + window.pageYOffset;
      const menuOffset = 110;

      window.scrollTo({
        top: absoluteElementTop - menuOffset,
        behavior: 'smooth'
      });
    }
  };

  const chartData = useMemo(() => {
    const das = 76;
    
    // Cenário Atual
    const currentCostsPct = fat > 0 ? ((custos + das) / fat) * 100 : 30;
    const currentSalaryPct = fat > 0 ? (prolabore / fat) * 100 : 40;
    const currentProfit = Math.max(0, fat - custos - das - prolabore);
    const currentProfitPct = fat > 0 ? (currentProfit / fat) * 100 : 30;

    // Cenário Elite (Benchmark 10% de custo)
    const eliteCosts = fat * 0.1;
    const eliteCostsPct = 10; 
    const eliteSalaryPct = currentSalaryPct;
    const eliteProfitPct = 100 - eliteCostsPct - eliteSalaryPct;

    if (isEliteMode) {
      return [
        { name: 'Operacional', value: eliteCostsPct, color: '#60a5fa', desc: 'Sustentação' },
        { name: 'Pró-labore', value: eliteSalaryPct, color: '#fbbf24', desc: 'Sobrevivência' },
        { name: 'Riqueza', value: eliteProfitPct, color: '#f472b6', desc: 'Liberdade' }
      ];
    }

    return [
      { name: 'Operacional', value: currentCostsPct, color: '#60a5fa', desc: 'Sustentação' },
      { name: 'Pró-labore', value: currentSalaryPct, color: '#fbbf24', desc: 'Sobrevivência' },
      { name: 'Riqueza', value: currentProfitPct, color: '#f472b6', desc: 'Liberdade' }
    ];
  }, [fat, custos, prolabore, isEliteMode]);

  const wealthExplosion = useMemo(() => {
    const das = 76;
    const currentProfit = Math.max(0, fat - custos - das - prolabore);
    const eliteCosts = fat * 0.1;
    const eliteProfit = Math.max(0, fat - eliteCosts - das - prolabore);
    const gap = Math.max(0, eliteProfit - currentProfit);
    return {
      monthlyGap: gap,
      annualGap: gap * 12,
      multiplier: currentProfit > 0 ? (eliteProfit / currentProfit).toFixed(1) : "∞"
    };
  }, [fat, custos, prolabore]);

  return (
    <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Painel de Comando de Elite */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 to-blue-500/30 blur-xl opacity-50 group-hover:opacity-100 transition duration-1000"></div>
        <Card className="relative bg-card/60 backdrop-blur-xl border-primary/20 overflow-hidden shadow-2xl">
          <CardContent className="pt-8 pb-8 px-6 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary rounded-2xl shadow-lg shadow-primary/30 text-primary-foreground">
                  <ListChecks className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-headline font-bold tracking-tight">Protocolo de Operação</h3>
                  <p className="text-sm text-muted-foreground font-medium mt-1">O mapa tático para uma gestão de elite.</p>
                </div>
              </div>
              <div className="text-right space-y-2 min-w-[180px]">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.3em] text-primary">
                  <span>Domínio Total</span>
                  <span>{globalProgress.toFixed(0)}%</span>
                </div>
                <Progress value={globalProgress} className="h-2.5 shadow-inner" />
              </div>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {SECTIONS.map((section) => {
                const progress = getProgress(section.tasks);
                return (
                  <div 
                    key={section.id} 
                    onClick={() => scrollToSection(section.id)}
                    className="group cursor-pointer p-4 rounded-2xl bg-secondary/30 border border-border/50 hover:bg-secondary/60 hover:border-primary/30 transition-all space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                       <div className={cn("p-2 rounded-lg shrink-0", section.bgColor, section.color)}>
                         {section.icon}
                       </div>
                       <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest text-right leading-none line-clamp-2">
                         {section.titulo}
                       </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px] font-bold">
                        <span className={cn(section.color)}>{progress.toFixed(0)}%</span>
                      </div>
                      <Progress 
                        value={progress} 
                        className="h-1.5" 
                        indicatorClassName={cn(section.bgColor.replace("/10", ""), "bg-current", section.color)} 
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center gap-3 p-4 bg-secondary/50 rounded-xl border border-border/50 text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
              <Zap className="w-4 h-4 text-primary animate-pulse" />
              Navegação Tática: Clique nos pilares acima para acesso instantâneo.
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Seções de Checklist */}
      <div className="grid gap-6">
        {SECTIONS.map((section) => {
          const progress = getProgress(section.tasks);
          const isDone = progress === 100;

          return (
            <Card 
              key={section.id} 
              id={`section-${section.id}`}
              className={cn(
                "overflow-hidden transition-all duration-300 border-2",
                isDone ? "border-primary/30 bg-primary/5 shadow-primary/5" : "border-border/40 bg-card/40"
              )}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className={cn("p-3 rounded-2xl shadow-sm", section.bgColor, section.color)}>
                      {section.icon}
                    </div>
                    <div>
                      <CardTitle className="text-lg font-bold tracking-tight">{section.titulo}</CardTitle>
                      <CardDescription className="text-xs font-medium">{section.subtitulo}</CardDescription>
                    </div>
                  </div>
                  <Badge variant="outline" className={cn(
                    "font-code text-[10px] px-3 py-1 border-transparent",
                    isDone ? "bg-primary text-primary-foreground" : section.bgColor + " " + section.color
                  )}>
                    {isDone ? "CONCLUÍDO" : `${progress.toFixed(0)}%`}
                  </Badge>
                </div>
                <Progress value={progress} className="h-1.5" indicatorClassName={isDone ? "bg-primary" : ""} />
              </CardHeader>
              <CardContent className="grid gap-3 pt-2">
                {section.tasks.map((task) => {
                  const checked = !!checkedItems[task.id];
                  return (
                    <div 
                      key={task.id} 
                      onClick={() => toggleTask(task.id)}
                      className={cn(
                        "group flex items-start gap-4 p-4 rounded-2xl transition-all duration-300 border cursor-pointer",
                        checked 
                          ? "bg-secondary/20 border-transparent opacity-60" 
                          : "bg-background/40 border-border/50 hover:border-primary/40 hover:bg-secondary/10 shadow-sm"
                      )}
                    >
                      <div className="mt-1">
                        <Checkbox 
                          id={task.id} 
                          checked={checked}
                          onCheckedChange={() => {}} 
                          className="w-5 h-5 rounded-md data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                        />
                      </div>
                      <div className="space-y-1 flex-1">
                        <div className={cn(
                          "text-sm font-bold transition-all",
                          checked ? "line-through text-muted-foreground" : "text-foreground"
                        )}>
                          {task.text}
                        </div>
                        <p className="text-[11px] text-muted-foreground font-medium leading-relaxed group-hover:text-foreground/80 transition-colors">
                          {task.detail}
                        </p>
                      </div>
                      {!checked && <ArrowRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-1 transition-all self-center" />}
                      {checked && <CheckCircle2 className="w-5 h-5 text-primary self-center animate-in zoom-in duration-300" />}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Audit de Riqueza Unicórnio - O Grande Final */}
      <section className="relative group p-1 rounded-[48px] bg-gradient-to-br from-indigo-950 via-primary/30 to-pink-950 shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden mt-16 border border-white/5">
        <div className="bg-black/90 backdrop-blur-3xl rounded-[47px] p-8 md:p-16 space-y-16 relative overflow-hidden">
          
          <div className="absolute top-0 right-0 -mr-40 -mt-40 w-[800px] h-[800px] bg-primary/10 blur-[180px] rounded-full opacity-40 animate-pulse" />
          <div className="absolute bottom-0 left-0 -ml-40 -mb-40 w-[600px] h-[600px] bg-pink-500/10 blur-[150px] rounded-full opacity-30" />
          
          <div className="relative z-10 space-y-16">
            
            {/* Header Emocional: Persuasão de Blair Warren */}
            <div className="text-center space-y-8 max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-3 px-6 py-2 bg-white/5 border border-white/10 rounded-full">
                <Flame className="w-4 h-4 text-orange-500 animate-bounce" />
                <span className="text-[11px] font-black uppercase tracking-[0.5em] text-white/80">O Segredo da Escala Exponencial</span>
              </div>
              
              <h4 className="text-4xl md:text-6xl font-black tracking-tight text-white leading-tight">
                A verdadeira escala não nasce do esforço, mas da <span className="bg-gradient-to-r from-blue-400 via-pink-400 to-amber-400 bg-clip-text text-transparent">Eficiência da Blindagem</span>.
              </h4>
              
              <p className="text-lg md:text-xl text-slate-400 leading-relaxed font-medium">
                Sua ineficiência não é culpa sua, é a falta de um sistema. Ao dominar a separação entre <strong>PJ Operacional</strong> e <strong>PF Pró-labore</strong>, você atira pedras no inimigo da confusão patrimonial e forja a infraestrutura para sua migração para ME com lucro real e <strong>PF Investimentos</strong> em explosão.
              </p>
            </div>

            {/* Funcionalidade Brilhante: Audit de Explosão de Riqueza */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              
              {/* Coluna de Controle e Gatilhos */}
              <div className="lg:col-span-4 space-y-6 order-2 lg:order-1">
                <Card className="bg-white/5 border-white/10 backdrop-blur-2xl p-8 rounded-[32px] space-y-8 shadow-2xl relative overflow-hidden group/card">
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/20 blur-3xl rounded-full opacity-0 group-hover/card:opacity-100 transition-opacity" />
                  
                  <div className="space-y-4">
                    <h5 className="text-xs font-black text-white uppercase tracking-[0.3em]">Audit de Escala</h5>
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-black/50 border border-white/10">
                      <div className="flex items-center gap-3">
                        <Zap className={cn("w-5 h-5 transition-all duration-500", isEliteMode ? "text-amber-400 scale-125 drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]" : "text-slate-600")} />
                        <span className="text-xs font-black text-white uppercase tracking-widest">Modo Unicórnio</span>
                      </div>
                      <Switch 
                        checked={isEliteMode}
                        onCheckedChange={setIsEliteMode}
                        className="data-[state=checked]:bg-amber-400 scale-125"
                      />
                    </div>
                  </div>

                  {/* Resultados em Tempo Real */}
                  <div className="space-y-4">
                    <div className="p-5 rounded-2xl bg-pink-500/10 border border-pink-500/20 animate-in zoom-in duration-500">
                       <div className="flex items-center justify-between mb-1">
                         <span className="text-[9px] font-black text-pink-400 uppercase tracking-widest">Multiplicador de Riqueza</span>
                         <Trophy className="w-3.5 h-3.5 text-pink-400" />
                       </div>
                       <div className="text-3xl font-black text-white tracking-tighter">{isEliteMode ? wealthExplosion.multiplier + "x" : "1.0x"}</div>
                       <p className="text-[10px] text-slate-500 mt-2 font-medium">Potencial de crescimento do seu patrimônio pessoal.</p>
                    </div>

                    <div className="p-5 rounded-2xl bg-blue-500/10 border border-blue-500/20">
                       <div className="flex items-center justify-between mb-1">
                         <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Extra Anual (Elite)</span>
                         <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                       </div>
                       <div className="text-2xl font-black text-white tracking-tighter">{isEliteMode ? formatCurrency(wealthExplosion.annualGap) : "R$ 0"}</div>
                       <p className="text-[10px] text-slate-500 mt-2 font-medium">O valor que a ineficiência drena do seu bolso por ano.</p>
                    </div>
                  </div>

                  <div className="pt-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-tight">Disciplina gera Liberdade.</p>
                  </div>
                </Card>
              </div>

              {/* Coluna do Gráfico: A Visualização da Explosão */}
              <div className="lg:col-span-8 h-[500px] relative order-1 lg:order-2">
                <div className="absolute inset-0 bg-white/5 rounded-[48px] border border-white/10 shadow-inner backdrop-blur-md flex flex-col items-center justify-center">
                  
                  {/* Grid de Fundo Sofisticado */}
                  <div className="absolute inset-x-12 top-16 bottom-24 flex flex-col justify-between pointer-events-none opacity-10">
                    {[100, 75, 50, 25, 0].map((val) => (
                      <div key={val} className="flex items-center gap-6">
                        <span className="text-[10px] font-black text-white w-8">{val}%</span>
                        <div className="h-px flex-1 bg-white" />
                      </div>
                    ))}
                  </div>

                  {/* O Gráfico Doce e Transparente */}
                  <ResponsiveContainer width="90%" height="80%">
                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 30, bottom: 20 }}>
                      <defs>
                        <linearGradient id="gradBlue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#60a5fa" stopOpacity={0.6}/>
                          <stop offset="100%" stopColor="#60a5fa" stopOpacity={0.1}/>
                        </linearGradient>
                        <linearGradient id="gradYellow" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#fbbf24" stopOpacity={0.6}/>
                          <stop offset="100%" stopColor="#fbbf24" stopOpacity={0.1}/>
                        </linearGradient>
                        <linearGradient id="gradPink" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#f472b6" stopOpacity={0.6}/>
                          <stop offset="100%" stopColor="#f472b6" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <XAxis 
                        dataKey="name" 
                        stroke="transparent" 
                        tick={false}
                      />
                      <Tooltip 
                        cursor={{ fill: 'rgba(255,255,255,0.02)', radius: 40 }}
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-black/80 border border-white/20 p-6 rounded-[24px] shadow-2xl backdrop-blur-2xl">
                                <div className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 mb-3">{payload[0].payload.desc}</div>
                                <div className="text-xl font-black text-white">{payload[0].name}</div>
                                <div className="mt-3 flex items-center gap-2">
                                  <div className="text-3xl font-black text-primary">{payload[0].value.toFixed(1)}%</div>
                                  <div className="h-4 w-px bg-white/20" />
                                  <div className="text-[10px] font-black text-slate-400 uppercase">Impacto</div>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar dataKey="value" radius={[40, 40, 40, 40]} barSize={100} animationDuration={1500} animationEasing="ease-in-out">
                        {chartData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={index === 0 ? 'url(#gradBlue)' : index === 1 ? 'url(#gradYellow)' : 'url(#gradPink)'} 
                            className="transition-all duration-1000 filter drop-shadow-[0_0_30px_rgba(255,255,255,0.05)] hover:opacity-100 opacity-80"
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  
                  {/* Legendas Intuitivas e Doces */}
                  <div className="absolute bottom-12 inset-x-0 flex justify-around px-20">
                    {chartData.map((item, i) => (
                      <div key={i} className="text-center group/leg">
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-12 h-1.5 rounded-full shadow-lg transition-all duration-500 group-hover/leg:scale-x-125" style={{ backgroundColor: item.color }} />
                          <div className="text-xs font-black text-white uppercase tracking-widest">{item.name}</div>
                          <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{item.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Overlay de Interatividade */}
                  <div className="absolute top-8 right-12 flex items-center gap-2 text-[10px] font-black text-white/30 uppercase tracking-[0.4em]">
                    <MousePointer2 className="w-3 h-3" />
                    Explore os Pilares
                  </div>
                </div>
              </div>
            </div>

            {/* Manifesto de Encerramento */}
            <div className="pt-16 border-t border-white/5 text-center space-y-6">
              <h4 className="text-2xl md:text-3xl font-black text-white tracking-[0.2em] uppercase">
                O MEI é apenas o casulo. A <span className="text-primary italic">Eficiência</span> é o que libera o seu voo.
              </h4>
              <p className="text-xs text-slate-500 max-w-2xl mx-auto font-medium opacity-60 italic leading-relaxed">
                Você não está aqui para pagar boletos. Você está aqui para dominar sua infraestrutura financeira e construir riqueza geracional. A disciplina fiscal de hoje é a liberdade inegociável do amanhã.
              </p>
            </div>
          </div>
          
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.01] pointer-events-none">
             <Landmark className="w-[1000px] h-[1000px] text-white" />
          </div>
        </div>
      </section>

      {/* FAQ de Autoridade */}
      <section className="space-y-6 pt-16">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary/10 rounded-xl text-primary shadow-inner">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-headline font-bold text-xl tracking-tight">Perguntas de Blindagem</h3>
            <p className="text-xs text-muted-foreground font-medium mt-1">Respostas diretas para as dúvidas que travam o crescimento do MEI.</p>
          </div>
        </div>

        <Accordion type="single" collapsible className="w-full space-y-3">
          {FAQS_GUIDE.map((faq, idx) => (
            <AccordionItem key={idx} value={`faq-${idx}`} className="border rounded-2xl px-5 bg-card/40 shadow-sm hover:shadow-md transition-all hover:bg-card">
              <AccordionTrigger className="text-sm font-bold text-left hover:no-underline py-5 leading-relaxed group">
                <span className="group-hover:text-primary transition-colors">{faq.q}</span>
              </AccordionTrigger>
              <AccordionContent className="text-xs text-muted-foreground leading-relaxed pb-6 pt-2 font-medium">
                <div className="flex gap-4">
                  <div className="w-1 h-full bg-primary/20 rounded-full shrink-0" />
                  {faq.a}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </div>
  );
}
