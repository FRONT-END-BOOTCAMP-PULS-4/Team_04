"use client";

import { useEffect, useState, useCallback, KeyboardEvent } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { TextArea } from "@/components/ui/textArea";

interface Comment {
  id: number;
  content: string;
  createdAt: string;
  email: string;
  username: string;
  avatarUrl: string;
}

export default function CommentSection() {
  const pathname = usePathname();
  const pathParts = pathname.split("/");
  const questionId = Number(pathParts[2]);
  const answerEmail = decodeURIComponent(pathParts[4]);

  const [comments, setComments] = useState<Comment[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [newContent, setNewContent] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const [currentUserEmail, setCurrentUserEmail] = useState("");
  const [currentUserName, setCurrentUserName] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const itemsPerPage = 10;

  const fetchComments = useCallback(async (): Promise<void> => {
    const res = await fetch(`/api/comments?questionId=${questionId}&answerEmail=${answerEmail}`);
    const data = await res.json();
    setComments(data);
  }, [questionId, answerEmail]);

  useEffect(() => {
    if (questionId && answerEmail) {
      fetchComments();
    }

    if (typeof window !== "undefined") {
      const authStorage = localStorage.getItem("auth-storage");
      if (authStorage) {
        try {
          const parsed = JSON.parse(authStorage);
          const user = parsed?.state?.user;
          const email = user?.email;
          const nickname = user?.nickname;

          if (email) {
            setCurrentUserEmail(email);
            setIsLoggedIn(true);
          }
          if (nickname) {
            setCurrentUserName(nickname);
          }
        } catch (error) {
          console.error("Failed to parse auth-storage:", error);
        }
      }
    }
  }, [questionId, answerEmail, fetchComments]);

  const getUserInfo = (): { email: string; nickname: string; avatarUrl: string } | null => {
    if (typeof window === "undefined") return null;

    const authStorage = localStorage.getItem("auth-storage");
    if (!authStorage) return null;

    try {
      const parsed = JSON.parse(authStorage);
      return parsed?.state?.user || null;
    } catch (error) {
      console.error("Error parsing user info:", error);
      return null;
    }
  };

  const handleCreate = async (): Promise<void> => {
    if (!newContent.trim() || isCreating) return;

    const user = getUserInfo();
    if (!user) return;

    try {
      setIsCreating(true);

      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId,
          answerEmail,
          content: newContent,
          email: user.email,
          username: user.nickname,
          avatarUrl: user.avatarUrl,
        }),
      });

      if (!res.ok) throw new Error("댓글 등록 실패");

      setNewContent("");
      await fetchComments();
    } catch (error) {
      console.error(error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleCreate();
    }
  };

  const handleEdit = async (id: number): Promise<void> => {
    try {
      const res = await fetch(`/api/comments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editingContent }),
      });

      if (!res.ok) throw new Error("댓글 수정 실패");

      setEditingId(null);
      setEditingContent("");
      await fetchComments();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id: number): Promise<void> => {
    try {
      const res = await fetch(`/api/comments/${id}`, { method: "DELETE" });

      if (!res.ok) throw new Error("댓글 삭제 실패");

      const updatedComments = comments.filter((c) => c.id !== id);
      const totalPages = Math.ceil(updatedComments.length / itemsPerPage);
      if (currentPage > totalPages) {
        setCurrentPage(Math.max(1, totalPages));
      }

      await fetchComments();
    } catch (error) {
      console.error(error);
    }
  };

  const currentComments = comments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleMovePage = (page: number): void => {
    setCurrentPage(page);
  };

  return (
    <>
      <div className="mt-[var(--space-40)] mb-[16px]">
        <label className="txt-sm-b" htmlFor="comment">
          <span className="text-[var(--gray-02)]">댓글 수 </span>
          <span className="text-black">{comments.length}</span>
        </label>
        {isLoggedIn && (
          <>
            <div className="mb-[10px]" />
            <div className="flex gap-2">
              <TextArea
                placeholder="Type your message here"
                value={newContent}
                label={currentUserName}
                onChange={(e) => setNewContent(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <Button className="w-[80px] h-[120px]" variant="outline" onClick={handleCreate}>
                등록
              </Button>
            </div>
          </>
        )}
      </div>

      {comments.length === 0 ? (
        <div className="mb-[150px]" />   
      ) : (
        <div className="space-y-5 mt-[var(--space-50)]">
          {currentComments.map((comment) => (
            <div key={comment.id} className="border-b pb-5 flex gap-4">
              <div className="relative w-[36px] h-[36px] shrink-0">
                <Image
                  src={comment.avatarUrl}
                  alt="avatar"
                  fill
                  className="rounded-full object-cover"
                />
              </div>
              <div className="flex-1">
                {editingId !== comment.id && (
                  <div className="text-sm font-bold mb-1">{comment.username}</div>
                )}
                {editingId === comment.id ? (
                  <div className="flex gap-2 w-full">
                    <TextArea
                      placeholder="Type your message here"
                      value={editingContent}
                      onChange={(e) => setEditingContent(e.target.value)}
                      label={currentUserName}
                      className="!h-[100px]"
                    />
                    <div className="flex flex-col gap-1.5">
                      <Button variant="gray" size="sm" onClick={() => handleEdit(comment.id)}>
                        저장
                      </Button>
                      <Button size="sm" variant="gray" onClick={() => setEditingId(null)}>
                        취소
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="text-base mb-2 ">{comment.content}</div>
                    <div className="text-xs text-[var(--gray-02)]">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </div>
                  </>
                )}
              </div>
              {editingId !== comment.id && isLoggedIn && currentUserEmail && comment.email === currentUserEmail && (
                <div className="flex flex-col items-end gap-1.5">
                  <Button
                    variant="gray"
                    size="sm"
                    onClick={() => {
                      setEditingId(comment.id);
                      setEditingContent(comment.content);
                    }}
                  >
                    수정
                  </Button>
                  <Button variant="gray" size="sm" onClick={() => handleDelete(comment.id)}>
                    삭제
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Pagination
        totalCount={comments.length}
        itemsPerPage={itemsPerPage}
        pageNumber={currentPage}
        currentPageBlock={currentPage}
        handleMovePageBlock={() => {}}
        handleMovePage={handleMovePage}
      />
    </>
  );
}
