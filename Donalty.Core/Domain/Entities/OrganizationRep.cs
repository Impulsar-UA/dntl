namespace Donalty.Core.Domain.Entities
{
    public class OrganizationRep : User
    {
        public string OrgRegistryCode { get; private set; }
        public string ContactPhone { get; private set; }

        public OrganizationRep(string email, string passwordHash, string displayName, string orgRegistryCode, string contactPhone)
            : base(email, passwordHash, displayName)
        {
            OrgRegistryCode = orgRegistryCode;
            ContactPhone = contactPhone;
        }
    }

}
