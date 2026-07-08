import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/politica-de-privacidade")({
  head: () => ({
    meta: [
      { title: "Política de Privacidade — CampanhaFácil" },
      {
        name: "description",
        content:
          "Saiba como a CampanhaFácil coleta, usa e protege seus dados pessoais em conformidade com a LGPD.",
      },
    ],
  }),
  component: PoliticaPrivacidadePage,
});

function PoliticaPrivacidadePage() {
  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar ao início
        </Link>

        <h1 className="font-display text-3xl font-bold sm:text-4xl">Política de Privacidade</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Última atualização: julho de 2026 · Em conformidade com a <strong>LGPD (Lei nº 13.709/2018)</strong>
        </p>

        <div className="mt-8 max-w-none space-y-8 text-sm leading-relaxed text-foreground/90">

          <section>
            <h2 className="font-display text-xl font-semibold text-foreground mb-3">1. Quem somos (Controlador dos Dados)</h2>
            <p>
              A <strong>CampanhaFácil</strong> é a controladora dos dados pessoais coletados nesta plataforma,
              nos termos da Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018).
              Para dúvidas ou exercício de direitos, contate nosso Encarregado de Dados (DPO):
              <br />
              <strong>[dpo@campanhafacil.com.br — a preencher]</strong>
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-foreground mb-3">2. Dados Coletados</h2>
            <p className="mb-2">Coletamos os seguintes dados pessoais:</p>
            <ul className="list-disc pl-6 space-y-1.5">
              <li><strong>Dados de cadastro:</strong> nome completo, e-mail, CPF, telefone e senha (armazenada em hash);</li>
              <li><strong>Dados de participação:</strong> números adquiridos, valor pago, data e hora da transação;</li>
              <li><strong>Dados de navegação:</strong> endereço IP, tipo de dispositivo, páginas visitadas e tempo de sessão (via cookies);</li>
              <li><strong>Dados de comunicação:</strong> mensagens enviadas para nosso suporte.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-foreground mb-3">3. Finalidade do Tratamento</h2>
            <p className="mb-2">Os dados são tratados para as seguintes finalidades:</p>
            <ul className="list-disc pl-6 space-y-1.5">
              <li>Criação e gerenciamento de conta de usuário;</li>
              <li>Execução do contrato de prestação de serviços;</li>
              <li>Identificação do participante em campanhas e entrega de prêmios;</li>
              <li>Prevenção a fraudes e segurança da plataforma;</li>
              <li>Cumprimento de obrigações legais e regulatórias;</li>
              <li>Envio de comunicações sobre campanhas ativas (com consentimento);</li>
              <li>Melhoria contínua da plataforma por meio de análise de uso.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-foreground mb-3">4. Base Legal</h2>
            <p>
              O tratamento de dados é realizado com base nas seguintes hipóteses legais previstas na LGPD:
            </p>
            <ul className="list-disc pl-6 space-y-1.5 mt-2">
              <li><strong>Execução de contrato</strong> (art. 7º, V) — para processamento de participações;</li>
              <li><strong>Legítimo interesse</strong> (art. 7º, IX) — para prevenção a fraudes e segurança;</li>
              <li><strong>Obrigação legal</strong> (art. 7º, II) — para atendimento a autoridades competentes;</li>
              <li><strong>Consentimento</strong> (art. 7º, I) — para comunicações de marketing.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-foreground mb-3">5. Compartilhamento de Dados</h2>
            <p className="mb-2">
              Seus dados podem ser compartilhados com:
            </p>
            <ul className="list-disc pl-6 space-y-1.5">
              <li><strong>Organizadores de campanhas</strong> — apenas os dados necessários para identificação do ganhador (nome, contato);</li>
              <li><strong>Processadores de pagamento</strong> — parceiros responsáveis pela confirmação do PIX;</li>
              <li><strong>Autoridades públicas</strong> — quando exigido por lei, decisão judicial ou regulação;</li>
              <li><strong>Provedores de infraestrutura</strong> — servidores em nuvem com contratos de confidencialidade.</li>
            </ul>
            <p className="mt-2">
              Não vendemos nem comercializamos dados pessoais a terceiros.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-foreground mb-3">6. Retenção de Dados</h2>
            <p>
              Os dados são mantidos pelo período necessário ao cumprimento das finalidades listadas, respeitando prazos legais
              (ex: dados fiscais por 5 anos, conforme legislação tributária). Após, são excluídos ou anonimizados.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-foreground mb-3">7. Segurança da Informação</h2>
            <p>
              Adotamos medidas técnicas e administrativas para proteger seus dados, incluindo:
              criptografia em trânsito (HTTPS/TLS), armazenamento seguro de senhas (hash),
              controle de acesso por perfis e monitoramento de incidentes de segurança.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-foreground mb-3">8. Seus Direitos (LGPD, art. 18)</h2>
            <p className="mb-2">Você tem direito a:</p>
            <ul className="list-disc pl-6 space-y-1.5">
              <li><strong>Confirmação</strong> da existência de tratamento de seus dados;</li>
              <li><strong>Acesso</strong> aos dados que possuímos sobre você;</li>
              <li><strong>Correção</strong> de dados incompletos, inexatos ou desatualizados;</li>
              <li><strong>Anonimização, bloqueio ou eliminação</strong> de dados desnecessários;</li>
              <li><strong>Portabilidade</strong> dos dados a outro fornecedor de serviço;</li>
              <li><strong>Revogação do consentimento</strong> a qualquer momento;</li>
              <li><strong>Oposição</strong> ao tratamento realizado com base em legítimo interesse;</li>
              <li><strong>Petição</strong> à Autoridade Nacional de Proteção de Dados (ANPD).</li>
            </ul>
            <p className="mt-2">
              Para exercer esses direitos, envie e-mail para: <strong>[dpo@campanhafacil.com.br — a preencher]</strong>.
              Responderemos em até 15 dias úteis.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-foreground mb-3">9. Cookies</h2>
            <p>
              Utilizamos cookies essenciais para o funcionamento da plataforma (autenticação, sessão)
              e cookies analíticos para melhoria da experiência. Ao continuar usando a plataforma, você
              consente com o uso de cookies essenciais. Cookies analíticos podem ser recusados nas configurações
              do seu navegador.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-foreground mb-3">10. Alterações nesta Política</h2>
            <p>
              Esta Política pode ser atualizada periodicamente. Notificaremos mudanças relevantes por e-mail ou aviso
              na plataforma. Recomendamos revisão periódica.
            </p>
          </section>
        </div>

        <div className="mt-10 flex flex-wrap gap-4 text-sm text-muted-foreground border-t pt-6">
          <Link to="/termos-de-uso" className="hover:text-foreground transition-colors">
            ← Termos de Uso
          </Link>
          <Link to="/aviso-legal" className="hover:text-foreground transition-colors">
            Aviso Legal →
          </Link>
        </div>
      </main>
    </div>
  );
}
