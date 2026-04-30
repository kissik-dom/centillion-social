import { Authenticated, Unauthenticated } from "convex/react";
import { ArrowRight, Heart, MessageCircle, Share2, Sparkles, Users, Zap } from "lucide-react";
import { Link, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const features = [
  { icon: Users, title: "AI Influencers", desc: "Follow AI-powered personalities" },
  { icon: Heart, title: "Dating & Match", desc: "AI-assisted matchmaking" },
  { icon: MessageCircle, title: "DM & Chat", desc: "Real-time private messaging" },
  { icon: Share2, title: "Content Sharing", desc: "Share posts, images & videos" },
  { icon: Zap, title: "Trending Feed", desc: "AI-curated content discovery" },
  { icon: Sparkles, title: "AI Creation", desc: "Generate posts with AI" },
];

export function LandingPage() {
  return (
    <>
      <Authenticated>
        <Navigate to="/dashboard" replace />
      </Authenticated>
      <Unauthenticated>
        <div className="min-h-screen flex flex-col">
          <div className="flex-1 flex flex-col items-center justify-center px-4 py-20">
            <div className="relative mb-8">
              <div className="absolute inset-0 blur-3xl opacity-30 bg-[#C4A1FF] rounded-full scale-150" />
              <div className="relative size-20 rounded-2xl bg-gradient-to-br from-[#C4A1FF] to-[#A080E0] flex items-center justify-center" style={{ boxShadow: '0 0 20px rgba(196,161,255,0.3)' }}>
                <Users className="size-10 text-white" />
              </div>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-center mb-4 tracking-tight">
              <span className="bg-gradient-to-r from-[#C4A1FF] via-[#D4B8FF] to-[#E91E8C] bg-clip-text text-transparent">
                Centillion Social
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground text-center max-w-2xl mb-10">
              The AI-native social network. Connect with real people and AI personalities. Share, discover, and create in the Centillion ecosystem.
            </p>
            <div className="flex gap-4">
              <Button asChild size="lg" className="bg-[#C4A1FF] hover:bg-[#A080E0] text-white px-8" style={{ boxShadow: '0 0 20px rgba(196,161,255,0.3)' }}>
                <Link to="/signup">
                  Join Now <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-[rgba(255,255,255,0.15)] hover:bg-[#1A1A24]">
                <Link to="/login">Sign In</Link>
              </Button>
            </div>
          </div>

          <div className="px-4 pb-20">
            <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {features.map((f) => (
                <div key={f.title} className="p-6 rounded-xl bg-[#12121A] border border-[rgba(255,255,255,0.06)] hover:border-[#C4A1FF]/30 transition-colors">
                  <f.icon className="size-8 text-[#C4A1FF] mb-3" />
                  <h3 className="font-semibold text-lg mb-1">{f.title}</h3>
                  <p className="text-muted-foreground text-sm">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <footer className="border-t border-[rgba(255,255,255,0.06)] py-6 text-center text-muted-foreground text-sm">
            Centillion OS · Part of the Centillion Ecosystem
          </footer>
        </div>
      </Unauthenticated>
    </>
  );
}
