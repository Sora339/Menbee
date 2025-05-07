"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Calendar, Clock, Share2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const features = [
    {
      title: "Googleカレンダー連携",
      description:
        "あなたのGoogleカレンダーと連携して、既存の予定を自動的に避けた候補を提案します。",
      icon: <Calendar className="h-8 w-8" />,
    },
    {
      title: "最適な時間提案",
      description:
        "あなたの空き時間から最適な面接日程の候補リストを自動生成します。",
      icon: <Clock className="h-8 w-8" />,
    },
    {
      title: "簡単に共有",
      description: "生成された候補リストをリンクで簡単に共有できます。",
      icon: <Share2 className="h-8 w-8" />,
    },
  ];

  const steps = [
    {
      title: "Googleアカウントで連携",
      description:
        "あなたのGoogleカレンダーと連携して、既存の予定を確認します。",
    },
    {
      title: "期間と条件を設定",
      description: "面接候補日の期間と希望する時間帯を設定します。",
    },
    {
      title: "候補リストを取得",
      description: "空き時間から最適な面接日程の候補リストが自動生成されます。",
    },
    {
      title: "候補を共有",
      description: "生成された候補リストをコピーして簡単に共有できます。",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: isLoaded ? 1 : 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex flex-col"
    >
      {/* ヒーローセクション */}
      <section className="relative flex flex-col items-center justify-center min-h-[80vh] px-4 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-background to-background/80" />
        <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_center,rgba(var(--foreground-rgb),0.08),transparent_65%)]" />

        <div className="container mx-auto grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-6 text-center md:text-left">
            <motion.h1
              className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              面接日程調整を<span className="text-primary">シンプル</span>に
            </motion.h1>

            <motion.p
              className="text-xl text-muted-foreground max-w-xl mx-auto md:mx-0"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              あなたのGoogleカレンダーの予定を避けた最適な面接日程の候補リストを自動生成します。就活生の面接調整をスムーズに。
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <Link href="/login">
                <Button
                  size="lg"
                  className="group w-[200px] bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:shadow-lg"
                >
                  今すぐ始める
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                onClick={() => scrollToSection("how-it-works")}
                className="w-[200px]"
              >
                使い方を見る
              </Button>
            </motion.div>
          </div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Image
              src="/image/top.png"
              alt="google"
              width={1000}
              height={800}
              className="rounded-lg shadow-lg"
            />
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="relative mx-auto max-w-md"
        ></motion.div>
      </section>

      {/* 機能セクション */}
      <section id="features" className="py-20 px-4 bg-muted/50">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            主な機能
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <Card className="h-full">
                  <CardContent className="pt-6">
                    <div className="mb-4 text-primary">{feature.icon}</div>
                    <h3 className="text-xl font-semibold mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 使い方セクション */}
      <section id="how-it-works" className="py-20 px-4 text-white h-[450px]">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            使い方
          </h2>

          <div className="top-6 h-[2px] border relative" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-white mb-4 z-30">
                    {index + 1}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ユースケースセクション */}
      <section className="py-20 px-4 bg-muted/30 text-white">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            こんな方におすすめ
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="flex gap-4"
            >
              <div className="mt-1 text-primary">
                <CheckCircle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">就活中の学生</h3>
                <p className="text-muted/70">
                  複数の企業との面接日程を調整する必要がある就活生。自分の空き時間を簡単に把握し、効率的に面接日程を提案できます。
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              className="flex gap-4"
            >
              <div className="mt-1 text-primary">
                <CheckCircle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">採用担当者</h3>
                <p className="text-muted/70">
                  多くの候補者と面接日程を調整する採用担当者。候補者から提案された日程をまとめて管理できます。
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="flex gap-4"
            >
              <div className="mt-1 text-primary">
                <CheckCircle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">
                  忙しいビジネスパーソン
                </h3>
                <p className="text-muted/70">
                  スケジュールが詰まっているビジネスパーソン。空き時間を自動で見つけ出し、ミーティングの調整を効率化します。
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
              className="flex gap-4"
            >
              <div className="mt-1 text-primary">
                <CheckCircle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">フリーランス</h3>
                <p className="text-muted/70">
                  複数のクライアントとのミーティングを調整するフリーランサー。効率的に空き時間を提案できます。
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTAセクション */}
      <section className="py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-background to-background/80" />
        <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_center,rgba(var(--foreground-rgb),0.05),transparent_65%)]" />

        <div className="container max-w-4xl mx-auto text-center space-y-8">
          <motion.h2
            className="text-3xl md:text-4xl font-bold"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            面接日程の調整をもっと簡単に
          </motion.h2>

          <motion.p
            className="text-xl text-muted-foreground max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
          >
            今すぐ始めて、面接日程の調整ストレスから解放されましょう。
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <Link href="/login">
              <Button
                size="lg"
                className="group w-[200px] bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:shadow-lg"
              >
                今すぐ始める
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </motion.div>
  );
}
