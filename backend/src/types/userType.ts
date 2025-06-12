interface IFCreateUser {
    firstname: string,
    lastname: string,
    email: string,
    password: string,
    status: boolean,
    role_ids: number[]
}

interface IFSearchType {
    title: string,
    page: number,
    pageSize: number,
    sortField: string,
    sortOrder: string
}

export {
    IFSearchType,
    IFCreateUser
}