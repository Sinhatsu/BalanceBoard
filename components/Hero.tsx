"use client";
import React from "react";
import { Button } from "./ui/button";
import Link from "next/link";
import { Sparkles, TrendingUp, Shield, Zap } from "lucide-react";

const Hero: React.FC = () => {
    return (
        <div className="relative pb-32 pt-20 px-4 overflow-hidden bg-grid-pattern">
            {/* Gradient Blob Background */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-primary/10 blur-[120px] rounded-full" />

            <div className="container mx-auto relative z-10">
                {/* Badge */}
                <div className="flex justify-center mb-8">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-black/80 border border-primary/20 shadow-sm backdrop-blur-sm">
                        <Sparkles className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium text-primary tracking-wide">
                            AI-Powered Finance Tracking
                        </span>
                    </div>
                </div>

                {/* Main heading */}
                <h1 className="text-5xl md:text-7xl font-extrabold text-center pb-8 text-foreground leading-[1.1] tracking-tight max-w-5xl mx-auto">
                    Master Your Money <br className="hidden md:block" />
                    <span className="bg-gradient-to-r from-primary to-emerald-600 bg-clip-text text-transparent">
                        with Intelligence
                    </span>
                </h1>

                <p className="text-xl text-muted-foreground text-center mb-12 max-w-2xl mx-auto leading-relaxed font-light">
                    Harness the power of AI to track expenses, scan receipts instantly,
                    and get personalized insights that help you save more and spend smarter.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row justify-center gap-4 mb-20">
                    <Link href="/dashboard">
                        <Button size="lg" className="px-8 py-7 text-lg rounded-full shadow-lg hover:shadow-primary/25 transition-all duration-300 hover:-translate-y-1">
                            Start Free Today
                        </Button>
                    </Link>
                    <Link href="#features">
                        <Button size="lg" variant="outline" className="px-8 py-7 text-lg rounded-full border-2 hover:bg-muted/50 backdrop-blur-sm">
                            See How It Works
                        </Button>
                    </Link>
                </div>

                {/* Dashboard Preview Card */}
                <div className="max-w-6xl mx-auto animate-float">
                    <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/20 dark:border-white/10 bg-white/40 dark:bg-black/40 backdrop-blur-xl">
                        {/* Window Controls */}
                        <div className="absolute top-4 left-6 flex gap-2 z-20">
                            <div className="w-3 h-3 rounded-full bg-red-400/80" />
                            <div className="w-3 h-3 rounded-full bg-yellow-400/80" />
                            <div className="w-3 h-3 rounded-full bg-green-400/80" />
                        </div>

                        <div className="p-8 pt-20 md:p-12 md:pt-24">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                <div className="bg-white/60 dark:bg-black/60 rounded-2xl p-6 border border-primary/10 shadow-sm">
                                    <div className="text-sm font-medium text-muted-foreground mb-2">Total Income</div>
                                    <div className="text-4xl font-bold text-primary tracking-tight">$12,450</div>
                                    <div className="text-sm mt-2 text-emerald-600 font-medium flex items-center gap-1">
                                        <TrendingUp className="h-4 w-4" />
                                        +12% this month
                                    </div>
                                </div>
                                <div className="bg-white/60 dark:bg-black/60 rounded-2xl p-6 border border-red-500/10 shadow-sm">
                                    <div className="text-sm font-medium text-muted-foreground mb-2">Total Expenses</div>
                                    <div className="text-4xl font-bold text-red-500 tracking-tight">$8,230</div>
                                    <div className="text-sm mt-2 text-red-500 font-medium flex items-center gap-1">
                                        <TrendingUp className="h-4 w-4 rotate-180" />
                                        -5% this month
                                    </div>
                                </div>
                                <div className="bg-white/60 dark:bg-black/60 rounded-2xl p-6 border border-emerald-500/10 shadow-sm">
                                    <div className="text-sm font-medium text-muted-foreground mb-2">Net Savings</div>
                                    <div className="text-4xl font-bold text-emerald-600 tracking-tight">$4,220</div>
                                    <div className="text-sm mt-2 text-emerald-600 font-medium flex items-center gap-1">
                                        <TrendingUp className="h-4 w-4" />
                                        +34% this month
                                    </div>
                                </div>
                            </div>

                            {/* Placeholder Chart Area */}
                            <div className="bg-white/50 dark:bg-black/50 rounded-2xl p-8 h-64 flex items-center justify-center border border-dashed border-primary/20 relative overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                <div className="text-center text-muted-foreground relative z-10">
                                    <TrendingUp className="h-16 w-16 mx-auto mb-4 text-primary/20" />
                                    <p className="text-lg font-medium">Interactive Financial Insights</p>
                                    <p className="text-sm opacity-70">Real-time data visualization appears here</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Hero;
