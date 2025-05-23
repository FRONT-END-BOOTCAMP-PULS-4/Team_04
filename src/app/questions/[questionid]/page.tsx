"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/useAuthStore";
import QusetionHeader from "./components/QusetionHeader";
import QuestionSolution from "./components/QuestionSolution";
import { handleCheckUser } from "@/utils/handleCheckUser";
import { toast } from "sonner";
import OtherUsersAnswer from "./components/OtherUsersAnswer";
import Loader from "@/components/common/Loader";
import Alert from "./components/Alert";

type AnswerAction = "create" | "update";

interface QuestionResponse {
  id: number;
  categoryId: number;
  categoryName: string;
  content: string;
  answer: string;
  isBookmarked: boolean;
  solution: string;
  views: number;
  createdAt: string;
}

export default function AnswerFormPage() {
  const searchParams = useSearchParams();
  const user = useAuthStore((state) => state.user);
  const params = useParams();
  const questionId = Number(params.questionid);
  const [tab, setTab] = useState<string>("tab1");
  const [userAnswer, setUserAnswer] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isEditing, setIsEditing] = useState(true);
  const [questionData, setQuestionData] = useState<QuestionResponse | null>(null);
  const [showAlert, setShowAlert] = useState({ type: "", action: false, text: "" });
  const answerRef = useRef<HTMLTextAreaElement>(null);
  const token: string | null = useAuthStore((state) => state.token);
  const avatar = user?.avatarUrl;
  const nickName = user?.nickname;
  const userEmail = searchParams.get("userId");
  const { localEmail, isLogin } = handleCheckUser();
  const isMatchCurrentLoginUser = token !== null && localEmail === userEmail;
  if (isEditing) {
    answerRef.current?.focus();
  }
  //깃허브 유저 확인
  const checkGithubUser = token !== null && userEmail == null;
  // 초기 들어왔을 때 이전에 작성한 답변이 있으면 불러오기
  const handleGetQuestion = useCallback(async () => {
    try {
      const response = await fetch(
        isMatchCurrentLoginUser
          ? `/api/questions/${questionId}?userId=${userEmail}`
          : `/api/questions/${questionId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error("서버 응답 실패");
      }
      const data = await response.json();
      setQuestionData(data?.data);
    } catch (error) {
      alert("문제, 답변 불러오기 실패: " + (error as Error).message);
    }
  }, [questionId, userEmail, isMatchCurrentLoginUser, token]);

  useEffect(() => {
    handleGetQuestion();
  }, [handleGetQuestion]);

  useEffect(() => {
    if (!questionData) return;
    if (questionData?.answer !== "") {
      setUserAnswer(questionData.answer);
      setIsSubmitted(true);
      setIsEditing(false);
    }
  }, [questionData]);

  useEffect(() => {
    if (isEditing) {
      answerRef.current?.focus();
    }
  }, [isEditing]);

  useEffect(() => {
    if (!showAlert.action) {
      setIsEditing(true);
    }
  }, [showAlert.action]);

  const handleSaveAnswer = async (action: AnswerAction) => {
    if (!isLogin) {
      return setShowAlert((prev) => ({
        ...prev,
        type: "login",
        action: true,
        text: "로그인이 필요합니다",
      }));
    }
    if (checkGithubUser) {
      return setShowAlert((prev) => ({
        ...prev,
        type: "github",
        action: true,
        text: "깃허브 이메일 공개가 필요합니다",
      }));
    }

    if (userAnswer.trim().length === 0) {
      return setShowAlert((prev) => ({
        ...prev,
        type: "content",
        action: true,
        text: "내용을 입력해주세요",
      }));
    }

    const method = action === "create" ? "POST" : "PUT";

    const formData = {
      userId: userEmail,
      questionId,
      content: userAnswer,
      userName: nickName,
      avatarUrl: avatar,
    };

    try {
      const response = await fetch(`/api/answers`, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        throw new Error(action === "create" ? "답변 저장 실패." : "답변 변경 실패.");
      }
      toast.success(action === "create" ? "답변이 저장되었습니다." : "답변이 변경되었습니다.");
      setIsSubmitted(true);
      setIsEditing(false);
    } catch (error) {
      toast.error(`${(error as Error).message}`);
    }
  };

  //답변 삭제
  const handleDeleteAnswer = async () => {
    try {
      const response = await fetch(`/api/answers`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: userEmail,
          questionId,
        }),
      });
      if (!response.ok) {
        throw new Error("답변 삭제 실패");
      }
      toast.success("답변이 삭제되었습니다.");
      setUserAnswer("");
      setIsSubmitted(false);
      setIsEditing(true);
    } catch (error) {
      toast.error(`${(error as Error).message}`);
    }
  };
  if (!questionData) return <Loader />;
  const { content, solution, isBookmarked, categoryName } = questionData;
  return (
    <>
      {showAlert && <Alert showAlert={showAlert} setShowAlert={setShowAlert} />}
      <div className="container mx-auto pt-[40px]">
        <QusetionHeader
          content={content}
          categoryName={categoryName}
          isBookmarked={isBookmarked}
          questionId={questionId}
          currentUser={isMatchCurrentLoginUser}
        />
        <form>
          <Tabs defaultValue="tab1" value={tab} onValueChange={setTab}>
            <TabsList className="mr-0 ml-auto">
              <TabsTrigger value="tab1">나의 답변 작성하기</TabsTrigger>
              <TabsTrigger value="tab2">모범 답안 확인하기</TabsTrigger>
            </TabsList>
            <TabsContent value="tab1">
              <textarea
                className="box-border p-[24px] h-[500px] border border-[var(--blue-03)] radius mt-6 w-full resize-none focus:ring-1 focus:ring-[var(--blue-03)] focus:outline-none"
                placeholder="내용을 입력하세요..."
                onChange={(e) => setUserAnswer(e.target.value)}
                value={userAnswer}
                disabled={!isEditing}
                ref={answerRef}
              ></textarea>
            </TabsContent>
            <TabsContent value="tab2">
              <QuestionSolution solution={solution} />
            </TabsContent>
          </Tabs>
          {tab === "tab1" && (
            <div className="flex justify-center mt-[24px]">
              {/* 이미 기존에 작성한 답변이 있으면 수정 삭제 먼저 */}
              {isSubmitted && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="lg"
                    type="button"
                    onClick={() => {
                      if (isEditing) {
                        handleSaveAnswer("update");
                      }
                      setIsEditing((prev) => !prev);
                    }}
                  >
                    {isEditing ? "저장" : "수정"}
                  </Button>
                  <Button variant="gray" size="lg" type="button" onClick={handleDeleteAnswer}>
                    삭제
                  </Button>
                </div>
              )}
              {!isSubmitted && (
                <Button size="lg" type="button" onClick={() => handleSaveAnswer("create")}>
                  저장
                </Button>
              )}
            </div>
          )}
        </form>
        <div className="pt-[150px] ">
          <OtherUsersAnswer questionId={questionId} userEmail={userEmail} token={token} />
        </div>
      </div>
    </>
  );
}
