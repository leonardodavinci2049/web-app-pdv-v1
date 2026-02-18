import Image from "next/image";
import { Card } from "@/components/ui/card";
import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center p-4">
      {/* Card para telas grandes com formulário e imagem */}
      <Card className="bg-card/50 hidden w-full max-w-5xl overflow-hidden border-0 shadow-2xl backdrop-blur-sm lg:grid lg:h-[600px] lg:grid-cols-2">
        <div className="flex flex-col gap-4 p-6 md:p-10">
          <div className="flex flex-1 items-center justify-center">
            <div className="w-full max-w-sm">
              <LoginForm />
            </div>
          </div>
        </div>
        <div className="p-6 md:p-10">
          <div className="relative h-full w-full overflow-hidden rounded-lg">
            <Image
              src="/images/auth/banner-auth-v2.png"
              alt="Dashboard Background"
              fill
              className="object-contain object-left dark:hidden"
              priority
            />
            <Image
              src="/images/auth/banner-auth-v2.png"
              alt="Dashboard Background"
              fill
              className="hidden object-contain object-left dark:block"
              priority
            />
          </div>
        </div>
      </Card>

      {/* Formulário simples para telas menores */}
      <div className="w-full max-w-sm lg:hidden">
        <LoginForm />
      </div>
    </div>
  );
}
