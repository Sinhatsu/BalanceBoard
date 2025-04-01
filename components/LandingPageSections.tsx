import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  featuresData,
  howItWorksData,
  statsData,
  testimonialsData,
} from "@/data/landing";
import Image from "next/image";
import Link from "next/link";

export default function LandingPageSections() {
  return (
    <>
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {statsData.map((stat, index) => (
              <div key={index} className="text-center group p-6 rounded-2xl hover:bg-muted/50 transition-colors">
                <div className="text-4xl md:text-5xl font-bold text-primary mb-2 group-hover:scale-110 transition-transform duration-300 font-heading">
                  {stat.value}
                </div>
                <div className="text-sm md:text-base text-muted-foreground font-medium uppercase tracking-wide">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="py-24 px-4 bg-muted/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-50" />
        <div className="container mx-auto relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground font-heading tracking-tight">
              Powerful Features, <span className="text-primary">Simple Experience</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Everything you need to take control of your finances, powered by cutting-edge AI
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuresData.map((feature, index) => (
              <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden" key={index}>
                <CardContent className="space-y-6 pt-8 p-8">
                  <div className="p-4 bg-primary/10 rounded-2xl w-fit group-hover:bg-primary/20 transition-colors duration-300 text-primary">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-3 font-heading">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed text-base">{feature.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-4 bg-background">
        <div className="container mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-6 text-foreground font-heading">
            Get Started in Minutes
          </h2>
          <p className="text-center text-muted-foreground mb-20 text-xl max-w-2xl mx-auto">
            Three simple steps to financial clarity
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-6xl mx-auto">
            {howItWorksData.map((step, index) => (
              <div key={index} className="relative group">
                {index < howItWorksData.length - 1 && (
                  <div className="hidden md:block absolute top-16 left-[60%] w-full h-[2px] bg-gradient-to-r from-border to-transparent" />
                )}
                <div className="relative bg-card rounded-3xl p-8 shadow-sm group-hover:shadow-lg transition-all border border-border/50 h-full">
                  <div className="w-20 h-20 bg-primary/5 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-inner group-hover:bg-primary group-hover:text-white transition-all duration-300">
                    <div className="text-primary font-bold text-3xl font-heading group-hover:text-white transition-colors">
                      {index + 1}
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-center font-heading">{step.title}</h3>
                  <p className="text-muted-foreground text-center leading-relaxed text-lg">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="testimonials" className="py-24 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground font-heading">
              Loved by Thousands
            </h2>
            <p className="text-xl text-muted-foreground">
              See why people are switching to BalanceBoard
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {testimonialsData.map((testimonial, index) => (
              <Card key={index} className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 border-border/50 bg-card">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-emerald-400 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                <CardContent className="pt-10 p-8">
                  <div className="flex items-center mb-8">
                    <div className="relative">
                      <div className="absolute inset-0 bg-primary/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
                      <Image
                        src={testimonial.image}
                        alt={testimonial.name}
                        width={64}
                        height={64}
                        unoptimized
                        className="rounded-full border-2 border-background relative z-10"
                      />
                    </div>
                    <div className="ml-5">
                      <div className="font-bold text-xl font-heading">{testimonial.name}</div>
                      <div className="text-sm text-primary font-medium">
                        {testimonial.role}
                      </div>
                    </div>
                  </div>
                  <p className="text-muted-foreground leading-relaxed italic text-lg relative z-10">
                    "{testimonial.quote}"
                  </p>
                  <div className="flex gap-1 mt-6">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                      </svg>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-32 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-black/10 rounded-full blur-3xl" />

        <div className="container mx-auto text-center relative z-10">
          <h2 className="text-5xl md:text-7xl font-bold text-primary-foreground mb-8 font-heading tracking-tight">
            Ready to Master Your Money?
          </h2>
          <p className="text-2xl text-primary-foreground/90 mb-12 max-w-3xl mx-auto font-light">
            Join thousands already saving time and money with intelligent expense tracking
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link href="/dashboard">
              <Button
                size="lg"
                className="px-12 py-8 text-xl bg-white text-primary hover:bg-gray-50 shadow-2xl hover:shadow-white/20 transition-all font-bold rounded-full"
              >
                Get Started Free →
              </Button>
            </Link>
          </div>
          <p className="text-primary-foreground/70 text-sm mt-8 font-medium tracking-wide uppercase">
            No credit card required • Free forever
          </p>
        </div>
      </section>
    </>
  );
}
