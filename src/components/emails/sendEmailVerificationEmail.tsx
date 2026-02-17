import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

const EmailVerificationTemplate = ({
  user,
  url,
}: {
  user: { name?: string; email: string };
  url: string;
}) => {
  const previewText =
    "Verify your email address to complete your account setup";

  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-gray-100 font-sans py-10">
          <Container className="mx-auto bg-white rounded-xl shadow-sm max-w-150 px-8 py-10">
            {/* Header */}
            <Section className="text-center mb-8">
              <Heading className="text-[28px] font-bold text-gray-900 m-0 mb-2">
                Verify Your Email Address
              </Heading>
              <Text className="text-[16px] text-gray-600 m-0">
                Complete your account setup in just one click
              </Text>
            </Section>

            {/* Main Content */}
            <Section className="mb-8">
              <Text className="text-[16px] text-gray-800 mb-4 leading-6">
                {user.name ? `Hi ${user.name},` : "Hello,"}
              </Text>

              <Text className="text-[16px] text-gray-800 mb-6 leading-6">
                Thanks for signing up! We need to verify your email address{" "}
                <strong>{user.email}</strong> to complete your account setup and
                ensure the security of your account.
              </Text>

              <Text className="text-[16px] text-gray-800 mb-8 leading-6">
                Click the button below to verify your email address:
              </Text>

              {/* Verification Button */}
              <Section className="text-center mb-8">
                <Button
                  href={url}
                  className="bg-blue-600 text-white px-8 py-4 rounded-xl text-[16px] font-semibold no-underline box-border inline-block"
                >
                  Verify Email Address
                </Button>
              </Section>

              <Text className="text-[14px] text-gray-600 mb-6 leading-5">
                If the button above doesn't work, you can copy and paste the
                following link into your browser:
              </Text>

              <Text className="text-[14px] text-blue-600 break-all mb-8 bg-gray-50 p-4 rounded-[6px] border border-gray-200">
                {url}
              </Text>

              <Text className="text-[14px] text-gray-600 leading-5">
                This verification link will expire in 24 hours for security
                reasons. If you didn't create an account, you can safely ignore
                this email.
              </Text>
            </Section>

            {/* Security Notice */}
            <Section className="border-t border-gray-200 pt-6 mb-8">
              <Text className="text-[14px] text-gray-600 leading-5 mb-4">
                <strong>Security tip:</strong> Never share this verification
                link with anyone. Our team will never ask you for your password
                or verification links.
              </Text>
            </Section>

            {/* Footer */}
            <Section className="border-t border-gray-200 pt-6">
              <Text className="text-[12px] text-gray-500 leading-4 m-0 mb-2">
                This email was sent to {user.email}. If you have any questions,
                please contact our support team.
              </Text>

              <Text className="text-[12px] text-gray-500 leading-4 m-0 mb-2">
                © {new Date().getFullYear()} Your Company Name. All rights
                reserved.
              </Text>

              <Text className="text-[12px] text-gray-500 leading-4 m-0">
                123 Business Street, Suite 100, City, State 12345
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default EmailVerificationTemplate;
