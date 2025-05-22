export interface UserUpdateInterface {
    name?: string;
    email?: string;
    username?: string;
    bio?: string;
    profilePic?: string;
    private?: boolean;

}

export interface UserChangePasswordInterface {
    oldPassword: string;
    newPassword: string;
}