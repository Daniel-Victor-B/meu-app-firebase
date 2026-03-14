
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
  HelpCircle
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
      // Filtra os dados com base nos toggles antes de enviar para a IA
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
      a: "Ticket médio é o valor médio das vendas. Some o faturamento do mês e divida pelo número de vendas."
    },
    {
      q: "O que significa B2B e B2C?",
      a: "B2B é quando você vende para outras empresas; B2C é quando vende para consumidor final."
    }
  ];

  const AiToggle = ({ field }: { field: string }) => (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => toggleAiField(field)}
      className={cn(
        "h-6 w-6 rounded-full transition-all",
        businessData.aiEnabledFields[field] 
          ? "text-primary bg-primary/10 shadow-[0_0_10px_rgba(34,197,94,0.2)]" 
          : "text-muted-foreground/30 hover:text-primary/50"
      )}
      title={businessData.aiEnabledFields[field] ? "Incluído na análise AI" : "Oculto para a IA"}
    >
      <Sparkles className="h-3 w-3" />
    </Button>
  );

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 pb-12">
      <Card className="border-none bg-transparent shadow-none">
        <CardHeader className="px-0 pb-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <CardTitle className="text-xl font-headline font-bold tracking-tight">Identidade Estratégica</CardTitle>
              <CardDescription className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-[0.2em]">Configuração do Perfil</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-0 space-y-8">
          {/* Sessão: Fundação */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-[0.3em] whitespace-nowrap">Fundação</span>
              <div className="h-px flex-1 bg-border/40" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between px-1">
                  <Label className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">Nome Comercial</Label>
                  <AiToggle field="nomeNegocio" />
                </div>
                <Input 
                  placeholder="Nome da sua marca" 
                  value={businessData.nomeNegocio} 
                  onChange={(e) => updateBusinessData({ nomeNegocio: e.target.value })} 
                  className="h-9 bg-secondary/20 border-border/40 text-sm" 
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between px-1">
                  <Label className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">Ramo de Atividade</Label>
                  <AiToggle field="ramo" />
                </div>
                <Select value={businessData.ramo} onValueChange={(val) => updateBusinessData({ ramo: val })}>
                  <SelectTrigger className="h-9 bg-secondary/20 border-border/40 text-sm">
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

              <div className="space-y-1.5">
                <div className="flex items-center justify-between px-1">
                  <Label className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">Nicho / Especialidade</Label>
                  <AiToggle field="nicho" />
                </div>
                <Input 
                  placeholder="Ex: Consultoria para Médicos" 
                  value={businessData.nicho} 
                  onChange={(e) => updateBusinessData({ nicho: e.target.value })} 
                  className="h-9 bg-secondary/20 border-border/40 text-sm" 
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between px-1">
                  <Label className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">Modelo Comercial</Label>
                  <AiToggle field="modeloNegocio" />
                </div>
                <Select value={businessData.modeloNegocio} onValueChange={(val) => updateBusinessData({ modeloNegocio: val })}>
                  <SelectTrigger className="h-9 bg-secondary/20 border-border/40 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {modelos.map((m) => <SelectItem key={m} value={m} className="text-sm">{m}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Sessão: Canais */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-3 flex-1">
                <span className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-[0.3em] whitespace-nowrap">Presença Digital</span>
                <div className="h-px flex-1 bg-border/40" />
              </div>
              <AiToggle field="canaisVenda" />
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
              {canaisOpcoes.map((canal) => (
                <div 
                  key={canal} 
                  onClick={() => toggleCanal(canal)} 
                  className={cn(
                    "flex items-center justify-center p-2 rounded-lg border text-center cursor-pointer transition-all duration-300",
                    businessData.canaisVenda?.includes(canal) 
                      ? "bg-primary/5 border-primary/40 text-primary" 
                      : "bg-transparent border-border/40 text-muted-foreground/60 hover:border-border"
                  )}
                >
                  <span className="text-[10px] font-bold uppercase tracking-tight">{canal}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Sessão: Métricas */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-[0.3em] whitespace-nowrap">Operação</span>
              <div className="h-px flex-1 bg-border/40" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between px-1">
                  <Label className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">Ticket Médio (R$)</Label>
                  <AiToggle field="ticketMedio" />
                </div>
                <Input 
                  type="number" 
                  value={businessData.ticketMedio} 
                  onChange={(e) => updateBusinessData({ ticketMedio: parseFloat(e.target.value) || 0 })} 
                  className="h-9 bg-secondary/20 border-border/40 text-center text-sm" 
                />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between px-1">
                  <Label className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">Clientes</Label>
                  <AiToggle field="numClientes" />
                </div>
                <Input 
                  type="number" 
                  value={businessData.numClientes} 
                  onChange={(e) => updateBusinessData({ numClientes: parseInt(e.target.value) || 0 })} 
                  className="h-9 bg-secondary/20 border-border/40 text-center text-sm" 
                />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between px-1">
                  <Label className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">Principal Gargalo</Label>
                  <AiToggle field="desafio" />
                </div>
                <Select value={businessData.desafio} onValueChange={(val) => updateBusinessData({ desafio: val })}>
                  <SelectTrigger className="h-9 bg-secondary/20 border-border/40 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {desafios.map((d) => <SelectItem key={d} value={d} className="text-sm">{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between px-1">
                  <Label className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">Meta</Label>
                  <AiToggle field="meta" />
                </div>
                <Select value={businessData.meta} onValueChange={(val) => updateBusinessData({ meta: val })}>
                  <SelectTrigger className="h-9 bg-secondary/20 border-border/40 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {metas.map((m) => <SelectItem key={m} value={m} className="text-sm">{m}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <section className="space-y-4 pt-2">
        <Card className="border-border/50 bg-card/40 backdrop-blur-sm overflow-hidden rounded-xl">
          <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-0.5 text-center sm:text-left">
              <h3 className="text-lg font-headline font-bold tracking-tight">Audit Estratégico AI</h3>
              <p className="text-[11px] text-muted-foreground font-medium">Análise avançada de posicionamento para o seu ramo.</p>
            </div>
            <Button 
              size="sm"
              onClick={getStrategy} 
              disabled={loading} 
              className="rounded-full gap-2 h-10 px-6 font-bold uppercase tracking-widest text-[10px]"
            >
              {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
              Obter Auditoria
            </Button>
          </CardContent>
        </Card>

        {strategy && (
          <div className="space-y-4 animate-in fade-in zoom-in duration-500">
            <Card className="border-border/50 bg-card/60 backdrop-blur-xl overflow-hidden shadow-xl rounded-xl">
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                   <Badge variant="outline" className="text-[9px] font-bold text-primary/80 uppercase tracking-widest border-primary/20 bg-primary/5 px-2 py-0.5">Veredito Executivo</Badge>
                   <ShieldCheck className="w-4 h-4 text-primary/40" />
                </div>
                <div className="p-4 rounded-xl bg-secondary/10 border border-border/40">
                  <p className="text-xs italic leading-relaxed text-foreground/90 font-medium text-justify">
                    "{strategy.verdict}"
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border/40">
                <div className="bg-card/40 p-6 space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-indigo-500/5 text-indigo-500/80 rounded-lg"><BarChart3 className="w-4 h-4" /></div>
                    <h4 className="text-[10px] font-bold uppercase tracking-widest">Canais</h4>
                  </div>
                  <ul className="space-y-3">
                    {strategy.channelStrategy.map((s, i) => (
                      <li key={i} className="flex gap-2 items-start group">
                        <Zap className="w-3 h-3 text-indigo-500/40 shrink-0 mt-0.5" />
                        <span className="text-[11px] text-muted-foreground font-medium group-hover:text-foreground leading-relaxed">{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-card/40 p-6 space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-primary/5 text-primary/80 rounded-lg"><Rocket className="w-4 h-4" /></div>
                    <h4 className="text-[10px] font-bold uppercase tracking-widest">Escala</h4>
                  </div>
                  <ul className="space-y-3">
                    {strategy.growthActions.map((a, i) => (
                      <li key={i} className="flex gap-2 items-start group">
                        <TrendingUp className="w-3 h-3 text-primary/40 shrink-0 mt-0.5" />
                        <span className="text-[11px] text-muted-foreground font-medium group-hover:text-foreground leading-relaxed">{a}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-card/40 p-6 space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-amber-500/5 text-amber-500/80 rounded-lg"><Search className="w-4 h-4" /></div>
                    <h4 className="text-[10px] font-bold uppercase tracking-widest">Benchmark</h4>
                  </div>
                  <ul className="space-y-3">
                    {strategy.benchmarking.map((b, i) => (
                      <li key={i} className="flex gap-2 items-start group">
                        <Users className="w-3 h-3 text-amber-500/40 shrink-0 mt-0.5" />
                        <span className="text-[11px] text-muted-foreground font-medium group-hover:text-foreground leading-relaxed">{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>
          </div>
        )}
      </section>

      <section className="space-y-4 pt-4 border-t border-border/30">
        <Accordion type="single" collapsible className="w-full space-y-2">
          {FAQS_NEGOCIO.map((faq, idx) => (
            <AccordionItem key={idx} value={`faq-${idx}`} className="border rounded-lg px-4 bg-secondary/10 border-border/20">
              <AccordionTrigger className="text-[11px] font-bold text-left hover:no-underline py-3">
                <span>{faq.q}</span>
              </AccordionTrigger>
              <AccordionContent className="text-[11px] text-muted-foreground/80 leading-relaxed pb-3">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </div>
  );
}
