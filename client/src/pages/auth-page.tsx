import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { insertUserSchema } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { z } from "zod";

// Assuming insertUserSchema is a zod schema, extend it to include email validation.
const updatedInsertUserSchema = insertUserSchema.extend({
  email: z.string().email("Invalid email address"),
});

export default function AuthPage() {
  const [_, setLocation] = useLocation();
  const { loginMutation, registerMutation, user } = useAuth();

  const form = useForm({
    resolver: zodResolver(updatedInsertUserSchema),
    defaultValues: {
      email: "",
      username: "",
      password: "",
    },
  });

  if (user) {
    setLocation("/");
    return null;
  }

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      <div className="flex items-center justify-center p-8">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
            <CardDescription>
              Sign in to access your AI strategy assistant
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit((data) => {
                    const isLoginTab = document.querySelector('[data-state="active"][data-value="login"]') !== null;
                    if (isLoginTab) {
                      const { email, password } = data;
                      loginMutation.mutate({ email, password });
                    } else {
                      registerMutation.mutate(data);
                    }
                  })}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <TabsContent value="login">
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={loginMutation.isPending}
                    >
                      Sign In
                    </Button>
                  </TabsContent>
                  <TabsContent value="register">
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={registerMutation.isPending}
                    >
                      Create Account
                    </Button>
                  </TabsContent>
                </form>
              </Form>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <div className="hidden md:flex flex-col justify-center p-8 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
        <h1 className="text-4xl font-bold mb-4">AI Strategy Assistant</h1>
        <p className="text-lg mb-8">
          Unlock the power of AI to generate business strategies, analyze competitors,
          and make data-driven decisions.
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-white/10 rounded-lg">
            <h3 className="font-semibold mb-2">Strategy Generation</h3>
            <p className="text-sm">
              Get AI-powered business strategy recommendations tailored to your needs
            </p>
          </div>
          <div className="p-4 bg-white/10 rounded-lg">
            <h3 className="font-semibold mb-2">Competitor Analysis</h3>
            <p className="text-sm">
              Analyze your competitors and understand market positioning
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}