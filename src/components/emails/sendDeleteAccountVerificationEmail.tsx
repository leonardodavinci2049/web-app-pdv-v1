import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

const DeleteAccountConfirmationEmail = ({
  userName,
  confirmationUrl,
}: {
  userName?: string;
  confirmationUrl?: string;
}) => {
  return (
    <Html lang="pt" dir="ltr">
      <Tailwind>
        <Head />
        <Body className="bg-gray-100 font-sans py-10">
          <Container className="bg-white rounded-xl shadow-sm max-w-150 mx-auto p-10">
            {/* Header */}
            <Section className="text-center mb-8">
              <Text className="text-[28px] font-bold text-gray-900 m-0 mb-2">
                Confirmação de Exclusão da Conta
              </Text>
              <Text className="text-[16px] text-gray-600 m-0">
                Precisamos confirmar esta ação importante
              </Text>
            </Section>

            {/* Main Content */}
            <Section className="mb-8">
              <Text className="text-[18px] font-semibold text-gray-900 mb-4 m-0">
                Olá, {userName}!
              </Text>

              <Text className="text-[16px] text-gray-700 leading-6 mb-5 m-0">
                Recebemos uma solicitação para excluir permanentemente sua
                conta. Lamentamos vê-lo partir!
              </Text>

              <Text className="text-[16px] text-gray-700 leading-6 mb-5 m-0">
                <strong>⚠️ Atenção:</strong> Esta ação é irreversível. Todos os
                seus dados, configurações e histórico serão permanentemente
                removidos de nossos servidores.
              </Text>

              <Text className="text-[16px] text-gray-700 leading-6 mb-8 m-0">
                Para confirmar a exclusão da sua conta, clique no botão abaixo:
              </Text>

              {/* Confirmation Button */}
              <Section className="text-center mb-8">
                <Button
                  href={confirmationUrl}
                  className="bg-red-600 text-white px-8 py-4 rounded-xl text-[16px] font-semibold no-underline box-border hover:bg-red-700"
                >
                  Confirmar Exclusão da Conta
                </Button>
              </Section>

              <Text className="text-[14px] text-gray-600 leading-5 mb-5 m-0">
                Se você não solicitou a exclusão da sua conta, ignore este
                email. Sua conta permanecerá ativa e segura.
              </Text>

              <Text className="text-[14px] text-gray-600 leading-5 mb-5 m-0">
                <strong>Este link expira em 24 horas</strong> por motivos de
                segurança.
              </Text>
            </Section>

            <Hr className="border-gray-200 my-8" />

            {/* Footer */}
            <Section className="text-center">
              <Text className="text-[14px] text-gray-600 leading-5 mb-4 m-0">
                Caso tenha dúvidas, entre em contato com nossa equipe de
                suporte.
              </Text>

              <Text className="text-[14px] text-gray-600 leading-5 mb-4 m-0">
                Atenciosamente,
                <br />
                <strong>Equipe de Suporte</strong>
              </Text>

              <Text className="text-[12px] text-gray-500 leading-4 m-0">
                Rua das Flores, 123 - Centro
                <br />
                Natal, RN - CEP 59000-000
                <br />
                Brasil
              </Text>

              <Text className="text-[12px] text-gray-500 leading-4 mt-4 m-0">
                © {new Date().getFullYear()} Sua Empresa. Todos os direitos
                reservados.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default DeleteAccountConfirmationEmail;
