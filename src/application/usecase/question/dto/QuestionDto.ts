export class QuestionDto{
    constructor(
        public id: number,
        public categoryId: number,
        public content: string,
        public solution: string,
        public views: number,
        public createdAt: string,
        public bookmark_count: number,
        public answer_count: number,
    ){}
}