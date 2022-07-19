import axios from 'axios'

export const apiPrefix = '/api/'

const instance = axios.create({
    baseURL: '/api/',
    timeout: 10000,
    responseType: 'json',
});

instance.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

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

export interface AccountInfo {
    id: number,
    name: string,
    isAdmin: boolean,
}

export async function tryLoginByToken(token: string): Promise<AccountInfo> {
    return (await instance.post<AccountInfo>(`Account/Login`, `"${token}"`, { headers: { 'Content-Type': 'application/json' } })).data
}

/*
** Assignment
*/

export interface Assignment {
    id: number,
    name: number,
    numberOfProblems: string,
    deadline: string,
}

export async function getAssignmentList(): Promise<Array<Assignment>> {
    let res = await instance.get<Array<Assignment>>('Assignment')
    return res.data
}

/*
** Mistake
*/

export interface ProblemDTO {
    assignmentId: number,
    problemId: number,
    display: string,
}

export interface MistakesOfStudent {
    studentId: number,
    mistakes: Array<ProblemDTO>,
}

export async function getMistakeInfo(): Promise<MistakesOfStudent[]> {
    return (await instance.get<MistakesOfStudent[]>('Mistake')).data
}

/*
** Review
*/

export interface ReviewInfo {
    studentId: number,
    studentName: string,
    submittedAt: string,
    grade: Grade,
    needCorrection: Array<ProblemDTO>,
    hasCorrected: Array<ProblemDTO>,
    comment: string,
    track: string,
}

export async function getReviewInfo(assignmentId: number | string, reviewerId: number | string): Promise<ReviewInfo[]> {
    return (await instance.get<ReviewInfo[]>('Review', { params: { assignmentId, reviewerId } })).data
}
export async function postReviewInfo(assignmentId: number | string, data: ReviewInfo[]) {
    await instance.post(`Review?assignmentId=${assignmentId}`, data)
}

/*
** Student
*/

export interface StudentSubmissionSummary {
    assignmentId: number,
    grade: Grade,
    needCorrection: Array<ProblemDTO>,
    hasCorrected: Array<ProblemDTO>,
    comment: string,
}
export async function getSubmissionSummary(studentId: number | string): Promise<StudentSubmissionSummary[]> {
    return (await instance.get<StudentSubmissionSummary[]>(`Student/${studentId}/SubmissionSummary`)).data
}

export async function submitAssignment(studentId: number | string, assignmentId: number | string, file: File) {
    if (file.size > 3 * 1024 * 1024) throw { message: "上传文件过大" };

    const formData = new FormData();
    formData.append("assignmentId", assignmentId.toString());
    formData.append("file", file);

    await instance.post(`Student/${studentId}/Submit`, formData)
}

export async function resetToken(studentId: number | string) {
    return await instance.post(`Student/${studentId}/ResetToken`)
}
