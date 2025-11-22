import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Shield, LogOut, Key, User, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface UserData {
  id?: string;
  email: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<UserData | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!storedToken || !storedUser) {
      navigate("/login");
      return;
    }

    setToken(storedToken);
    setUser(JSON.parse(storedUser));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out"
    });
    navigate("/login");
  };

  if (!user || !token) {
    return null;
  }

  const decodeJWT = (token: string) => {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      const payload = JSON.parse(atob(parts[1]));
      return payload;
    } catch {
      return null;
    }
  };

  const jwtPayload = decodeJWT(token);

  return (
    <div className="min-h-screen bg-background">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iaHNsKDE5NSwgODUlLCA1NSUsIDAuMSkiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20" />

      <div className="relative container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Secure Dashboard</h1>
              <p className="text-sm text-muted-foreground">Authentication successful</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => navigate('/security-dashboard')}
              variant="outline"
              className="border-border hover:bg-primary/10 hover:text-primary hover:border-primary/50"
            >
              <Shield className="w-4 h-4 mr-2" />
              Security Monitor
            </Button>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="border-border hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
          {/* User Info Card */}
          <Card className="p-6 bg-card border-border">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-primary/10">
                <User className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-xl font-semibold">User Information</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground">Email</label>
                <p className="text-lg font-mono">{user.email}</p>
              </div>

              {user.id && (
                <div>
                  <label className="text-sm text-muted-foreground">User ID</label>
                  <p className="text-sm font-mono break-all text-foreground/80">{user.id}</p>
                </div>
              )}

              <div className="pt-4 border-t border-border">
                <div className="flex items-center gap-2 text-success">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">Authenticated Session</span>
                </div>
              </div>
            </div>
          </Card>

          {/* JWT Token Card */}
          <Card className="p-6 bg-card border-border">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-accent/10">
                <Key className="w-5 h-5 text-accent" />
              </div>
              <h2 className="text-xl font-semibold">JWT Token</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Token (Truncated)</label>
                <div className="bg-secondary/50 rounded-lg p-3 border border-border">
                  <code className="text-xs font-mono break-all text-primary">
                    {token.substring(0, 50)}...
                  </code>
                </div>
              </div>

              {jwtPayload && (
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Decoded Payload</label>
                  <div className="bg-secondary/50 rounded-lg p-3 border border-border">
                    <pre className="text-xs font-mono text-foreground/80 overflow-x-auto">
                      {JSON.stringify(jwtPayload, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Security Info Card */}
          <Card className="lg:col-span-2 p-6 bg-card/50 backdrop-blur border-primary/20">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Security Features Active
            </h2>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-success mb-2">
                  <CheckCircle className="w-4 h-4" />
                  <span className="font-medium">HTTPS Encryption</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  All traffic encrypted with TLS 1.3. Use Wireshark to verify packet encryption.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-success mb-2">
                  <CheckCircle className="w-4 h-4" />
                  <span className="font-medium">bcrypt Hashing</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Password hashed with bcrypt (10 rounds) before database storage.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-success mb-2">
                  <CheckCircle className="w-4 h-4" />
                  <span className="font-medium">JWT Authentication</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Stateless authentication using signed JSON Web Tokens.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
