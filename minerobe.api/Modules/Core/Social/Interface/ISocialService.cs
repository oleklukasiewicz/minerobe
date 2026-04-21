using minerobe.api.Modules.Core.Social.Entity;

namespace minerobe.api.Modules.Core.Social.Interface
{
    public interface ISocialService
    {
        Task<Guid> Add();
        Task<SocialData> Download(Guid socialId);
        Task<SocialData> GetById(Guid socialId);
        Task<SocialData> GetUserSummary(Guid userId);
        Task<SocialData> Share(Guid socialId);
        Task<SocialData> Unshare(Guid socialId);
    }
}