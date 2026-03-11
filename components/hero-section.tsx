"use client";
import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { TextEffect } from "@/components/ui/text-effect";
import { AnimatedGroup } from "@/components/ui/animated-group";
import { HeroHeader } from "./header";
// background image lives in public/ and should be referenced by URL
import HeroLight from "@/public/screenshot-light.png";
import HeroDark from "@/public/screenshot-dark.png";
import ArcjetLogo from "@/public/arcjet.png";
import KindeLogo from "@/public/kinde.png";
import VercelLogo from "@/public/vercel.png";
import NeonLogo from "@/public/neondb.png";
import OrpcLogo from "@/public/orpc.png";
import PrismaLogo from "@/public/prisma.png";
import MotionLogo from "@/public/motion.png";
import OpenAiLogo from "@/public/openai.png";

const transitionVariants = {
  item: {
    hidden: {
      opacity: 0,
      filter: "blur(12px)",
      y: 12,
    },
    visible: {
      opacity: 1,
      filter: "blur(0px)",
      y: 0,
      transition: {
        type: "spring" as const,
        bounce: 0.3,
        duration: 1.5,
      },
    },
  },
};

export default function HeroSection() {
  return (
    <>
      <HeroHeader />
      <main className="overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 isolate hidden opacity-65 contain-strict lg:block"
        >
          <div className="w-140 h-320 -translate-y-87.5 absolute left-0 top-0 -rotate-45 rounded-full bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,hsla(0,0%,85%,.08)_0,hsla(0,0%,55%,.02)_50%,hsla(0,0%,45%,0)_80%)]" />
          <div className="h-320 absolute left-0 top-0 w-60 -rotate-45 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.06)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)] [translate:5%_-50%]" />
          <div className="h-320 -translate-y-87.5 absolute left-0 top-0 w-60 -rotate-45 bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.04)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)]" />
        </div>
        <section>
          <div className="relative pt-24 md:pt-36">
            <AnimatedGroup
              variants={{
                container: {
                  visible: {
                    transition: {
                      delayChildren: 1,
                    },
                  },
                },
                item: {
                  hidden: {
                    opacity: 0,
                    y: 20,
                  },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: {
                      type: "spring",
                      bounce: 0.3,
                      duration: 2,
                    },
                  },
                },
              }}
              className="mask-b-from-35% mask-b-to-90% absolute inset-0 top-56 -z-20 lg:top-32"
            >
              <div className="relative w-full h-screen">
                <Image
                  src="/night-background.png" // use public path directly
                  alt="night background"
                  fill
                  priority
                  className="object-cover"
                  sizes="100vw"
                />
              </div>
            </AnimatedGroup>

            <div
              aria-hidden
              className="absolute inset-0 -z-10 size-full [background:radial-gradient(125%_125%_at_50%_100%,transparent_0%,var(--color-background)_75%)]"
            />

            <div className="mx-auto max-w-7xl px-6">
              <div className="text-center sm:mx-auto lg:mr-auto lg:mt-0">
                <AnimatedGroup variants={transitionVariants}>
                  <Link
                    href="#link"
                    className="hover:bg-background dark:hover:border-t-border bg-muted group mx-auto flex w-fit items-center gap-4 rounded-full border p-1 pl-4 shadow-md shadow-zinc-950/5 transition-colors duration-300 dark:border-t-white/5 dark:shadow-zinc-950"
                  >
                    <span className="text-foreground text-sm">
                      Introducing New AI Features
                    </span>
                    <span className="dark:border-background block h-4 w-0.5 border-l bg-white dark:bg-zinc-700"></span>

                    <div className="bg-background group-hover:bg-muted size-6 overflow-hidden rounded-full duration-500">
                      <div className="flex w-12 -translate-x-1/2 duration-500 ease-in-out group-hover:translate-x-0">
                        <span className="flex size-6">
                          <ArrowRight className="m-auto size-3" />
                        </span>
                        <span className="flex size-6">
                          <ArrowRight className="m-auto size-3" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </AnimatedGroup>

                <TextEffect
                  preset="fade-in-blur"
                  speedSegment={0.3}
                  as="h1"
                  className="mx-auto mt-8 max-w-4xl text-balance text-5xl max-md:font-semibold md:text-7xl lg:mt-16 xl:text-[5.25rem]"
                >
                  The AI-ready home for team communication
                </TextEffect>
                <TextEffect
                  per="line"
                  preset="fade-in-blur"
                  speedSegment={0.3}
                  delay={0.5}
                  as="p"
                  className="mx-auto mt-8 max-w-2xl text-balance text-lg"
                >
                  TeamFlow organizes conversations into channels with threads,
                  is realtime, and uses AI to keep teams in sync.
                </TextEffect>

                <AnimatedGroup
                  variants={{
                    container: {
                      visible: {
                        transition: {
                          staggerChildren: 0.05,
                          delayChildren: 0.75,
                        },
                      },
                    },
                    ...transitionVariants,
                  }}
                  className="mt-12 flex flex-col items-center justify-center gap-2 md:flex-row"
                >
                  <div
                    key={1}
                    className="bg-foreground/10 rounded-[calc(var(--radius-xl)+0.125rem)] border p-0.5 gap-5"
                  >
                    <Button
                      size="lg"
                      className="rounded-xl px-5 text-base"
                      render={<Link href="#link" />}
                      nativeButton={false}
                    >
                      <span className="text-nowrap">Get Started</span>
                    </Button>
                  </div>
                  <Button
                    key={2}
                    size="lg"
                    variant="secondary"
                    className="h-10.5 rounded-xl px-5"
                    render={<Link href="#link" />}
                    nativeButton={false}
                  >
                    <span className="text-nowrap">Request a demo</span>
                  </Button>
                </AnimatedGroup>
              </div>
            </div>

            <AnimatedGroup
              variants={{
                container: {
                  visible: {
                    transition: {
                      staggerChildren: 0.05,
                      delayChildren: 0.75,
                    },
                  },
                },
                ...transitionVariants,
              }}
            >
              <div className="mask-b-from-55% relative -mr-56 mt-8 overflow-hidden px-2 sm:mr-0 sm:mt-12 md:mt-20">
                <div className="inset-shadow-2xs ring-background dark:inset-shadow-white/20 bg-background relative mx-auto max-w-6xl overflow-hidden rounded-2xl border p-4 shadow-lg shadow-zinc-950/15 ring-1">
                  <Image
                    className="bg-background aspect-15/8 relative hidden rounded-2xl dark:block object-contain object-top"
                    src={HeroDark}
                    alt="app screen"
                    width="2700"
                    height="1440"
                  />
                  <Image
                    className="z-2 border-border/25 aspect-15/8 relative rounded-2xl border dark:hidden object contain object-top"
                    src={HeroLight}
                    alt="app screen"
                    width="2700"
                    height="1440"
                  />
                </div>
              </div>
            </AnimatedGroup>
          </div>
        </section>
        <section className="bg-background pb-16 pt-16 md:pb-32">
          <div className="group relative m-auto max-w-5xl px-6">
            <div className="absolute inset-0 z-10 flex scale-95 items-center justify-center opacity-0 duration-500 group-hover:scale-100 group-hover:opacity-100">
              <Link
                href="/"
                className="block text-sm duration-150 hover:opacity-75"
              >
                <span> Meet Our Customers</span>

                <ChevronRight className="ml-1 inline-block size-3" />
              </Link>
            </div>
            <div className="group-hover:blur-xs **:fill-foreground mx-auto mt-12 grid max-w-2xl grid-cols-3 gap-x-12 gap-y-8 transition-all duration-500 group-hover:opacity-50 sm:gap-x-16 sm:gap-y-14 md:grid-cols-4">
              <div className="flex items-center">
                <Image
                  src={ArcjetLogo}
                  alt="arcjet logo"
                  className="mx-auto h-7 object-contain dark:invert"
                />
              </div>
              <div className="flex items-center">
                <Image
                  src={KindeLogo}
                  alt="kinde logo"
                  className="mx-auto h-4 w-fit dark:invert"
                />
              </div>
              <div className="flex items-center">
                <Image
                  src={VercelLogo}
                  alt="vercel logo"
                  className="mx-auto h-7 object-contain dark:invert"
                />
              </div>
              <div className="flex items-center">
                <Image
                  src={NeonLogo}
                  alt="neon logo"
                  className="mx-auto h-5 w-fit invert dark:invert-0"
                />
              </div>
              <div className="flex items-center">
                <Image
                  src={OrpcLogo}
                  alt="orpc logo"
                  className="mx-auto h-6 w-fit"
                />
              </div>
              <div className="flex items-center">
                <Image
                  src={PrismaLogo}
                  alt="prisma logo"
                  className="mx-auto h-6 w-fit dark:invert"
                />
              </div>
              <div className="flex items-center">
                <Image
                  src={MotionLogo}
                  alt="arcjet logo"
                  className="mx-auto h-7 w-fit invert dark:invert-0"
                />
              </div>

              <div className="flex items-center">
                <Image
                  src={OpenAiLogo}
                  alt="openAi logo"
                  className="mx-auto h-7 object-contain dark:invert"
                />
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
