using minerobe.api.Helpers.Model;

namespace minerobe.api.Modules.Core.Permits.Interface
{
    public interface IPermitsService
    {
        Task<bool> CanEdit(Guid userId, Guid entity, EntityType type);
        Task<bool> CanView(Guid userId, Guid entity, EntityType type);
    }
}