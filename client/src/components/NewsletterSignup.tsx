import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const emailSchema = z.object({
  email: z.string().email("Please enter a valid email address")
});

export default function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const { toast } = useToast();
  
  const subscribeNewsletter = useMutation({
    mutationFn: async (email: string) => {
      return apiRequest("POST", "/api/newsletter/subscribe", { email });
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "You've been subscribed to our newsletter.",
        variant: "default",
      });
      setEmail("");
    },
    onError: (error) => {
      toast({
        title: "Failed to subscribe",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    }
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      emailSchema.parse({ email });
      subscribeNewsletter.mutate(email);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Invalid email",
          description: error.errors[0].message,
          variant: "destructive",
        });
      }
    }
  };
  
  return (
    <section className="mt-12 bg-primary bg-opacity-5 rounded-xl p-8 text-center">
      <h2 className="text-2xl font-serif font-bold mb-2">Stay Informed with Our Daily Digest</h2>
      <p className="text-neutral-600 mb-6 max-w-2xl mx-auto">
        Get the top news stories and politician updates delivered to your inbox every morning.
      </p>
      <form 
        onSubmit={handleSubmit} 
        className="flex flex-col sm:flex-row max-w-md mx-auto"
      >
        <Input
          type="email"
          placeholder="Your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="flex-grow px-4 py-2 rounded-l-full sm:rounded-r-none rounded-r-full sm:mb-0 mb-2 border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
        <Button 
          type="submit"
          disabled={subscribeNewsletter.isPending}
          className="bg-primary text-white px-6 py-2 rounded-r-full sm:rounded-l-none rounded-l-full font-medium hover:bg-primary/90 transition-colors"
        >
          {subscribeNewsletter.isPending ? "Subscribing..." : "Subscribe"}
        </Button>
      </form>
    </section>
  );
}
