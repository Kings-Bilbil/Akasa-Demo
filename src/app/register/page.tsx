import LoginCardSection from "@/components/ui/login-signup";

export default async function Register({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return <LoginCardSection error={error} isRegister={true} />;
}
