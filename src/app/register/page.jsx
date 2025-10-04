// in src/app/register/page.jsx
import { CardTitle, CardDescription, CardHeader, CardContent, Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

const prisma = new PrismaClient();

export default function RegisterPage() {

  async function registerUser(formData) {
    "use server";

    const email = formData.get("email");
    const password = formData.get("password");

    // Basic validation
    if (!email || !password || typeof email !== "string" || typeof password !== "string") {
      console.error("Invalid form data");
      return;
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.error("User already exists");
      // In a real app, you'd want to show an error to the user
      return;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save the new user to the database
    await prisma.user.create({
      data: {
        email: email,
        password: hashedPassword,
        role: "EMPLOYEE",
      },
    });

    // Redirect to the login page after successful registration
    redirect("/login");
  }

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-100 dark:bg-gray-950">
      <Card className="mx-auto max-w-sm">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Register</CardTitle>
          <CardDescription>Enter your email and password to create an account</CardDescription>
        </CardHeader>
        <CardContent>
          {/* The form calls the server action directly */}
          <form action={registerUser} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" placeholder="m@example.com" required type="email" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" required type="password" />
            </div>
            <Button className="w-full" type="submit">
              Create Account
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}