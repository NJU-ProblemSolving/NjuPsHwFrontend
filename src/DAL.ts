import axios from 'axios'

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
** Assignment
*/

export async function getAssignmentList(): Promise<Array<number>> {
    let res = await instance.get<Array<number>>('Assignment')
    return res.data
}

export interface SelectOption {
    value: string
}

export interface ReviewInfo {
    studentId: number,
    studentName: string,
    submittedAt: string,
    grade: Grade,
    needCorrection: Array<string>,
    hasCorrected: Array<string>,
    mistakes: Array<SelectOption>,
    comment: string,
    track: string,
}

export interface MistakeInfo {
    studentId: number,
    mistakes: Array<string>,
}

export async function getReviewInfo(assignmentId: number | string, reviewer: number | string): Promise<ReviewInfo[]> {
    let reqs = await Promise.all([
        instance.get<ReviewInfo[]>(`Assignment/${assignmentId}/Review/${reviewer}`),
        instance.get<MistakeInfo[]>(`Mistake`)
    ])
    let [{ data: reviewInfos }, { data: mistakes }] = reqs
    let map: { [key: number]: Array<string> } = {}
    for (let i in mistakes) {
        map[mistakes[i].studentId] = mistakes[i].mistakes
    }
    for (let i in reviewInfos) {
        let mistakes = map[reviewInfos[i].studentId] ?? []
        mistakes = mistakes.concat(reviewInfos[i].hasCorrected)
        reviewInfos[i].mistakes = mistakes.map(x => ({ value: x }))
    }
    return reviewInfos
}
export async function postReviewInfo(assignmentId: number | string, data: ReviewInfo[]) {
    await instance.post(`Assignment/${assignmentId}/Review`, data)
}
export async function tryLoginByToken(token: string) {
    await instance.post(`Account/Login`, token, { headers: { 'Content-Type': 'application/json' } })
}
