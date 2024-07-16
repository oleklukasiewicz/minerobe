using minerobe.api.Entity.Integration;
using minerobe.api.Entity.User;

namespace minerobe.api.Services.Interface
{
    public interface IJavaXboxAuthService
    {
        Task<JavaXboxProfile> GetProfile(MinerobeUser user);
        Task<JavaXboxProfile> LinkAccount(MinerobeUser user);
    }
}