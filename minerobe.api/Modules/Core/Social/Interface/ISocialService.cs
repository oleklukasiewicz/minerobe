using minerobe.api.Modules.Core.Social.Entity;

namespace minerobe.api.Modules.Core.Social.Interface
{
    public interface ISocialService
    {
        Task<SocialData> Download(Guid socialId);
        Task<SocialData> Like(Guid socialId);
        Task<SocialData> Share(Guid socialId);
        Task<SocialData> Unlike(Guid socialId);
        Task<SocialData> Unshare(Guid socialId);
        Task<Guid> CreateSocialEntry();
        Task<SocialData> GetById(Guid socialId);
        Task<SocialData> GetUserSummary(Guid userId);
    }
}