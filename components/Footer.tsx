import { Heart } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-background border-t border-border py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <p className="text-sm text-muted-foreground flex items-center gap-2 justify-center md:justify-start">
              Made with <Heart className="h-4 w-4 text-red-500 fill-red-500" /> by 
              <span className="font-semibold text-primary">
                Piyush
              </span>
            </p>
          </div>
          <div className="flex gap-6 text-sm">
            <a href="#features" className="text-muted-foreground hover:text-primary transition-colors">
              Features
            </a>
            <a href="#testimonials" className="text-muted-foreground hover:text-primary transition-colors">
              Testimonials
            </a>
          </div>
        </div>
        <div className="mt-6 pt-6 border-t border-border text-center">
          <p className="text-xs text-muted-foreground">
            © 2025 BalanceBoard. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
