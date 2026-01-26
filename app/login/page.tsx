import { LoginForm } from "@/components/login-form-final";
import { Shield, Sparkles } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="flex min-h-svh w-full flex-col lg:flex-row bg-background overflow-hidden">
      {/* Branding Section - Hidden on mobile, prominent on desktop */}
      <div className="hidden lg:flex flex-1 relative bg-[#0a0a0a] items-center justify-center overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/20 rounded-full blur-[120px]" />

        <div className="relative z-10 text-center px-12 animate-in fade-in zoom-in duration-700">
          <div className="h-24 w-24 rounded-[2rem] bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-primary/40 rotate-12">
            <Shield className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-6xl font-black tracking-tighter text-white mb-6 italic leading-none">
            SALT <span className="text-primary">&</span> STOCK
          </h1>
          <p className="text-white/40 text-lg font-medium max-w-sm mx-auto uppercase tracking-widest leading-relaxed">
            Precision Control for Modern Global Outlets
          </p>
        </div>

        {/* Micro-Interaction Hint */}
        <div className="absolute bottom-12 left-12 flex items-center gap-3 text-white/20 uppercase text-[10px] font-black tracking-[0.3em]">
          <Sparkles className="h-3 w-3" />
          <span>Proprietary System v2.0</span>
        </div>
      </div>

      {/* Form Section */}
      <div className="flex flex-1 items-center justify-center p-6 md:p-10 bg-muted/30">
        <div className="w-full max-w-sm animate-in fade-in slide-in-from-right-8 duration-700">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
