using minerobe.api.Helpers.Model;
using minerobe.api.Modules.Core.Social.Entity;

namespace minerobe.api.Modules.Core.Social.Interface
{
    public interface ISocialService
    {
        Task<Guid> Add();
        Task<bool> CanAccessSocial(Guid socialId, Guid userId);
        Task<bool> CanEditSocial(Guid socialId, Guid userId);
        Task<SocialData> Download(Guid socialId);
        Task<SocialData> GetById(Guid socialId);
        Task<PackageAccessModel> GetSocialAccess(Guid socialId);
        Task<SocialData> GetUserSummary(Guid userId);
        Task<SocialData> Like(Guid socialId);
        Task<SocialData> Share(Guid socialId);
        Task<SocialData> Unlike(Guid socialId);
        Task<SocialData> Unshare(Guid socialId);
    }
}