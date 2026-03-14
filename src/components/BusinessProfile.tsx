
"use client"

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useBusiness } from "@/contexts/BusinessContext";
import { 
  Sparkles,
  Loader2,
  Zap,
  ShieldCheck,
  TrendingUp,
  Users,
  BarChart3,
  Rocket,
  Search,
  Target,
  HelpCircle,
  Briefcase,
  Settings2,
  Globe,
  Activity,
  ChevronRight,
  CheckCircle2
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { businessStrategyAdvice, type BusinessStrategyOutput } from "@/ai/flows/business-strategy-advice";
import { cn } from "@/lib/utils";

export function BusinessProfile() {
  const { businessData, updateBusinessData, toggleAiField } = useBusiness();
  const [loading, setLoading] = useState(false);
  const [strategy, setStrategy] = useState<BusinessStrategyOutput | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("mei-flow-business-strategy");
    if (saved) {
      try {
        setStrategy(JSON.parse(saved));
      } catch (e) {
        console.error("Erro ao carregar estratégia salva", e);
      }
    }
  }, []);

  const ramosCategorizados = {
    "Alimentação": ["Restaurante/Lanchonete", "Delivery de Comida", "Confeitaria/Padaria", "Bebidas"],
    "Comércio": ["Loja Física (Varejo)", "Revenda de Produtos", "Moda e Acessórios", "Cosméticos"],
    "Digital & E-commerce": ["Loja Virtual (Shopify/Nuvem)", "Infoprodutos (Cursos/Ebooks)", "Dropshipping", "Marketing de Afiliados"],
    "Serviços Presenciais": ["Estética e Beleza", "Oficina/Manutenção", "Saúde/Bem-estar", "Eventos"],
    "Serviços Online": ["Freelancer (Design/Dev)", "Consultoria/Mentoria", "Agência de Marketing", "Gestão de Tráfego"],
    "Indústria & Produção": ["Artesanato", "Pequena Indústria", "Confecção Própria"],
    "Outros": ["Transporte/Mobilidade", "Educação", "Outros Ramos"]
  };

  const modelos = ["B2B", "B2C", "B2B e B2C", "Marketplace"];
  const canaisOpcoes = ["Loja física", "E-commerce", "Redes sociais", "Marketplace", "Delivery", "Outros"];
  const desafios = ["Fluxo de caixa", "Carga tributária", "Concorrência", "Falta de clientes", "Gestão de tempo", "Dificuldade de formalização"];
  const metas = ["Aumentar faturamento", "Reduzir custos", "Melhorar gestão", "Formalizar-se", "Investir em marketing", "Expandir"];

  const toggleCanal = (canal: string) => {
    const current = businessData.canaisVenda || [];
    const next = current.includes(canal) 
      ? current.filter(c => c !== canal)
      : [...current, canal];
    updateBusinessData({ canaisVenda: next });
  };

  const getStrategy = async () => {
    setLoading(true);
    try {
      const filteredInput = {
        nomeNegocio: businessData.aiEnabledFields.nomeNegocio ? businessData.nomeNegocio : "[Ocultado]",
        ramo: businessData.aiEnabledFields.ramo ? businessData.ramo : "[Ocultado]",
        nicho: businessData.aiEnabledFields.nicho ? businessData.nicho : "[Ocultado]",
        modeloNegocio: businessData.aiEnabledFields.modeloNegocio ? businessData.modeloNegocio : "[Ocultado]",
        canaisVenda: businessData.aiEnabledFields.canaisVenda ? businessData.canaisVenda : [],
        ticketMedio: businessData.aiEnabledFields.ticketMedio ? businessData.ticketMedio : 0,
        numClientes: businessData.aiEnabledFields.numClientes ? businessData.numClientes : 0,
        desafio: businessData.aiEnabledFields.desafio ? businessData.desafio : "[Ocultado]",
        meta: businessData.aiEnabledFields.meta ? businessData.meta : "[Ocultado]",
      };

      const result = await businessStrategyAdvice(filteredInput);
      setStrategy(result);
      localStorage.setItem("mei-flow-business-strategy", JSON.stringify(result));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const FAQS_NEGOCIO = [
    {
      q: "O que é Ticket Médio e como calculá-lo?",
      a: "Ticket médio é o valor médio das vendas por cliente. Para calcular, divida o faturamento total do período pelo número de vendas ou clientes atendidos no mesmo intervalo."
    },
    {
      q: "O que significa o Modelo B2B e B2C?",
      a: "B2B (Business to Business) é quando seu foco é vender para outras empresas. B2C (Business to Consumer) é quando você vende diretamente para o consumidor final (pessoa física)."
    },
    {
      q: "Por que definir um Nicho é importante para a IA?",
      a: "O nicho permite que a IA compare seu negócio com benchmarks específicos. Um 'Fotógrafo' (ramo) tem estratégias diferentes de um 'Fotógrafo de Casamentos de Luxo' (nicho)."
    }
  ];

  const AiToggle = ({ field }: { field: string }) => (
    <Button
      variant="ghost"
      size="icon"
      onClick={(e) => {
        e.stopPropagation();
        toggleAiField(field);
      }}
      className={cn(
        "h-8 w-8 rounded-xl transition-all border",
        businessData.aiEnabledFields[field] 
          ? "text-primary bg-primary/10 border-primary/20 shadow-sm" 
          : "text-muted-foreground/30 border-transparent hover:text-primary/50"
      )}
    >
      <Sparkles className="h-4 w-4" />
    </Button>
  );

  return (
    <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Seção de Configuração Expansível */}
      <section className="space-y-4">
        <div className="flex items-center gap-3 px-1">
          <Settings2 className="w-5 h-5 text-primary" />
          <h3 className="font-headline font-bold text-lg tracking-tight">Configurações do Perfil</h3>
        </div>

        <Accordion type="single" collapsible className="w-full space-y-4">
          <AccordionItem value="fundacao" className="border rounded-2xl px-5 bg-card/40 shadow-sm hover:bg-card/60 transition-all">
            <AccordionTrigger className="hover:no-underline py-6">
              <div className="flex items-center gap-4 text-left">
                <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-xl">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm uppercase tracking-widest">Fundação</h4>
                  <p className="text-[10px] text-muted-foreground font-medium mt-0.5">Identidade, Ramo e Especialidade</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-8 pt-2 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Nome Comercial</Label>
                    <AiToggle field="nomeNegocio" />
                  </div>
                  <Input 
                    placeholder="Ex: Studio Criativo" 
                    value={businessData.nomeNegocio} 
                    onChange={(e) => updateBusinessData({ nomeNegocio: e.target.value })} 
                    className="h-11 bg-secondary/20 border-border/40" 
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Ramo de Atividade</Label>
                    <AiToggle field="ramo" />
                  </div>
                  <Select value={businessData.ramo} onValueChange={(val) => updateBusinessData({ ramo: val })}>
                    <SelectTrigger className="h-11 bg-secondary/20 border-border/40">
                      <SelectValue placeholder="Selecione o ramo" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(ramosCategorizados).map(([categoria, lista]) => (
                        <SelectGroup key={categoria}>
                          <SelectLabel className="text-[9px] font-bold uppercase text-primary/40 tracking-widest pt-2 pb-1">{categoria}</SelectLabel>
                          {lista.map((r) => <SelectItem key={r} value={r} className="text-sm">{r}</SelectItem>)}
                        </SelectGroup>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Nicho / Especialidade</Label>
                    <AiToggle field="nicho" />
                  </div>
                  <Input 
                    placeholder="Ex: Marketing para Médicos" 
                    value={businessData.nicho} 
                    onChange={(e) => updateBusinessData({ nicho: e.target.value })} 
                    className="h-11 bg-secondary/20 border-border/40" 
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Modelo Comercial</Label>
                    <AiToggle field="modeloNegocio" />
                  </div>
                  <Select value={businessData.modeloNegocio} onValueChange={(val) => updateBusinessData({ modeloNegocio: val })}>
                    <SelectTrigger className="h-11 bg-secondary/20 border-border/40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {modelos.map((m) => <SelectItem key={m} value={m} className="text-sm">{m}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="canais" className="border rounded-2xl px-5 bg-card/40 shadow-sm hover:bg-card/60 transition-all">
            <AccordionTrigger className="hover:no-underline py-6">
              <div className="flex items-center gap-4 text-left">
                <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm uppercase tracking-widest">Presença Digital</h4>
                  <p className="text-[10px] text-muted-foreground font-medium mt-0.5">Canais de Venda e Divulgação</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-8 pt-2">
              <div className="flex items-center justify-between mb-4 px-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Selecione onde você opera:</span>
                <AiToggle field="canaisVenda" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                {canaisOpcoes.map((canal) => (
                  <div 
                    key={canal} 
                    onClick={() => toggleCanal(canal)} 
                    className={cn(
                      "flex items-center justify-center p-3 rounded-xl border text-center cursor-pointer transition-all duration-300",
                      businessData.canaisVenda?.includes(canal) 
                        ? "bg-primary/10 border-primary/40 text-primary shadow-inner" 
                        : "bg-secondary/20 border-border/40 text-muted-foreground hover:border-border"
                    )}
                  >
                    <span className="text-[10px] font-black uppercase tracking-tight">{canal}</span>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="metricas" className="border rounded-2xl px-5 bg-card/40 shadow-sm hover:bg-card/60 transition-all">
            <AccordionTrigger className="hover:no-underline py-6">
              <div className="flex items-center gap-4 text-left">
                <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm uppercase tracking-widest">Operação & Métricas</h4>
                  <p className="text-[10px] text-muted-foreground font-medium mt-0.5">Resultados, Metas e Desafios</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-8 pt-2 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Ticket Médio (R$)</Label>
                    <AiToggle field="ticketMedio" />
                  </div>
                  <Input 
                    type="number" 
                    value={businessData.ticketMedio} 
                    onChange={(e) => updateBusinessData({ ticketMedio: parseFloat(e.target.value) || 0 })} 
                    className="h-11 bg-secondary/20 border-border/40 text-center font-bold" 
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Nº Clientes/Mês</Label>
                    <AiToggle field="numClientes" />
                  </div>
                  <Input 
                    type="number" 
                    value={businessData.numClientes} 
                    onChange={(e) => updateBusinessData({ numClientes: parseInt(e.target.value) || 0 })} 
                    className="h-11 bg-secondary/20 border-border/40 text-center font-bold" 
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Principal Gargalo</Label>
                    <AiToggle field="desafio" />
                  </div>
                  <Select value={businessData.desafio} onValueChange={(val) => updateBusinessData({ desafio: val })}>
                    <SelectTrigger className="h-11 bg-secondary/20 border-border/40 font-medium">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {desafios.map((d) => <SelectItem key={d} value={d} className="text-sm">{d}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Meta 12 Meses</Label>
                    <AiToggle field="meta" />
                  </div>
                  <Select value={businessData.meta} onValueChange={(val) => updateBusinessData({ meta: val })}>
                    <SelectTrigger className="h-11 bg-secondary/20 border-border/40 font-medium">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {metas.map((m) => <SelectItem key={m} value={m} className="text-sm">{m}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>

      {/* Seção de Auditoria Executiva */}
      <section className="space-y-6 pt-4">
        <Card className="border-border/50 bg-card/40 backdrop-blur-sm overflow-hidden rounded-2xl shadow-xl">
          <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1.5 text-center md:text-left">
              <h3 className="text-2xl font-headline font-bold tracking-tight">Consultoria Estratégica AI</h3>
              <p className="text-sm text-muted-foreground font-medium">Análise avançada de posicionamento e escala para o seu ramo.</p>
            </div>
            <Button 
              size="lg"
              onClick={getStrategy} 
              disabled={loading} 
              className="rounded-full gap-3 h-14 px-10 font-black uppercase tracking-[0.2em] text-[10px] shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {loading ? "Processando Auditoria..." : "Obter Auditoria Executiva"}
            </Button>
          </CardContent>
        </Card>

        {strategy && (
          <div className="space-y-8 animate-in fade-in zoom-in duration-700">
            <Card className="border-border/50 bg-card/60 backdrop-blur-xl overflow-hidden shadow-2xl rounded-3xl">
              <div className="p-8 space-y-8">
                <div className="flex items-center justify-between border-b border-border/50 pb-6">
                   <div className="flex items-center gap-3">
                     <div className="p-2 bg-primary/10 rounded-xl text-primary"><ShieldCheck className="w-5 h-5" /></div>
                     <h3 className="font-black text-sm uppercase tracking-[0.3em]">Veredito Estratégico</h3>
                   </div>
                   <Badge variant="outline" className="text-[9px] font-bold text-primary uppercase tracking-[0.2em] border-primary/20 bg-primary/5 px-3 py-1">Business Audit 1.0</Badge>
                </div>
                
                <div className="p-10 rounded-3xl bg-black/40 border border-primary/20 shadow-inner">
                  <p className="text-[11px] md:text-xs font-medium leading-relaxed text-white/90 tracking-tight text-justify italic">
                    "{strategy.verdict}"
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <section className="space-y-5">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-500/10 text-indigo-500 rounded-xl border border-indigo-500/20"><BarChart3 className="w-5 h-5" /></div>
                      <h4 className="font-black text-[10px] uppercase tracking-widest">Otimização de Canais</h4>
                    </div>
                    <div className="grid gap-3">
                      {strategy.channelStrategy.map((s, i) => (
                        <div key={i} className="flex gap-4 items-center p-4 rounded-2xl bg-card border border-border/50 shadow-sm">
                          <CheckCircle2 className="w-4 h-4 text-indigo-500 shrink-0" />
                          <p className="text-xs text-muted-foreground font-medium">{s}</p>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="space-y-5">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 text-primary rounded-xl border border-primary/20"><Rocket className="w-5 h-5" /></div>
                      <h4 className="font-black text-[10px] uppercase tracking-widest">Ações de Escala</h4>
                    </div>
                    <div className="grid gap-3">
                      {strategy.growthActions.map((a, i) => (
                        <div key={i} className="flex gap-4 items-center p-4 rounded-2xl bg-card border border-border/50 shadow-sm">
                          <TrendingUp className="w-4 h-4 text-primary shrink-0" />
                          <p className="text-xs text-muted-foreground font-medium">{a}</p>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="space-y-5">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-amber-500/10 text-amber-500 rounded-xl border border-amber-500/20"><Search className="w-5 h-5" /></div>
                      <h4 className="font-black text-[10px] uppercase tracking-widest">Benchmark do Nicho</h4>
                    </div>
                    <div className="grid gap-3">
                      {strategy.benchmarking.map((b, i) => (
                        <div key={i} className="flex gap-4 items-center p-4 rounded-2xl bg-card border border-border/50 shadow-sm">
                          <Users className="w-4 h-4 text-amber-500 shrink-0" />
                          <p className="text-xs text-muted-foreground font-medium">{b}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              </div>
            </Card>
          </div>
        )}
      </section>

      {/* FAQ de Autoridade */}
      <section className="space-y-6 pt-10 border-t border-border/30">
        <div className="flex items-center gap-3 px-1">
          <div className="p-2.5 bg-primary/10 rounded-xl text-primary shadow-inner">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-headline font-bold text-xl tracking-tight">Manual de Identidade</h3>
            <p className="text-xs text-muted-foreground font-medium mt-1">Esclarecimentos sobre o perfil e a inteligência estratégica do seu negócio.</p>
          </div>
        </div>

        <Accordion type="single" collapsible className="w-full space-y-3">
          {FAQS_NEGOCIO.map((faq, idx) => (
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
