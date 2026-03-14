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
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-16">
      <Card className="border-primary/20 bg-card/40 backdrop-blur-xl shadow-xl overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50" />
        <CardHeader className="pt-8 px-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/20 rounded-2xl text-primary shadow-lg shadow-primary/10"><Briefcase className="w-6 h-6" /></div>
            <div>
              <CardTitle className="text-xl font-headline font-bold">Identidade Estratégica</CardTitle>
              <CardDescription className="text-xs uppercase tracking-widest font-bold">Perfil do Negócio</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-6 pb-10 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="space-y-3">
                <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Nome do Negócio</Label>
                <Input placeholder="Ex: Minha Empresa MEI" value={businessData.nomeNegocio} onChange={(e) => updateBusinessData({ nomeNegocio: e.target.value })} className="h-12 bg-background/50 border-primary/20 rounded-xl font-bold" />
              </div>
              <div className="space-y-3">
                <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Ramo de Atividade</Label>
                <Select value={businessData.ramo} onValueChange={(val) => updateBusinessData({ ramo: val })}>
                  <SelectTrigger className="h-12 bg-background/50 border-primary/20 rounded-xl font-bold">
                    <SelectValue placeholder="Selecione o ramo" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(ramosCategorizados).map(([categoria, lista]) => (
                      <SelectGroup key={categoria}>
                        <SelectLabel className="text-[10px] font-black uppercase text-primary/60 tracking-widest pt-4 pb-2">{categoria}</SelectLabel>
                        {lista.map((r) => <SelectItem key={r} value={r} className="font-medium">{r}</SelectItem>)}
                      </SelectGroup>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-6">
              <div className="space-y-3">
                <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Nicho do Negócio (Ex: Moda Praia, Dev React)</Label>
                <div className="relative">
                  <Input placeholder="Qual seu público específico?" value={businessData.nicho} onChange={(e) => updateBusinessData({ nicho: e.target.value })} className="h-12 bg-background/50 border-primary/20 rounded-xl font-bold pl-10" />
                  <Target className="w-4 h-4 text-primary absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>
              <div className="space-y-3">
                <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Modelo de Negócio</Label>
                <Select value={businessData.modeloNegocio} onValueChange={(val) => updateBusinessData({ modeloNegocio: val })}>
                  <SelectTrigger className="h-12 bg-background/50 border-primary/20 rounded-xl font-bold"><SelectValue /></SelectTrigger>
                  <SelectContent>{modelos.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Canais de Venda Ativos</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {canaisOpcoes.map((canal) => (
                <div key={canal} onClick={() => toggleCanal(canal)} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${businessData.canaisVenda?.includes(canal) ? "bg-primary/10 border-primary/40 text-primary" : "bg-background/40 border-border/50"}`}>
                  <Checkbox checked={businessData.canaisVenda?.includes(canal)} />
                  <span className="text-xs font-bold">{canal}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            <div className="space-y-3">
              <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Ticket Médio (R$)</Label>
              <Input type="number" value={businessData.ticketMedio} onChange={(e) => updateBusinessData({ ticketMedio: parseFloat(e.target.value) || 0 })} className="h-12 bg-background/50 border-primary/20 rounded-xl font-bold" />
            </div>
            <div className="space-y-3">
              <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Clientes Ativos</Label>
              <Input type="number" value={businessData.numClientes} onChange={(e) => updateBusinessData({ numClientes: parseInt(e.target.value) || 0 })} className="h-12 bg-background/50 border-primary/20 rounded-xl font-bold" />
            </div>
            <div className="space-y-3">
              <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Maior Gargalo</Label>
              <Select value={businessData.desafio} onValueChange={(val) => updateBusinessData({ desafio: val })}>
                <SelectTrigger className="h-12 bg-background/50 border-primary/20 rounded-xl font-bold"><SelectValue /></SelectTrigger>
                <SelectContent>{desafios.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <section className="space-y-8 pt-4">
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-indigo-500/20 blur-xl opacity-50 group-hover:opacity-100 transition duration-1000"></div>
          <Card className="relative border-primary/30 bg-primary/5 overflow-hidden">
            <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="space-y-1">
                <h3 className="text-2xl font-headline font-black tracking-tight">Consultoria Estratégica AI</h3>
                <p className="text-sm text-muted-foreground font-medium">Análise avançada de posicionamento e escala para o seu ramo.</p>
              </div>
              <Button 
                size="lg"
                onClick={getStrategy} 
                disabled={loading} 
                className="rounded-full gap-3 shadow-xl shadow-primary/20 h-14 px-8 font-black uppercase tracking-widest text-xs"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
                Obter Auditoria Estratégica
              </Button>
            </CardContent>
          </Card>
        </div>

        {strategy && (
          <div className="space-y-6 animate-in fade-in zoom-in duration-500">
            <Card className="border-primary/20 bg-card overflow-hidden shadow-2xl">
              <div className="p-6 md:p-8 space-y-4">
                <div className="flex items-center justify-between">
                   <Badge variant="outline" className="text-[10px] font-black text-primary uppercase tracking-[0.2em] bg-primary/5 border-primary/20 px-3 py-1">Veredito do Consultor</Badge>
                   <ShieldCheck className="w-5 h-5 text-primary opacity-50" />
                </div>
                <div className="p-8 rounded-3xl bg-secondary/20 border border-primary/10 relative">
                  <p className="text-xs md:text-sm italic leading-relaxed text-foreground font-medium text-justify">
                    "{strategy.verdict}"
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-px bg-border/50">
                <div className="bg-card p-6 md:p-8 space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-indigo-500/10 text-indigo-500 rounded-xl"><BarChart3 className="w-5 h-5" /></div>
                    <h4 className="text-xs font-black uppercase tracking-widest">Otimização de Canais</h4>
                  </div>
                  <ul className="space-y-4">
                    {strategy.channelStrategy.map((s, i) => (
                      <li key={i} className="flex gap-3 items-start group">
                        <Zap className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                        <span className="text-xs text-muted-foreground font-medium group-hover:text-foreground transition-colors">{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-card p-6 md:p-8 space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-primary/10 text-primary rounded-xl"><Rocket className="w-5 h-5" /></div>
                    <h4 className="text-xs font-black uppercase tracking-widest">Ações de Escala</h4>
                  </div>
                  <ul className="space-y-4">
                    {strategy.growthActions.map((a, i) => (
                      <li key={i} className="flex gap-3 items-start group">
                        <TrendingUp className="w-4 h-4 text-primary shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                        <span className="text-xs text-muted-foreground font-medium group-hover:text-foreground transition-colors">{a}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-card p-6 md:p-8 space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-amber-500/10 text-amber-500 rounded-xl"><Search className="w-5 h-5" /></div>
                    <h4 className="text-xs font-black uppercase tracking-widest">Benchmarking</h4>
                  </div>
                  <ul className="space-y-4">
                    {strategy.benchmarking.map((b, i) => (
                      <li key={i} className="flex gap-3 items-start group">
                        <Users className="w-4 h-4 text-amber-500 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                        <span className="text-xs text-muted-foreground font-medium group-hover:text-foreground transition-colors">{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>
          </div>
        )}
      </section>

      <section className="space-y-6 pt-10 border-t border-border/50">
        <div className="flex items-center gap-3 px-1">
          <div className="p-2.5 bg-primary/10 rounded-xl text-primary shadow-inner">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-headline font-bold text-xl tracking-tight">Manual do Estrategista</h3>
            <p className="text-xs text-muted-foreground font-medium mt-1">Entenda os pilares que a IA utiliza para projetar o seu crescimento.</p>
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
