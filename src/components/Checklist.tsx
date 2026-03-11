
"use client"

import { useState, useEffect } from "react";
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
  Target,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Landmark,
  Wallet
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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

export function Checklist() {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

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

      {/* Protocolo Unicórnio - Manifesto de Excelência Reimagined */}
      <section className="relative group p-1 rounded-[40px] bg-gradient-to-br from-primary via-accent/50 to-indigo-600 shadow-2xl shadow-primary/20 overflow-hidden">
        <div className="bg-slate-950/90 backdrop-blur-3xl rounded-[39px] p-8 md:p-16 space-y-12 relative overflow-hidden">
          
          {/* Background FX */}
          <div className="absolute top-0 right-0 -mr-32 -mt-32 w-[600px] h-[600px] bg-primary/20 blur-[120px] rounded-full opacity-50 group-hover:opacity-100 transition-opacity duration-1000" />
          <div className="absolute bottom-0 left-0 -ml-32 -mb-32 w-96 h-96 bg-accent/20 blur-[100px] rounded-full opacity-30" />
          
          <div className="relative z-10 flex flex-col items-center text-center space-y-10">
            {/* Hero Icon */}
            <div className="relative">
              <div className="absolute inset-0 bg-primary blur-3xl opacity-40 animate-pulse" />
              <div className="relative w-28 h-28 rounded-[36px] bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground shadow-[0_0_50px_rgba(var(--primary),0.5)] transform group-hover:rotate-6 group-hover:scale-110 transition-all duration-500">
                <Zap className="w-14 h-14 fill-current" />
              </div>
            </div>

            {/* Header Content */}
            <div className="space-y-6 max-w-4xl">
              <div className="inline-flex items-center gap-3 px-6 py-2 bg-primary/10 border border-primary/20 rounded-full">
                <ShieldCheck className="w-4 h-4 text-primary" />
                <span className="text-[11px] font-black uppercase tracking-[0.4em] text-primary">Operação de Elite Unicórnio</span>
              </div>
              
              <h4 className="text-4xl md:text-6xl font-black tracking-tight text-white leading-tight">
                A Maestria da <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Gestão Blindada</span>
              </h4>
              
              <p className="text-lg md:text-xl text-slate-300 leading-relaxed font-medium">
                A verdadeira escala não nasce apenas do faturamento bruto, mas da <strong>Eficiência da Blindagem</strong>. Operar com processos de elite separa o amador do empresário que constrói riqueza real. 
              </p>
            </div>

            {/* Key Pillars Visualization */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
              <div className="group/card p-8 rounded-[32px] bg-white/5 border border-white/10 hover:bg-white/10 hover:border-primary/50 transition-all duration-500 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary mb-4 group-hover/card:scale-110 transition-transform">
                  <Landmark className="w-6 h-6" />
                </div>
                <h5 className="text-lg font-black text-white">PJ Operacional</h5>
                <p className="text-sm text-slate-400 leading-relaxed">Onde o oxigênio entra e a operação respira. Proteja-a como o coração do seu império.</p>
              </div>

              <div className="group/card p-8 rounded-[32px] bg-white/5 border border-white/10 hover:bg-white/10 hover:border-accent/50 transition-all duration-500 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-accent/20 flex items-center justify-center text-accent mb-4 group-hover/card:scale-110 transition-transform">
                  <Wallet className="w-6 h-6" />
                </div>
                <h5 className="text-lg font-black text-white">PF Pró-labore</h5>
                <p className="text-sm text-slate-400 leading-relaxed">Seu combustível pessoal. A separação que garante que o empresário nunca asfixie a empresa.</p>
              </div>

              <div className="group/card p-8 rounded-[32px] bg-white/5 border border-white/10 hover:bg-white/10 hover:border-indigo-500/50 transition-all duration-500 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4 group-hover/card:scale-110 transition-transform">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <h5 className="text-lg font-black text-white">PF Investimentos</h5>
                <p className="text-sm text-slate-400 leading-relaxed">O destino final. Onde o lucro vira liberdade e a escala se transforma em riqueza perene.</p>
              </div>
            </div>

            {/* Final Call to Action */}
            <div className="pt-8 space-y-6">
              <p className="text-base text-slate-400 max-w-3xl mx-auto italic">
                Ao dominar esta infraestrutura, você não está apenas cumprindo tarefas; está forjando o caminho para sua migração para ME com caixa robusto e patrimônio em constante crescimento.
              </p>
              <div className="text-2xl font-black text-white tracking-widest uppercase">
                Disciplina fiscal é a <span className="text-primary">liberdade</span> do amanhã.
              </div>
            </div>
          </div>
          
          {/* Subtle Watermark */}
          <div className="absolute bottom-0 right-0 p-12 opacity-[0.05] pointer-events-none">
             <Target className="w-64 h-64 text-white" />
          </div>
        </div>
      </section>

      {/* FAQ de Autoridade */}
      <section className="space-y-6 pt-6">
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
