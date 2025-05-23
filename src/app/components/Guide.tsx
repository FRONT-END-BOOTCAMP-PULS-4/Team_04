import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

export default function Guide() {
  return (
    <section className="w-screen flex items-center h-[calc(100vh-200px)] relative left-1/2 right-1/2 -mx-[50vw] bg-gradient-to-t from-[var(--blue-03)] via-white to-white text-center mb-[100px]">
      <div className="max-w-2xl mx-auto px-4" data-aos="fade-down">
        <h2 className="text-4xl sm:text-5xl font-bold mb-6 leading-normal ">
          기술 면접
          <br />
          어떻게 준비해야할까?
        </h2>
        <p className="!text-gray-500 text-lg sm:text-2xl font-normal mb-14 leading-normal">
          기술 면접은 정말 어렵습니다.
          <br />
          하지만, 저희와 함께라면 걱정하지 마세요!
        </p>
        <Link href="/questions">
          <Button
            variant="round"
            size="lg"
            className="hover:scale-105 transition-transform duration-300"
          >
            시작하기
          </Button>
        </Link>
      </div>
      <div className="absolute bottom-[var(--space-4)] left-1/2 -translate-x-1/2 animate-bounce text-[var(--gray-03)]">
        <ChevronDown className="w-8 h-8" />
      </div>
    </section>
  );
}
