using Donalty.Core.Domain.Entities;
using Donatly.Application.DTOs;

namespace Donatly.Application.Mappers;

public static class UserMapper
{
    public static UserDto ToDto(this User user)
    {
        string type = user switch
        {
            Admin => "Admin",
            Donor => "Donor",
            OrganizationRep => "OrganizationRep",
            _ => "User"
        };

        return new UserDto(user.Id, user.Email, user.DisplayName, type);
    }
}