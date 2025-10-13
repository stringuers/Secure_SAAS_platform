import { Shield, Lock, Eye, Code } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Shield,
      title: "HTTPS Encryption",
      description: "Watch how TLS encrypts all traffic between client and server using Wireshark packet analysis"
    },
    {
      icon: Lock,
      title: "Password Hashing",
      description: "See bcrypt in action - passwords are never stored in plain text, only secure hashes"
    },
    {
      icon: Eye,
      title: "JWT Authentication",
      description: "Learn how JSON Web Tokens enable stateless, secure user sessions across requests"
    },
    {
      icon: Code,
      title: "Live Demo",
      description: "Full-stack implementation with React frontend and Node.js HTTPS backend you can inspect"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iaHNsKDE5NSwgODUlLCA1NSUsIDAuMSkiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20" />
        
        <div className="relative container mx-auto px-4 py-24">
          <div className="flex flex-col items-center text-center space-y-8 max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 glow-primary">
              <Shield className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Security Education Platform</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
              Secure Authentication
              <span className="block text-gradient">SaaS Demo</span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl">
              Learn how HTTPS and JWT protect user credentials with live Wireshark packet capture demonstrations. 
              A hands-on security education tool for developers.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button 
                size="lg" 
                onClick={() => navigate("/register")}
                className="bg-primary hover:bg-primary/90 text-primary-foreground glow-primary transition-all"
              >
                Get Started
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => navigate("/login")}
                className="border-primary/30 hover:bg-primary/10"
              >
                Login
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">What You'll Learn</h2>
          <p className="text-muted-foreground text-lg">Understand security fundamentals through practical implementation</p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="p-6 bg-card border-border hover:border-primary/50 transition-all group">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Tech Stack Section */}
      <div className="container mx-auto px-4 py-24">
        <Card className="p-8 md:p-12 bg-card/50 backdrop-blur border-primary/20">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1">
              <h2 className="text-3xl font-bold mb-4">Built with Modern Security Standards</h2>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  React + TypeScript frontend with form validation
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  Node.js + Express backend with HTTPS
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  bcrypt password hashing (10 rounds)
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  JWT token-based authentication
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  Self-signed SSL certificates for local testing
                </li>
              </ul>
            </div>
            <div className="flex-1">
              <div className="bg-background/50 rounded-lg p-6 border border-border font-mono text-sm">
                <div className="text-accent mb-2">// Start the HTTPS server</div>
                <div className="text-foreground">$ npm install</div>
                <div className="text-foreground">$ npm run dev</div>
                <div className="text-muted-foreground mt-4">// Server running on</div>
                <div className="text-primary">https://localhost:3001</div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Index;
