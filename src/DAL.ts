import {
    Configuration, 
    AssignmentApi, Assignment as AssignmentDto,
    AccountApi, AccountInfo,
    MistakeApi, MistakeDto, MistakesOfStudent,
    ReviewApi, ReviewInfoDto,
    StudentApi,
    SubmissionApi, SubmissionDto,
    VersionApi
} from 'nju-ps-hw-api';

export enum Grade {
    None,
    A,
    Aminus,
    B,
    Bminus,
    C,
    D
}

export const GradeDisplayStrings = ['-', 'A', 'A-', 'B', 'B-', 'C', 'D'];

export const reviewers = [
    {
        id: "1",
        name: "李晗",
    },
    {
        id: "2",
        name: "桑百惠",
    },
    {
        id: "3",
        name: "赵超懿",
    },
    {
        id: "4",
        name: "姚梦雨",
    },
];

/*
** Account
*/

export type { AccountInfo };

const config = new Configuration({ basePath: '' })

export async function tryLoginByToken(token: string): Promise<AccountInfo> {
    return new AccountApi(config).login(token)
}

export async function resetToken(studentId: number | string) {
    return new StudentApi(config).resetToken(Number(studentId))
}

/*
** Assignment
*/

export type { AssignmentDto };

export async function getAssignmentList(): Promise<Array<AssignmentDto>> {
    return new AssignmentApi(config).getAssignments()
}

/*
** Mistake
*/

export type { MistakesOfStudent, MistakeDto };

export async function getMistakes(): Promise<MistakesOfStudent[]> {
    return new MistakeApi(config).getMistakes()
}

/*
** Review
*/

export type { ReviewInfoDto };

export async function getReview(assignmentId: number | string, reviewerId: number | string): Promise<ReviewInfoDto[]> {
    return new ReviewApi(config).getReview(Number(assignmentId), Number(reviewerId))
}
export async function updateReview(assignmentId: number | string, data: ReviewInfoDto[]) {
    return new ReviewApi(config).updateReview(Number(assignmentId), data)
}
export async function getReviewArchieveUrl(assignmentId: number | string, reviewerId: number | string) {
    return `api/Review/${assignmentId}/Archieve?reviewerId=${reviewerId}`
}

/*
** Submission
*/

export type { SubmissionDto }

export async function getSubmissionSummary(studentId: number | string): Promise<SubmissionDto[]> {
    return new SubmissionApi(config).getSubmissionSummary(Number(studentId))
}

export async function submitAssignment(studentId: number | string, assignmentId: number | string, file: File) {
    return new SubmissionApi(config).submit(Number(studentId), Number(assignmentId), undefined, file)
}

/*
** Version
*/

export async function getServerVersion(): Promise<string> {
    return new VersionApi(config).getServerRevision()
}
