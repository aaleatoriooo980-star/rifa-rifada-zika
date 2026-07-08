import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/termos-de-uso")({
  head: () => ({
    meta: [
      { title: "Termos de Uso — CampanhaFácil" },
      {
        name: "description",
        content:
          "Leia os Termos de Uso da plataforma CampanhaFácil antes de utilizar nossos serviços.",
      },
    ],
  }),
  component: TermosDeUsoPage,
});

function TermosDeUsoPage() {
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

        <h1 className="font-display text-3xl font-bold sm:text-4xl">Termos de Uso</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Última atualização: julho de 2026
        </p>

        <div className="mt-8 max-w-none space-y-8 text-sm leading-relaxed text-foreground/90">

          <section>
            <h2 className="font-display text-xl font-semibold text-foreground mb-3">1. Definições e Natureza do Serviço</h2>
            <p className="mb-2">
              A <strong>CampanhaFácil</strong> é uma plataforma tecnológica de gestão de <strong>campanhas promocionais numeradas</strong>,
              disponibilizada exclusivamente como ferramenta de administração e controle operacional
              para estabelecimentos comerciais (pessoas físicas ou jurídicas), doravante denominados "<strong>Organizadores</strong>".
            </p>
            <p className="mb-2">
              A CampanhaFácil <strong>não realiza, não organiza e não é responsável</strong> por qualquer campanha promocional criada
              em sua plataforma. Toda e qualquer campanha é de responsabilidade exclusiva do Organizador que a criou.
            </p>
            <p>
              Os participantes finais das campanhas, denominados "<strong>Participantes</strong>", acessam a plataforma para
              visualizar e adquirir números em campanhas criadas pelos Organizadores.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-foreground mb-3">2. Responsabilidades do Organizador</h2>
            <p className="mb-2">Ao utilizar a plataforma como Organizador, você declara e se compromete a:</p>
            <ul className="list-disc pl-6 space-y-1.5">
              <li>Cumprir integralmente a legislação brasileira vigente, incluindo a <strong>Lei nº 5.768/1971</strong>, o <strong>Decreto nº 70.951/1972</strong> e as normas da <strong>Secretaria de Prêmios e Apostas (SPA)</strong> do Ministério da Fazenda.</li>
              <li>Obter, previamente ao lançamento de qualquer campanha, todas as autorizações governamentais necessárias perante os órgãos competentes.</li>
              <li>Ser o único responsável pela entrega dos prêmios prometidos, pela execução do resultado e pela prestação de contas aos participantes.</li>
              <li>Não utilizar a plataforma para fins ilegais, fraudulentos ou que configurem contravenção penal.</li>
              <li>Fornecer informações verídicas sobre os prêmios, datas e condições da campanha.</li>
              <li>Arcar com todos os tributos e encargos incidentes sobre as campanhas realizadas.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-foreground mb-3">3. Isenção de Responsabilidade da Plataforma</h2>
            <p className="mb-2">
              A CampanhaFácil atua exclusivamente como prestadora de serviço tecnológico (SaaS). Em nenhuma hipótese poderá ser responsabilizada por:
            </p>
            <ul className="list-disc pl-6 space-y-1.5">
              <li>Descumprimento pelo Organizador de obrigações legais ou fiscais;</li>
              <li>Não entrega ou entrega incorreta de prêmios;</li>
              <li>Fraudes ou irregularidades praticadas por Organizadores;</li>
              <li>Perdas financeiras dos Participantes decorrentes de campanhas ilegais ou fraudulentas;</li>
              <li>Conteúdo publicado pelos Organizadores nas páginas das campanhas.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-foreground mb-3">4. Cadastro e Conta de Usuário</h2>
            <p className="mb-2">
              Para utilizar a plataforma é necessário criar uma conta com informações verídicas, completas e atualizadas.
              O usuário é responsável pela confidencialidade de sua senha e por todas as atividades realizadas em sua conta.
            </p>
            <p>
              A CampanhaFácil reserva-se o direito de suspender ou encerrar contas que violem estes Termos, sem aviso prévio, a seu exclusivo critério.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-foreground mb-3">5. Pagamentos</h2>
            <p>
              Os pagamentos realizados pelos Participantes são processados diretamente entre o Participante e o Organizador
              via <strong>PIX</strong> ou outros meios disponibilizados pelo Organizador.
              A CampanhaFácil não coleta, não armazena e não intermedia valores financeiros entre as partes.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-foreground mb-3">6. Proibições</h2>
            <p className="mb-2">É expressamente proibido utilizar a plataforma para:</p>
            <ul className="list-disc pl-6 space-y-1.5">
              <li>Realizar rifas sem autorização prévia dos órgãos competentes;</li>
              <li>Simular vinculação com a Caixa Econômica Federal, Loteria Federal ou qualquer órgão governamental;</li>
              <li>Operar apostas de quota fixa (bets) sem licença do Ministério da Fazenda;</li>
              <li>Promover esquemas de pirâmide financeira ou captação ilegal de recursos;</li>
              <li>Realizar campanhas com prêmios ilícitos ou que violem a legislação vigente.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-foreground mb-3">7. Propriedade Intelectual</h2>
            <p>
              Todos os direitos sobre a marca, tecnologia, interfaces e conteúdos da CampanhaFácil são reservados.
              É vedada a reprodução, distribuição ou engenharia reversa da plataforma sem autorização escrita prévia.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-foreground mb-3">8. Alterações nos Termos</h2>
            <p>
              Estes Termos podem ser alterados a qualquer momento. Alterações significativas serão comunicadas por e-mail ou
              aviso na plataforma. O uso continuado após a notificação implica aceitação dos novos termos.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-foreground mb-3">9. Foro e Legislação Aplicável</h2>
            <p>
              Estes Termos são regidos pela legislação brasileira. Fica eleito o foro da comarca de [cidade/estado — a preencher]
              para dirimir quaisquer controvérsias, com renúncia a qualquer outro, por mais privilegiado que seja.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-foreground mb-3">10. Contato</h2>
            <p>
              Dúvidas sobre estes Termos: <strong>[contato@campanhafacil.com.br — a preencher]</strong>
            </p>
          </section>
        </div>

        <div className="mt-10 flex flex-wrap gap-4 text-sm text-muted-foreground border-t pt-6">
          <Link to="/politica-de-privacidade" className="hover:text-foreground transition-colors">
            Política de Privacidade →
          </Link>
          <Link to="/aviso-legal" className="hover:text-foreground transition-colors">
            Aviso Legal →
          </Link>
        </div>
      </main>
    </div>
  );
}
