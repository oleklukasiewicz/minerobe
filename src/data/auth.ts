import { currentUser } from "./cache";
import { login,logout } from "./firebase"

export const loginUser=async function()
{
    let user=await login();
    //currentUser.set(user);
}
export const logoutUser=async function()
{
    await logout();
    //currentUser.set(null);
}