using Microsoft.EntityFrameworkCore;
using minerobe.api.Database;
using minerobe.api.Helpers.Model;
using minerobe.api.Modules.Core.Permits.Interface;

namespace minerobe.api.Modules.Core.Auth.Service
{
    public class PermitsService : IPermitsService
    {
        private readonly BaseDbContext _context;
        public PermitsService(BaseDbContext context)
        {
            _context = context;
        }
        public async Task<EntityPermitModel> GetEntityPermits(Guid entity, EntityType type)
        {
            if (type == EntityType.OUTFIT_PACKAGE)
            {
                var package = await _context.OutfitPackages.Where(x => x.Id == entity).FirstOrDefaultAsync();
                var social = await _context.SocialDatas.Where(x => x.Id == package.SocialDataId).FirstOrDefaultAsync();
                return new EntityPermitModel
                {
                    EntityId = entity,
                    Type = type,
                    PublisherId = package.PublisherId,
                    IsShared = social.IsShared
                };
            }
            if (type == EntityType.OUTFIT_COLLECTION)
            {
                var collection = await _context.OutfitPackageCollections.Where(x => x.Id == entity).FirstOrDefaultAsync();
                var social = await _context.SocialDatas.Where(x => x.Id == collection.SocialDataId).FirstOrDefaultAsync();
                return new EntityPermitModel
                {
                    EntityId = entity,
                    Type = type,
                    PublisherId = collection.PublisherId,
                    IsShared = social.IsShared
                };
            }
            if (type == EntityType.SOCIAL_DATA)
            {
                var social = await _context.SocialDatas.Where(x => x.Id == entity).FirstOrDefaultAsync();
                //find entity that has this social data
                var package = await _context.OutfitPackages.Where(x => x.SocialDataId == entity).FirstOrDefaultAsync();
                if (package != null)
                    return new EntityPermitModel
                    {
                        EntityId = entity,
                        Type = type,
                        PublisherId = package.PublisherId,
                        IsShared = social.IsShared
                    };
                var collection = await _context.OutfitPackageCollections.Where(x => x.SocialDataId == entity).FirstOrDefaultAsync();
                if (collection != null)
                    return new EntityPermitModel
                    {
                        EntityId = entity,
                        Type = type,
                        PublisherId = collection.PublisherId,
                        IsShared = social.IsShared
                    };
            }
            return null;
        }
        public async Task<bool> CanEdit(Guid userId, Guid entity, EntityType type)
        {
            var permits = await GetEntityPermits(entity, type);
            if (permits == null)
                return false;
            return permits.PublisherId == userId;
        }
        public async Task<bool> CanView(Guid userId, Guid entity, EntityType type)
        {
            var permits = await GetEntityPermits(entity, type);
            if (permits == null)
                return false;
            if (permits.IsShared)
                return true;
            return permits.PublisherId == userId;
        }
    }
}
