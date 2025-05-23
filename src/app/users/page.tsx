"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useProfileStore, MypageTabType, MypageYearType } from "@/store/useProfileStore";
import { UnderlineTab } from "@/components/ui/underLinetab";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Profile from "./components/History";
import Activity from "./components/Activity";
import MailModal from "./components/MailModal";
import { Button } from "@/components/ui/button";
import { MailIcon } from "lucide-react";

export default function Mypage() {
  const { user } = useAuthStore();
  const {
    activeIndex,
    setActiveIndex,
    selectedYear,
    setSelectedYear,
    setMailAutoToggle,
    showModal,
    setShowModal,
  } = useProfileStore();

  const [activityKey, setActivityKey] = useState(0);

  if (!user?.email) {
    return (
      <div className="flex flex-col justify-center items-center h-screen gap-6">
        <div className="flex flex-col items-center">
          <MailIcon size={64} className="mb-3" />
          <h3 className="txt-2xl-b">이메일을 공개해주세요!</h3>
          <p>클릭 시 GitHub 프로필 설정으로 이동합니다.</p>
          <p className="text-[var(--gray-02)]">
            &#40;Public Profile &#45;&gt; Public email 설정&#41;
          </p>
        </div>

        <Button
          onClick={() => {
            window.open("https://github.com/settings/profile", "_blank");
          }}
        >
          이동하기
        </Button>
      </div>
    );
  }

  const redirectHandler = (value: number) => {
    setActiveIndex(value as MypageTabType);
    if (value === 0) setActivityKey((prev) => prev + 1);
  };

  const tabList = ["나의 활동", "히스토리"];

  return (
    <section className="w-full max-w-[946px] mx-auto mt-[var(--space-40)]">
      <MailModal
        open={showModal}
        onClose={() => {
          setMailAutoToggle(false);
          setShowModal(false);
        }}
        onConfirm={() => {
          setMailAutoToggle(true);
          setShowModal(false);
        }}
      />
      <h2 className="txt-2xl-b mb-[var(--space-50)]">마이 페이지</h2>

      <div className="flex justify-between items-end">
        <UnderlineTab item={tabList} activeIndex={activeIndex} setActiveIndex={redirectHandler} />

        {activeIndex === 0 && (
          <Select
            value={selectedYear.toString()}
            onValueChange={(v) => setSelectedYear(v as unknown as MypageYearType)}
          >
            <SelectTrigger>
              <SelectValue placeholder="연도를 선택하세요" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2025">2025</SelectItem>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2023">2023</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>

      {activeIndex === 0 && <Activity key={activityKey} />}
      {activeIndex === 1 && <Profile />}
    </section>
  );
}
