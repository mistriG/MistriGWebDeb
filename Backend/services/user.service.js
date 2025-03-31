import userModel from '../models/user.model.js';


export const createUser = async ({
    firstname, lastname, email, password, mobileNumber
}) => {
    if (!firstname || !email || !password) {
        throw new Error('All fields are required');
    }
    const user = userModel.create({
        fullname: {
            firstname,
            lastname
        },
        email,
        password,
        mobileNumber
    })
    return user;
}