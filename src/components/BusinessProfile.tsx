"use client"

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useBusiness } from "@/contexts/BusinessContext";
import { 
  Briefcase, 
  HelpCircle,
  Sparkles,
  Loader2,
  Zap,
  ShieldCheck,
  TrendingUp,
  Users,
  BarChart3,
  Rocket,
  Search,
  Target
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { businessStrategyAdvice, type BusinessStrategyOutput } from "@/ai/flows/business-strategy-advice";

export function BusinessProfile() {
  const { businessData, updateBusinessData } = useBusiness();
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
      const result = await businessStrategyAdvice({
        ...businessData
      });
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
      a: "Ticket médio é o valor médio das vendas. Some o faturamento do mês e divida pelo número de vendas. A IA usa esse dado para recomendar estratégias de aumento de valor por venda e otimização de preços."
    },
    {
      q: "O que significa B2B e B2C?",
      a: "B2B é quando você vende para outras empresas; B2C é quando vende para consumidor final. Se atende os dois, marque ambos. A IA considera isso para recomendar estratégias de relacionamento, prazos de pagamento e volume de vendas."
    },
    {
      q: "Como definir meu principal desafio?",
      a: "Selecione o desafio que mais impacta seu dia a dia. Se não tiver certeza, observe onde você gasta mais tempo ou tem mais dificuldade. A IA priorizará esse ponto nas recomendações."
    },
    {
      q: "Como escolher minha meta principal?",
      a: "Pense no que você mais deseja alcançar nos próximos meses. A IA usará essa meta para alinhar as sugestões (ex: se a meta é aumentar faturamento, as dicas serão voltadas para vendas)."
    }
  ];

  return (
    <div className="space-y-12 animate-in slide-in-from-bottom-4 duration-500 pb-16">
      <Card className="border-none bg-transparent shadow-none">
        <CardHeader className="px-0 pb-8">
          <div className="space-y-1">
            <CardTitle className="text-2xl font-headline font-bold tracking-tight">Identidade Estratégica</CardTitle>
            <CardDescription className="text-xs font-medium text-muted-foreground/60 uppercase tracking-[0.2em]">Configuração do Perfil do Negócio</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="px-0 space-y-12">
          {/* Sessão: Fundação */}
          <div className="space-y-8">
            <div className="flex items-center gap-2">
              <div className="h-px flex-1 bg-border/40" />
              <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-[0.3em]">Fundação</span>
              <div className="h-px flex-1 bg-border/40" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
              <div className="space-y-2.5">
                <Label className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest ml-1">Nome Comercial</Label>
                <Input 
                  placeholder="Nome da sua marca" 
                  value={businessData.nomeNegocio} 
                  onChange={(e) => updateBusinessData({ nomeNegocio: e.target.value })} 
                  className="h-11 bg-secondary/20 border-border/40 rounded-lg font-medium focus:ring-1 focus:ring-primary/40 transition-all" 
                />
              </div>

              <div className="space-y-2.5">
                <Label className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest ml-1">Ramo de Atividade</Label>
                <Select value={businessData.ramo} onValueChange={(val) => updateBusinessData({ ramo: val })}>
                  <SelectTrigger className="h-11 bg-secondary/20 border-border/40 rounded-lg font-medium">
                    <SelectValue placeholder="Selecione o ramo" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(ramosCategorizados).map(([categoria, lista]) => (
                      <SelectGroup key={categoria}>
                        <SelectLabel className="text-[10px] font-bold uppercase text-primary/40 tracking-widest pt-4 pb-2">{categoria}</SelectLabel>
                        {lista.map((r) => <SelectItem key={r} value={r} className="font-medium">{r}</SelectItem>)}
                      </SelectGroup>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2.5">
                <Label className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest ml-1">Nicho / Especialidade</Label>
                <Input 
                  placeholder="Ex: Consultoria para Médicos" 
                  value={businessData.nicho} 
                  onChange={(e) => updateBusinessData({ nicho: e.target.value })} 
                  className="h-11 bg-secondary/20 border-border/40 rounded-lg font-medium" 
                />
              </div>

              <div className="space-y-2.5">
                <Label className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest ml-1">Modelo Comercial</Label>
                <Select value={businessData.modeloNegocio} onValueChange={(val) => updateBusinessData({ modeloNegocio: val })}>
                  <SelectTrigger className="h-11 bg-secondary/20 border-border/40 rounded-lg font-medium">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {modelos.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Sessão: Canais */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="h-px flex-1 bg-border/40" />
              <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-[0.3em]">Presença Digital</span>
              <div className="h-px flex-1 bg-border/40" />
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {canaisOpcoes.map((canal) => (
                <div 
                  key={canal} 
                  onClick={() => toggleCanal(canal)} 
                  className={`flex items-center justify-center p-3 rounded-lg border text-center cursor-pointer transition-all duration-300 ${
                    businessData.canaisVenda?.includes(canal) 
                      ? "bg-primary/5 border-primary/40 text-primary" 
                      : "bg-transparent border-border/40 text-muted-foreground/60 hover:border-border"
                  }`}
                >
                  <span className="text-[11px] font-bold uppercase tracking-tighter">{canal}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Sessão: Métricas */}
          <div className="space-y-8">
            <div className="flex items-center gap-2">
              <div className="h-px flex-1 bg-border/40" />
              <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-[0.3em]">Operação</span>
              <div className="h-px flex-1 bg-border/40" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-2.5">
                <Label className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest ml-1">Ticket Médio (R$)</Label>
                <Input 
                  type="number" 
                  value={businessData.ticketMedio} 
                  onChange={(e) => updateBusinessData({ ticketMedio: parseFloat(e.target.value) || 0 })} 
                  className="h-11 bg-secondary/20 border-border/40 rounded-lg font-medium text-center" 
                />
              </div>
              <div className="space-y-2.5">
                <Label className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest ml-1">Base de Clientes</Label>
                <Input 
                  type="number" 
                  value={businessData.numClientes} 
                  onChange={(e) => updateBusinessData({ numClientes: parseInt(e.target.value) || 0 })} 
                  className="h-11 bg-secondary/20 border-border/40 rounded-lg font-medium text-center" 
                />
              </div>
              <div className="space-y-2.5">
                <Label className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest ml-1">Principal Gargalo</Label>
                <Select value={businessData.desafio} onValueChange={(val) => updateBusinessData({ desafio: val })}>
                  <SelectTrigger className="h-11 bg-secondary/20 border-border/40 rounded-lg font-medium">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {desafios.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <section className="space-y-8 pt-4">
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/10 to-indigo-500/10 blur-xl opacity-50 group-hover:opacity-100 transition duration-1000"></div>
          <Card className="relative border-border/50 bg-card/40 backdrop-blur-sm overflow-hidden rounded-2xl">
            <CardContent className="p-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="space-y-1 text-center md:text-left">
                <h3 className="text-xl font-headline font-bold tracking-tight">Audit Estratégico AI</h3>
                <p className="text-xs text-muted-foreground font-medium">Análise avançada de posicionamento e escala para o seu ramo.</p>
              </div>
              <Button 
                size="lg"
                onClick={getStrategy} 
                disabled={loading} 
                className="rounded-full gap-3 shadow-lg shadow-primary/10 h-12 px-8 font-bold uppercase tracking-widest text-[10px] transition-all hover:scale-105 active:scale-95"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Obter Auditoria
              </Button>
            </CardContent>
          </Card>
        </div>

        {strategy && (
          <div className="space-y-6 animate-in fade-in zoom-in duration-500">
            <Card className="border-border/50 bg-card/60 backdrop-blur-xl overflow-hidden shadow-2xl rounded-2xl">
              <div className="p-8 space-y-4">
                <div className="flex items-center justify-between">
                   <Badge variant="outline" className="text-[9px] font-bold text-primary/80 uppercase tracking-widest border-primary/20 bg-primary/5 px-2.5 py-1">Veredito Executivo</Badge>
                   <ShieldCheck className="w-4 h-4 text-primary/40" />
                </div>
                <div className="p-8 rounded-2xl bg-secondary/10 border border-border/40">
                  <p className="text-xs md:text-sm italic leading-relaxed text-foreground/90 font-medium text-justify">
                    "{strategy.verdict}"
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-px bg-border/40">
                <div className="bg-card/40 p-8 space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/5 text-indigo-500/80 rounded-lg"><BarChart3 className="w-4 h-4" /></div>
                    <h4 className="text-[10px] font-bold uppercase tracking-widest">Otimização de Canais</h4>
                  </div>
                  <ul className="space-y-4">
                    {strategy.channelStrategy.map((s, i) => (
                      <li key={i} className="flex gap-3 items-start group">
                        <Zap className="w-3.5 h-3.5 text-indigo-500/40 shrink-0 mt-0.5" />
                        <span className="text-[11px] text-muted-foreground font-medium group-hover:text-foreground transition-colors leading-relaxed">{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-card/40 p-8 space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/5 text-primary/80 rounded-lg"><Rocket className="w-4 h-4" /></div>
                    <h4 className="text-[10px] font-bold uppercase tracking-widest">Ações de Escala</h4>
                  </div>
                  <ul className="space-y-4">
                    {strategy.growthActions.map((a, i) => (
                      <li key={i} className="flex gap-3 items-start group">
                        <TrendingUp className="w-3.5 h-3.5 text-primary/40 shrink-0 mt-0.5" />
                        <span className="text-[11px] text-muted-foreground font-medium group-hover:text-foreground transition-colors leading-relaxed">{a}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-card/40 p-8 space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-500/5 text-amber-500/80 rounded-lg"><Search className="w-4 h-4" /></div>
                    <h4 className="text-[10px] font-bold uppercase tracking-widest">Benchmarking</h4>
                  </div>
                  <ul className="space-y-4">
                    {strategy.benchmarking.map((b, i) => (
                      <li key={i} className="flex gap-3 items-start group">
                        <Users className="w-3.5 h-3.5 text-amber-500/40 shrink-0 mt-0.5" />
                        <span className="text-[11px] text-muted-foreground font-medium group-hover:text-foreground transition-colors leading-relaxed">{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>
          </div>
        )}
      </section>

      <section className="space-y-6 pt-10 border-t border-border/30">
        <div className="flex items-center gap-3 px-1">
          <div className="p-2.5 bg-secondary/50 rounded-lg text-muted-foreground/60">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-headline font-bold text-lg tracking-tight">Manual Estratégico</h3>
            <p className="text-xs text-muted-foreground/60 font-medium">Entenda os pilares do seu posicionamento.</p>
          </div>
        </div>

        <Accordion type="single" collapsible className="w-full space-y-2">
          {FAQS_NEGOCIO.map((faq, idx) => (
            <AccordionItem key={idx} value={`faq-${idx}`} className="border rounded-xl px-5 bg-secondary/10 border-border/20 transition-all hover:bg-secondary/20">
              <AccordionTrigger className="text-xs font-bold text-left hover:no-underline py-4 leading-relaxed group">
                <span className="group-hover:text-primary/80 transition-colors">{faq.q}</span>
              </AccordionTrigger>
              <AccordionContent className="text-[11px] text-muted-foreground/80 leading-relaxed pb-4 pt-1 font-medium">
                <div className="flex gap-4">
                  <div className="w-0.5 h-auto bg-primary/10 rounded-full shrink-0" />
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
