"use client"

import { useState, useEffect } from "react";
import { useBusiness } from "@/contexts/BusinessContext";
import { calculateDasValue } from "@/lib/dasCalculator";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  FileText, 
  ShieldCheck, 
  ExternalLink, 
  Info, 
  CheckCircle2, 
  AlertTriangle,
  CreditCard,
  FileCheck,
  Building,
  Key,
  Globe,
  Youtube,
  GraduationCap,
  Rocket,
  LogOut,
  HeartHandshake,
  Calculator,
  RefreshCw,
  Clock,
  ClipboardCheck,
  AlertOctagon,
  DollarSign,
  CheckCircle,
  MapPin,
  Award,
  FileSpreadsheet,
  Archive,
  Users,
  Activity,
  Baby,
  Heart,
  Lock,
  Printer,
  Search,
  UserPlus,
  TrendingUp,
  HelpCircle,
  FilePlus
} from "lucide-react";
import { fetchUpdatedMeiGuide, type DynamicGuideContent } from "@/ai/flows/mei-guide-updater";

export function BureaucraticGuide() {
  const { businessData } = useBusiness();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("formalizacao");
  const [loadingUpdate, setLoadingUpdate] = useState<string | null>(null);
  const [dynamicContent, setDynamicContent] = useState<Record<string, { data: DynamicGuideContent, timestamp: number }>>({});

  const dasValue = calculateDasValue(businessData.ramo);

  useEffect(() => {
    const cache: Record<string, any> = {};
    const keys = [
      "antes-formalizar", "formalizacao", "impedimentos", "documentos", "capital-social", 
      "atividades-permitidas", "endereco", "ccmei", "pagamento-das", "relatorio-mensal", 
      "declaracao-anual", "emissao-nf", "arquivar-notas", "direitos-previdenciarios", 
      "aposentadoria", "auxilio-doenca", "salario-maternidade", "pensao-morte", 
      "auxilio-reclusao", "pgmei", "atualizacao-cadastral", "emissao-ccmei", 
      "consultar-debitos", "regularizar-debitos", "contratar-empregado", 
      "obrigacoes-trabalhistas", "desenquadramento", "baixa-mei", "faq-geral"
    ];
    keys.forEach(key => {
      const saved = localStorage.getItem(`mei-guide-cache-${key}`);
      if (saved) {
        try {
          cache[key] = JSON.parse(saved);
        } catch (e) { console.error(e); }
      }
    });
    setDynamicContent(cache);
  }, []);

  const handleUpdateGuide = async (topicId: string) => {
    setLoadingUpdate(topicId);
    try {
      const result = await fetchUpdatedMeiGuide(topicId, businessData);
      if (result.error) {
        toast({ 
          title: "Erro na Pesquisa", 
          description: "O agente de IA está ocupado. Tente novamente em instantes.", 
          variant: "destructive" 
        });
      } else {
        const entry = { data: result, timestamp: Date.now() };
        setDynamicContent(prev => ({ ...prev, [topicId]: entry }));
        localStorage.setItem(`mei-guide-cache-${topicId}`, JSON.stringify(entry));
        toast({ 
          title: "Guia Atualizado!", 
          description: "A IA sincronizou as informações mais recentes do governo." 
        });
      }
    } catch (error) {
      toast({ title: "Erro Inesperado", variant: "destructive" });
    } finally {
      setLoadingUpdate(null);
    }
  };

  const sections = [
    // FORMALIZAÇÃO E CADASTRO
    {
      id: "antes-formalizar",
      category: "Formalização",
      label: "Antes de Abrir",
      icon: <ClipboardCheck className="w-4 h-4" />,
      title: "O que saber antes de ser MEI",
      description: "Cuidados essenciais para não perder benefícios ou ter problemas municipais.",
      officialLink: "https://www.gov.br/empresas-e-negocios/pt-br/empreendedor/quero-ser-mei",
      steps: [
        "Verifique se você recebe benefícios (BPC, Seguro-desemprego, etc) que podem ser suspensos.",
        "Consulte a prefeitura sobre a viabilidade do endereço do negócio.",
        "Confira se sua atividade principal está na lista de permitidas (Anexo XI).",
        "Verifique se você não é sócio ou administrador de outra empresa."
      ],
      warning: "Servidores públicos federais não podem ser MEI. Servidores estaduais e municipais devem checar seus estatutos."
    },
    {
      id: "formalizacao",
      category: "Formalização",
      label: "Abrir MEI",
      icon: <FilePlus className="w-4 h-4" />,
      title: "Formalização Passo a Passo",
      description: "Como abrir seu CNPJ de forma 100% gratuita.",
      officialLink: "https://www.gov.br/empresas-e-negocios/pt-br/empreendedor/quero-ser-mei",
      steps: [
        "Acesse o Portal do Empreendedor e clique em 'Quero ser MEI'.",
        "Faça login com sua conta gov.br (Nível Prata ou Ouro).",
        "Preencha o formulário com dados pessoais e do negócio.",
        "Escolha as atividades (CNAEs) e o nome fantasia.",
        "Confirme as declarações e emita o CCMEI."
      ],
      warning: "Não pague taxas para abrir o MEI. O processo no portal gov.br é totalmente gratuito."
    },
    {
      id: "impedimentos",
      category: "Formalização",
      label: "Impedimentos",
      icon: <AlertOctagon className="w-4 h-4" />,
      title: "Quem não pode ser MEI",
      description: "Restrições legais para a formalização.",
      officialLink: "https://www.gov.br/empresas-e-negocios/pt-br/empreendedor/perguntas-frequentes",
      steps: [
        "Menores de 16 anos (ou menores de 18 não emancipados).",
        "Estrangeiros com visto provisório ou sem residência permanente.",
        "Pessoas que já possuem participação em outra empresa como sócio ou titular.",
        "Servidores públicos conforme legislação específica."
      ]
    },
    {
      id: "ccmei",
      category: "Formalização",
      label: "CCMEI",
      icon: <Award className="w-4 h-4" />,
      title: "Certificado do MEI",
      description: "Seu documento oficial de constituição empresarial.",
      officialLink: "https://www.gov.br/empresas-e-negocios/pt-br/empreendedor/servicos-para-mei/emissao-de-comprovante-ccmei",
      steps: [
        "Acesse o serviço de Emissão de Comprovante CCMEI.",
        "Informe seu CPF e Data de Nascimento.",
        "O documento substitui o Contrato Social e o Alvará.",
        "Guarde o PDF sempre atualizado para apresentar a bancos e fornecedores."
      ]
    },

    // OBRIGAÇÕES MENSAIS E ANUAIS
    {
      id: "pagamento-das",
      category: "Obrigações",
      label: "Pagar DAS",
      icon: <CreditCard className="w-4 h-4" />,
      title: "Guia Mensal DAS",
      description: "Sua única obrigação financeira fixa mensal.",
      officialLink: "https://www8.receita.fazenda.gov.br/simplesnacional/aplicacoes/atspo/pgmei.app/identificacao",
      steps: [
        "Acesse o PGMEI com seu CNPJ.",
        "Gere a guia mensal (DAS) até o dia 20 de cada mês.",
        "Pague via PIX (QR Code no boleto) ou código de barras.",
        "Mantenha o pagamento em dia para garantir seus benefícios do INSS."
      ],
      special: {
        label: "Cálculo 2026",
        value: `R$ ${dasValue.toFixed(2).replace('.', ',')}`,
        detail: `Baseado no Salário Mínimo de R$ 1.621,00 para ${businessData.ramo}`
      },
      warning: "O atraso gera multa diária de 0,33% e juros SELIC. Regularize débitos antigos para não perder o CNPJ."
    },
    {
      id: "relatorio-mensal",
      category: "Obrigações",
      label: "Relatório",
      icon: <FileSpreadsheet className="w-4 h-4" />,
      title: "Controle Mensal de Receitas",
      description: "Organização interna obrigatória para a declaração anual.",
      officialLink: "https://www.gov.br/empresas-e-negocios/pt-br/empreendedor/servicos-para-mei/declaracao-anual-de-faturamento",
      steps: [
        "Anote diariamente todas as vendas e serviços prestados.",
        "Preencha o modelo de Relatório Mensal até o dia 20 do mês seguinte.",
        "Anexe as notas fiscais de compras e vendas ao relatório.",
        "Mantenha arquivado por 5 anos para fiscalização."
      ]
    },
    {
      id: "declaracao-anual",
      category: "Obrigações",
      label: "DASN-SIMEI",
      icon: <FileCheck className="w-4 h-4" />,
      title: "Declaração Anual (DASN)",
      description: "Prestação de contas obrigatória até 31 de maio.",
      officialLink: "https://www.gov.br/empresas-e-negocios/pt-br/empreendedor/servicos-para-mei/declaracao-anual-de-faturamento",
      steps: [
        "Some o faturamento bruto total do ano anterior.",
        "Acesse o portal DASN-SIMEI entre 01/Jan e 31/Mai.",
        "Informe o valor total e se teve empregado.",
        "Imprima e guarde o recibo de entrega."
      ],
      warning: "A entrega fora do prazo gera multa mínima de R$ 50,00."
    },
    {
      id: "emissao-nf",
      category: "Obrigações",
      label: "Emitir NF",
      icon: <FileText className="w-4 h-4" />,
      title: "Nota Fiscal Eletrônica (NFS-e)",
      description: "Emissão obrigatória para vendas a outras empresas.",
      officialLink: "https://www.gov.br/empresas-e-negocios/pt-br/empreendedor/servicos-para-mei/nota-fiscal/nota-fiscal-de-servico-eletronica-nfs-e",
      steps: [
        "Acesse o Portal do Emissor Nacional de NFS-e.",
        "Cadastre seus dados e configure sua senha.",
        "Utilize a 'Emissão Simplificada' para serviços recorrentes.",
        "Lembre-se: Para Pessoa Física, a nota é opcional (exceto se solicitado)."
      ]
    },

    // DIREITOS E BENEFÍCIOS
    {
      id: "direitos-previdenciarios",
      category: "Direitos",
      label: "Direitos INSS",
      icon: <HeartHandshake className="w-4 h-4" />,
      title: "Cobertura Previdenciária",
      description: "Segurança para você e sua família ao pagar o DAS.",
      officialLink: "https://www.gov.br/empresas-e-negocios/pt-br/empreendedor",
      steps: [
        "Aposentadoria por idade (após 15 ou 20 anos de contribuição).",
        "Auxílio por incapacidade temporária (doença) - carência 12 meses.",
        "Salário-maternidade - carência 10 meses.",
        "Pensão por morte e Auxílio-reclusão para seus dependentes."
      ]
    },
    {
      id: "salario-maternidade",
      category: "Direitos",
      label: "Maternidade",
      icon: <Baby className="w-4 h-4" />,
      title: "Salário-maternidade MEI",
      description: "Benefício de 120 dias para gestantes e adotantes.",
      officialLink: "https://www.gov.br/empresas-e-negocios/pt-br/empreendedor",
      steps: [
        "Requerer após o nascimento ou adoção.",
        "Necessário ter 10 meses de contribuição em dia (carência).",
        "O pedido é feito diretamente pelo Meu INSS.",
        "Mantenha o pagamento do DAS durante o benefício para não interromper a contagem."
      ]
    },

    // SERVIÇOS ONLINE
    {
      id: "consultar-debitos",
      category: "Serviços",
      label: "Consultar Débitos",
      icon: <Search className="w-4 h-4" />,
      title: "Consulta de Pendências",
      description: "Verifique se há dívidas de DAS ou Declarações.",
      officialLink: "https://www8.receita.fazenda.gov.br/simplesnacional/aplicacoes/atspo/pgmei.app/identificacao",
      steps: [
        "Entre no PGMEI com seu CNPJ.",
        "Vá em 'Consulta Extrato/Pendências'.",
        "Verifique meses com DAS em aberto ou não gerados.",
        "Dívidas antigas podem estar em Dívida Ativa da União."
      ]
    },
    {
      id: "regularizar-debitos",
      category: "Serviços",
      label: "Regularizar Dívidas",
      icon: <AlertTriangle className="w-4 h-4" />,
      title: "Parcelamento de Débitos",
      description: "Opções para quitar dívidas acumuladas.",
      officialLink: "https://www8.receita.fazenda.gov.br/SimplesNacional/Aplicacoes/ATSPO/ParcelamentoMEI.app/Identificacao",
      steps: [
        "Acesse o portal do Simples Nacional.",
        "Solicite o parcelamento dos débitos apurados.",
        "O valor mínimo da parcela é de R$ 50,00.",
        "O parcelamento ajuda a evitar o cancelamento do CNPJ."
      ]
    },

    // CRESCIMENTO E TRANSIÇÃO
    {
      id: "desenquadramento",
      category: "Crescimento",
      label: "Sair do MEI",
      icon: <TrendingUp className="w-4 h-4" />,
      title: "Desenquadramento (Crescer)",
      description: "O que fazer quando seu faturamento supera 81k.",
      officialLink: "https://www.gov.br/empresas-e-negocios/pt-br/empreendedor/servicos-para-mei/desenquadramento-do-mei",
      steps: [
        "Procure um contador para auxiliar na migração para Microempresa (ME).",
        "Solicite o desenquadramento no portal do Simples Nacional.",
        "Ajuste seu regime tributário e capital social.",
        "Lembre-se que como ME você poderá faturar até 360k/ano."
      ]
    },
    {
      id: "baixa-mei",
      category: "Crescimento",
      label: "Encerrar MEI",
      icon: <LogOut className="w-4 h-4" />,
      title: "Baixa de Empresa",
      description: "Como fechar o CNPJ definitivamente.",
      officialLink: "https://www.gov.br/empresas-e-negocios/pt-br/empreendedor/servicos-para-mei/baixa-da-empresa",
      steps: [
        "Acesse 'Baixar MEI' no Portal do Empreendedor.",
        "Confirme a baixa e emita o Certificado de Baixa.",
        "Entregue a Declaração de Extinção (DASN-SIMEI especial).",
        "Quite os débitos restantes para não migrarem para o CPF."
      ]
    },

    // FAQ
    {
      id: "faq-geral",
      category: "Dúvidas",
      label: "FAQ Oficial",
      icon: <HelpCircle className="w-4 h-4" />,
      title: "Perguntas Frequentes",
      description: "As principais dúvidas respondidas pelo governo.",
      officialLink: "https://www.gov.br/empresas-e-negocios/pt-br/empreendedor/perguntas-frequentes",
      steps: [
        "O MEI precisa de alvará? (Não, dispensa é automática no aceite do termo).",
        "Servidor público pode ser MEI? (Depende da esfera - Federal não, outros ver estatuto).",
        "Pode ter mais de uma atividade? (Sim, 1 principal e até 15 secundárias).",
        "Quem recebe BPC pode ser MEI? (Sim, mas a renda do MEI conta para o limite do grupo familiar)."
      ]
    }
  ];

  const categories = ["Formalização", "Obrigações", "Direitos", "Serviços", "Crescimento", "Dúvidas"];

  const staticSection = sections.find(s => s.id === activeTab) || sections[0];
  const dynamicEntry = dynamicContent[activeTab];

  const content = {
    title: dynamicEntry?.data.title || staticSection.title,
    description: dynamicEntry?.data.description || staticSection.description,
    steps: dynamicEntry?.data.steps || staticSection.steps,
    warning: dynamicEntry?.data.warning || staticSection.warning,
    officialLink: dynamicEntry?.data.officialLink || staticSection.officialLink,
    special: dynamicEntry?.data.specialValue 
      ? { label: "Info IA", value: dynamicEntry.data.specialValue, detail: "Dados recentes sincronizados" }
      : staticSection.special,
    timestamp: dynamicEntry?.timestamp
  };

  const isUpdating = loadingUpdate === activeTab;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500/10 text-amber-500 rounded-2xl">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-headline font-bold">Guia MEI de Elite</h2>
            <p className="text-sm text-muted-foreground font-medium">Sua central de inteligência burocrática atualizada 2026.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {content.timestamp && (
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1 bg-secondary/50 rounded-full border border-border/50 text-[10px] text-muted-foreground font-bold uppercase tracking-tight">
              <Clock className="w-3 h-3" />
              Atualizado: {new Date(content.timestamp).toLocaleDateString()}
            </div>
          )}
          <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20 px-3 py-1 font-black text-[10px] tracking-widest uppercase">
            Versão 2026.2
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="space-y-6">
          <div className="overflow-x-auto no-scrollbar pb-2">
            <div className="flex flex-col gap-4">
              {categories.map(cat => (
                <div key={cat} className="space-y-2">
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 px-1">{cat}</div>
                  <div className="flex gap-2">
                    {sections.filter(s => s.category === cat).map(s => (
                      <TabsTrigger 
                        key={s.id} 
                        value={s.id} 
                        className="flex items-center gap-2 px-4 py-2 text-xs h-9 rounded-xl border border-border/50 data-[state=active]:bg-amber-500 data-[state=active]:text-white data-[state=active]:border-amber-500 transition-all whitespace-nowrap"
                      >
                        {s.icon}
                        <span>{s.label}</span>
                      </TabsTrigger>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-6">
            <Card className="border-border/50 shadow-xl overflow-hidden bg-card/60 backdrop-blur-sm">
              <CardHeader className="border-b bg-secondary/10">
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-1 min-w-0">
                    <CardTitle className="text-xl font-headline font-bold text-foreground truncate">{content.title}</CardTitle>
                    <CardDescription className="text-xs font-medium truncate">{content.description}</CardDescription>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="rounded-full h-8 w-8 hover:bg-amber-500/10 hover:text-amber-500 border-amber-500/20"
                      onClick={() => handleUpdateGuide(activeTab)}
                      disabled={isUpdating}
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isUpdating ? "animate-spin" : ""}`} />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-2 rounded-full text-[10px] font-black uppercase tracking-widest h-8"
                      onClick={() => window.open(content.officialLink, "_blank")}
                    >
                      <Globe className="w-3 h-3" />
                      Portal
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-8 space-y-8">
                {content.special && (
                  <div className="flex items-center gap-4 p-5 rounded-2xl bg-amber-500/5 border border-amber-500/20 group hover:bg-amber-500/10 transition-all">
                    <div className="p-3 bg-amber-500 text-white rounded-xl shadow-lg shadow-amber-500/20 group-hover:scale-110 transition-transform">
                      <CreditCard className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-amber-600/60">{content.special.label}</div>
                      <div className="text-2xl font-black text-amber-600">{content.special.value}</div>
                      <div className="text-[10px] font-medium text-muted-foreground">{content.special.detail}</div>
                    </div>
                  </div>
                )}

                <div className="space-y-6">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Protocolo de Ação</h4>
                  </div>
                  <div className="grid gap-4">
                    {content.steps.map((step: string, i: number) => (
                      <div key={i} className="flex gap-4 group">
                        <div className="w-6 h-6 rounded-full bg-secondary border border-border flex items-center justify-center text-[10px] font-bold shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                          {i + 1}
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed font-medium group-hover:text-foreground transition-colors">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {content.warning && (
                  <div className="flex gap-4 p-5 bg-destructive/5 border border-destructive/20 rounded-2xl">
                    <AlertTriangle className="w-5 h-5 text-destructive shrink-0" />
                    <p className="text-xs text-destructive/80 font-bold leading-relaxed">{content.warning}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-5 space-y-6">
            <Card className="border-border/50 bg-card/60 backdrop-blur-sm shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <Youtube className="w-4 h-4 text-red-500" />
                  <CardTitle className="text-sm font-bold uppercase tracking-widest">Suporte SEBRAE</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-0 border-t">
                <div className="aspect-video w-full bg-secondary/50 flex flex-col items-center justify-center p-8 text-center gap-3">
                  <Youtube className="w-8 h-8 text-muted-foreground/30" />
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-relaxed">
                    Vídeo tutorial em breve.<br />Consulte a playlist oficial do SEBRAE.
                  </p>
                  <Button variant="ghost" size="sm" className="text-[9px] font-black uppercase tracking-widest" onClick={() => window.open('https://www.youtube.com/playlist?list=PL6G1E3ZqVrYQh2QzH9vXKx0Fm1kL7lX7K', '_blank')}>Acessar Playlist</Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-dashed border-2 border-border/50 bg-transparent hover:bg-secondary/10 transition-all group">
              <CardContent className="p-6 text-center space-y-4">
                <div className="mx-auto w-12 h-12 rounded-full bg-secondary flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ExternalLink className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="space-y-1">
                  <h5 className="font-bold text-sm">Consultar Atividades Permitidas</h5>
                  <p className="text-[10px] text-muted-foreground font-medium">Verifique se sua ocupação pode ser MEI.</p>
                </div>
                <Button 
                  className="w-full rounded-xl h-11 font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20"
                  onClick={() => window.open("https://www.gov.br/mei/pt-br/consulta-classificacao-atividades", "_blank")}
                >
                  Lista de Atividades (CNAE)
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </Tabs>

      <section className="p-8 rounded-[40px] bg-secondary/20 border-2 border-dashed border-border/50 text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 border border-primary/20 rounded-full">
          <ShieldCheck className="w-3.5 h-3.5 text-primary" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Sincronização 2026 Ativa</span>
        </div>
        <h4 className="text-xl font-black tracking-tight">O sistema aprendeu algo novo?</h4>
        <p className="text-xs text-muted-foreground font-medium max-w-lg mx-auto">
          Utilize o botão de <RefreshCw className="inline w-3 h-3 text-amber-500" /> para forçar uma nova pesquisa da IA sobre qualquer tópico. O MEI Flow mantém um histórico das atualizações para sua segurança e conformidade.
        </p>
      </section>
      
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
