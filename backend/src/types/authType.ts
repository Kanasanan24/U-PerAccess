interface IFSignin {
    email: string,
    password: string
}

interface IFSignup {
    firstname: string,
    lastname: string,
    email: string,
    password: string,
    token: number,
    reference_code: string
}

export {
    IFSignin,
    IFSignup
}