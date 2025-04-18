import { challengeUsers } from "../model/Model";

export class MissingFieldError extends Error {
    constructor(missingField: string) {
        super(`Value for ${missingField} expected!`)
    }
}


export class JsonError extends Error {}

export function validateAschallengeUsersEntry(arg: any){
    if ((arg as challengeUsers).id == undefined) {
        throw new MissingFieldError('id')
    }
    if ((arg as challengeUsers).name == undefined) {
        throw new MissingFieldError('name')
    }
    if ((arg as challengeUsers).last_name == undefined) {
        throw new MissingFieldError('last_name')
    }
    if ((arg as challengeUsers).email == undefined) {
        throw new MissingFieldError('email')
    }
    if ((arg as challengeUsers).biography == undefined) {
        throw new MissingFieldError('biography')
    }
    if ((arg as challengeUsers).isActive == undefined) {
        throw new MissingFieldError('isActive')
    }
}