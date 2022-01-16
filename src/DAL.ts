import axios from 'axios'

export const apiPrefix = '/api/'

const instance = axios.create({
    baseURL: '/api/',
    timeout: 10000,
    responseType: 'json',
});

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

/*
** Account
*/

export interface AccountInfo {
    id: number,
    name: string,
    isAdmin: boolean,
}

export async function tryLoginByToken(token: string): Promise<AccountInfo> {
    return (await instance.post<AccountInfo>(`Account/Login`, token, { headers: { 'Content-Type': 'application/json' } })).data
}

/*
** Assignment
*/

export interface Assignment {
    id: number,
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

export interface MistakeInfo {
    studentId: number,
    mistakes: Array<string>,
}

export async function getMistakeInfo(): Promise<MistakeInfo[]> {
    return (await instance.get<MistakeInfo[]>('/Mistake')).data
}

/*
** Review
*/

export interface ReviewInfo {
    studentId: number,
    studentName: string,
    submittedAt: string,
    grade: Grade,
    needCorrection: Array<string>,
    hasCorrected: Array<string>,
    comment: string,
    track: string,
}

export async function getReviewInfo(assignmentId: number | string, reviewerId: number | string): Promise<ReviewInfo[]> {
    return (await instance.get<ReviewInfo[]>('/Review', { params: { assignmentId, reviewerId } })).data
}
export async function postReviewInfo(assignmentId: number | string, data: ReviewInfo[]) {
    await instance.post(`/Review?assignmentId=${assignmentId}`, data)
}

/*
** Student
*/

export interface StudentSubmissionSummary {
    assignmentId:number,
    grade: Grade,
    needCorrection: Array<string>,
    hasCorrected: Array<string>,
    comment: string,
}
export async function getSubmissionSummary(studentId: number | string): Promise<StudentSubmissionSummary[]> {
    return (await instance.get<StudentSubmissionSummary[]>(`/Student/${studentId}/SubmissionSummary`)).data
}

export async function submitAssignment(studentId: number| string, assignmentId :number|string, file: File) {
    const formData = new FormData();
    formData.append("studentId", studentId.toString());
    formData.append("assignmentId", assignmentId.toString());
    formData.append("file", file);
    
    await instance.post(`/Submission/Submit`, formData)
}
