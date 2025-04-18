"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MyAnswer from "./MyAnswer";
import Bookmark from "./Bookmark";
import Comment from "./Comment";
import LikeAnswer from "./LikeAnswer";

export default function Profile() {
  return (
    <>
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="mb-[56px]">
          <TabsTrigger className="txt-lg" value="myAnswer">
            내답변
          </TabsTrigger>
          <TabsTrigger className="txt-lg" value="bookmark">
            북마크
          </TabsTrigger>
          <TabsTrigger className="txt-lg" value="likeAnswer">
            좋아요 한 답변
          </TabsTrigger>
          <TabsTrigger className="txt-lg" value="comment">
            댓글
          </TabsTrigger>
        </TabsList>
        <TabsContent value="myAnswer">
          <MyAnswer />
        </TabsContent>
        <TabsContent value="bookmark">
          <Bookmark></Bookmark>
        </TabsContent>
        <TabsContent value="likeAnswer">
          <LikeAnswer></LikeAnswer>
        </TabsContent>
        <TabsContent value="comment">
          <Comment></Comment>
        </TabsContent>
      </Tabs>
    </>
  );
}
