import Link from "next/link";
import { Button } from "@/components/ui/button";

interface UnderDevelopmentProps {
  title?: string;
  message?: string;
  icon?: React.ReactNode;
  showAnimation?: boolean;
}

const UnderDevelopment: React.FC<UnderDevelopmentProps> = ({
  title = "Em Desenvolvimento",
  message = "Esta página está sendo cuidadosamente desenvolvida. Em breve, incríveis recursos serão criados para proporcionar uma experiência excepcional!",
  icon,
  showAnimation = true,
}) => {
  const defaultIcon = (
    <svg
      className="h-8 w-8 text-white"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-label="Em desenvolvimento"
    >
      <title>Em desenvolvimento</title>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="mx-auto max-w-md p-8 text-center">
        <div className="mb-6">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-indigo-600">
            {icon || defaultIcon}
          </div>
          <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
            {title}
          </h1>
          <div className="mx-auto h-1 w-20 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600"></div>
        </div>

        <div className="space-y-4">
          <p className="text-lg text-gray-600 dark:text-gray-300">
            🚧 Em Desenvolvimento
          </p>
          <p className="leading-relaxed text-gray-500 dark:text-gray-400">
            {message}
          </p>

          {showAnimation && (
            <div className="mt-6 flex items-center justify-center space-x-1">
              <div className="h-2 w-2 animate-bounce rounded-full bg-blue-500"></div>
              <div
                className="h-2 w-2 animate-bounce rounded-full bg-indigo-500"
                style={{ animationDelay: "0.1s" }}
              ></div>
              <div
                className="h-2 w-2 animate-bounce rounded-full bg-purple-500"
                style={{ animationDelay: "0.2s" }}
              ></div>
            </div>
          )}

          <div className="mt-8">
            <Button
              asChild
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
            >
              <Link href="/dashboard">Voltar ao Dashboard</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnderDevelopment;
