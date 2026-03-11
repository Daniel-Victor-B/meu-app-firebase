
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
  Target
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

  const totalTasks = SECTIONS.reduce((acc, s) => acc + s.tasks.length, 0);
  const totalCompleted = Object.values(checkedItems).filter(Boolean).length;
  const globalProgress = (totalCompleted / totalTasks) * 100;

  const chartData = useMemo(() => {
    const das = 76;
    
    // Cenário Atual
    const currentCostsPct = fat > 0 ? ((custos + das) / fat) * 100 : 0;
    const currentSalaryPct = fat > 0 ? (prolabore / fat) * 100 : 0;
    const currentProfit = Math.max(0, fat - custos - das - prolabore);
    const currentProfitPct = fat > 0 ? (currentProfit / fat) * 100 : 0;

    // Cenário Elite (Benchmark 10% de custo)
    const eliteCosts = fat * 0.1;
    const eliteCostsPct = fat > 0 ? ((eliteCosts + das) / fat) * 100 : 10;
    const eliteProfit = Math.max(0, fat - eliteCosts - das - prolabore);
    const eliteProfitPct = fat > 0 ? (eliteProfit / fat) * 100 : 0;

    if (isEliteMode) {
      return [
        { name: 'PJ Operacional', value: eliteCostsPct, color: '#60a5fa', desc: 'Sustentação (Benchmark 10%)' },
        { name: 'PF Pró-labore', value: currentSalaryPct, color: '#fbbf24', desc: 'Sobrevivência (Seu Salário)' },
        { name: 'PF Investimentos', value: eliteProfitPct, color: '#f472b6', desc: 'Liberdade (Riqueza Real)' }
      ];
    }

    return [
      { name: 'PJ Operacional', value: currentCostsPct, color: '#60a5fa', desc: 'Sustentação (Seus Custos)' },
      { name: 'PF Pró-labore', value: currentSalaryPct, color: '#fbbf24', desc: 'Sobrevivência (Seu Salário)' },
      { name: 'PF Investimentos', value: currentProfitPct, color: '#f472b6', desc: 'Liberdade (Seu Lucro)' }
    ];
  }, [fat, custos, prolabore, isEliteMode]);

  const profitGap = useMemo(() => {
    const das = 76;
    const currentProfit = Math.max(0, fat - custos - das - prolabore);
    const eliteCosts = fat * 0.1;
    const eliteProfit = Math.max(0, fat - eliteCosts - das - prolabore);
    return Math.max(0, eliteProfit - currentProfit);
  }, [fat, custos, prolabore]);

  return (
    <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Header Premium com Painel de Comando */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-blue-500/20 blur-xl opacity-50"></div>
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
              <div className="text-right space-y-2 min-w-[150px]">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-primary">
                  <span>Domínio Total</span>
                  <span>{globalProgress.toFixed(0)}%</span>
                </div>
                <Progress value={globalProgress} className="h-2 shadow-inner" />
              </div>
            </div>
            
            {/* Dashboard Tático de Pilares */}
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
              Gestão Ágil: Clique nos pilares acima para navegar instantaneamente entre as seções.
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

      {/* Protocolo Unicórnio - Manifesto Visual de Elite */}
      <section className="relative group p-1 rounded-[48px] bg-gradient-to-br from-indigo-900 via-primary/40 to-pink-900 shadow-2xl overflow-hidden mt-16">
        <div className="bg-slate-950/95 backdrop-blur-3xl rounded-[47px] p-8 md:p-16 space-y-16 relative overflow-hidden">
          
          <div className="absolute top-0 right-0 -mr-40 -mt-40 w-[800px] h-[800px] bg-primary/10 blur-[150px] rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-1000" />
          
          <div className="relative z-10 flex flex-col items-center text-center space-y-12">
            
            <div className="space-y-8 max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-3 px-6 py-2 bg-primary/10 border border-primary/20 rounded-full animate-pulse">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-[11px] font-black uppercase tracking-[0.5em] text-primary">Operação de Elite Profissional</span>
              </div>
              
              <h4 className="text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
                A verdadeira escala não nasce apenas do faturamento bruto, mas da <span className="bg-gradient-to-r from-blue-400 via-pink-400 to-amber-400 bg-clip-text text-transparent">Eficiência da Blindagem</span>.
              </h4>
              
              <p className="text-lg md:text-xl text-slate-300 leading-relaxed font-medium">
                Operar com processos de elite separa o amador do empresário que constrói riqueza real. Ao dominar a separação entre <strong>PJ Operacional</strong> e <strong>PF Pró-labore</strong>, você não está apenas cumprindo tarefas; está forjando a infraestrutura que permitirá sua migração para ME com caixa robusto e <strong>PF Investimentos</strong> em constante crescimento.
              </p>
            </div>

            {/* Audit Unicórnio: Funcionalidade Brilhante */}
            <div className="w-full max-w-5xl mx-auto space-y-12">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                
                <div className="lg:col-span-4 space-y-4 text-left order-2 lg:order-1">
                  <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md space-y-6">
                    <div className="space-y-2">
                       <h5 className="text-xs font-black text-white uppercase tracking-[0.2em]">Audit de Eficiência</h5>
                       <p className="text-[10px] text-slate-400 leading-relaxed">Simule o impacto de uma estrutura de custos de 10% (Padrão Unicórnio) sobre o seu faturamento atual.</p>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/50 border border-white/10">
                       <div className="flex items-center gap-2">
                          <Zap className={cn("w-4 h-4 transition-colors", isEliteMode ? "text-amber-400" : "text-slate-500")} />
                          <span className="text-[10px] font-black text-white uppercase tracking-widest">Modo Elite</span>
                       </div>
                       <Switch 
                         checked={isEliteMode}
                         onCheckedChange={setIsEliteMode}
                         className="data-[state=checked]:bg-amber-400"
                       />
                    </div>

                    {isEliteMode && (
                      <div className="p-4 rounded-xl bg-amber-400/10 border border-amber-400/20 animate-in zoom-in duration-300">
                         <div className="text-[9px] font-black text-amber-400 uppercase tracking-widest mb-1">Riqueza Escondida</div>
                         <div className="text-lg font-black text-white">{formatCurrency(profitGap)}</div>
                         <p className="text-[8px] text-slate-400 mt-1 uppercase font-bold">Extra mensal ao otimizar custos</p>
                      </div>
                    )}
                  </div>

                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-blue-400 shadow-[0_0_8px_#60a5fa]" />
                      <span className="text-xs font-black text-white uppercase tracking-widest">PJ Operacional</span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-relaxed font-medium">Sustentação do negócio.</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-amber-400 shadow-[0_0_8px_#fbbf24]" />
                      <span className="text-xs font-black text-white uppercase tracking-widest">PF Pró-labore</span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-relaxed font-medium">Sua sobrevivência mensal.</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-pink-400 shadow-[0_0_8px_#f472b6]" />
                      <span className="text-xs font-black text-white uppercase tracking-widest">PF Investimentos</span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-relaxed font-medium">Sua riqueza e liberdade.</p>
                  </div>
                </div>

                <div className="lg:col-span-8 h-[400px] relative group/chart order-1 lg:order-2">
                  <div className="absolute inset-0 bg-white/5 rounded-[40px] border border-white/10 shadow-inner backdrop-blur-sm -z-10" />
                  
                  <div className="absolute inset-x-8 top-10 bottom-20 flex flex-col justify-between pointer-events-none opacity-20">
                    {[100, 75, 50, 25, 0].map((val) => (
                      <div key={val} className="flex items-center gap-4">
                        <span className="text-[9px] font-black text-white w-6">{val}%</span>
                        <div className="h-px flex-1 bg-white/50" />
                      </div>
                    ))}
                  </div>

                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 40, right: 60, left: 60, bottom: 40 }}>
                      <defs>
                        <linearGradient id="gradBlue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#60a5fa" stopOpacity={0.8}/>
                          <stop offset="100%" stopColor="#60a5fa" stopOpacity={0.2}/>
                        </linearGradient>
                        <linearGradient id="gradYellow" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#fbbf24" stopOpacity={0.8}/>
                          <stop offset="100%" stopColor="#fbbf24" stopOpacity={0.2}/>
                        </linearGradient>
                        <linearGradient id="gradPink" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#f472b6" stopOpacity={0.8}/>
                          <stop offset="100%" stopColor="#f472b6" stopOpacity={0.2}/>
                        </linearGradient>
                      </defs>
                      <XAxis 
                        dataKey="name" 
                        stroke="transparent" 
                        tick={false}
                      />
                      <Tooltip 
                        cursor={{ fill: 'rgba(255,255,255,0.03)', radius: 30 }}
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-slate-900/95 border border-white/20 p-5 rounded-3xl shadow-2xl backdrop-blur-2xl">
                                <div className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-2">{payload[0].payload.desc}</div>
                                <div className="text-xl font-black text-white">{payload[0].name}</div>
                                <div className="mt-2 text-2xl font-black text-primary">{payload[0].value.toFixed(1)}% <span className="text-[10px] font-medium text-muted-foreground uppercase">Participação</span></div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar dataKey="value" radius={[30, 30, 0, 0]} barSize={90} animationDuration={1000} animationEasing="ease-in-out">
                        {chartData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={index === 0 ? 'url(#gradBlue)' : index === 1 ? 'url(#gradYellow)' : 'url(#gradPink)'} 
                            className="transition-all duration-700 hover:opacity-100 opacity-70 filter drop-shadow-[0_0_20px_rgba(255,255,255,0.05)]"
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  
                  <div className="absolute bottom-10 inset-x-0 flex justify-around px-12 pointer-events-none">
                    {chartData.map((item, i) => (
                      <div key={i} className="text-center space-y-1">
                        <div className="text-[10px] font-black text-white uppercase tracking-widest opacity-80">{item.name}</div>
                        <div className="text-[8px] font-bold text-slate-500 uppercase tracking-[0.3em]">{item.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-12 border-t border-white/10 space-y-4">
                <div className="text-2xl md:text-3xl font-black text-white tracking-widest uppercase">
                  Disciplina fiscal é a <span className="text-primary italic">liberdade</span> do amanhã.
                </div>
                <p className="text-xs text-slate-400 max-w-2xl mx-auto font-medium opacity-80 italic">
                  O domínio desses três pilares é o que transformará seu CNPJ em um império. Mantenha os trilhos separados e a sua riqueza crescerá por conta própria.
                </p>
              </div>
            </div>
          </div>
          
          <div className="absolute bottom-0 right-0 p-16 opacity-[0.02] pointer-events-none scale-150">
             <Landmark className="w-96 h-96 text-white" />
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
