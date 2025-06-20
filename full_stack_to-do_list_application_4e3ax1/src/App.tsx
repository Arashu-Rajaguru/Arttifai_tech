import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";
import { TodoApp } from "./components/TodoApp";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm h-16 flex justify-between items-center border-b shadow-sm px-4">
        <h2 className="text-xl font-semibold text-blue-600">📝 TaskMaster</h2>
        <Authenticated>
          <SignOutButton />
        </Authenticated>
      </header>
      <main className="flex-1 p-4">
        <Content />
      </main>
      <Toaster />
    </div>
  );
}

function Content() {
  const loggedInUser = useQuery(api.auth.loggedInUser);

  if (loggedInUser === undefined) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Authenticated>
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Welcome back, {loggedInUser?.email?.split('@')[0] ?? "friend"}! 👋
          </h1>
          <p className="text-gray-600">Manage your tasks efficiently and stay organized.</p>
        </div>
        <TodoApp />
      </Authenticated>
      
      <Unauthenticated>
        <div className="flex flex-col items-center justify-center min-h-[500px] text-center">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">📝 TaskMaster</h1>
            <p className="text-xl text-gray-600 mb-2">Your Personal Task Management Solution</p>
            <p className="text-gray-500">Sign in to start organizing your tasks and boost your productivity!</p>
          </div>
          <div className="w-full max-w-md">
            <SignInForm />
          </div>
        </div>
      </Unauthenticated>
    </div>
  );
}
