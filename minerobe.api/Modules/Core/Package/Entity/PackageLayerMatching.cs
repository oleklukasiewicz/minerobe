﻿using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace minerobe.api.Modules.Core.Package.Entity
{
    public class PackageLayerMatching
    {
        public Guid Id { get; set; }
        public Guid PackageId { get; set; }
        public Guid LayerId { get; set; }
        public int Order { get; set; }
    }
    public class PackageLayerMatchingEntityConfig : IEntityTypeConfiguration<PackageLayerMatching>
    {
        public void Configure(EntityTypeBuilder<PackageLayerMatching> builder)
        {
            builder.HasKey(x => x.Id);
            builder.Property(x => x.Id).ValueGeneratedOnAdd().HasDefaultValueSql("newsequentialid()");
            builder.Property(x => x.PackageId).IsRequired();
            builder.Property(x => x.LayerId).IsRequired();
            builder.Property(x => x.Order).IsRequired();
            builder.ToTable("PackageLayerMatching");
        }
    }
}
