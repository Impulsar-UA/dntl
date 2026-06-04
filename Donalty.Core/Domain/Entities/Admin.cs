using System;
using System.Collections.Generic;
using System.Text;

namespace Donalty.Core.Domain.Entities
{
    public class Admin : User
    {
        public Admin(string email, string passwordHash, string displayName)
            : base(email, passwordHash, displayName)
        {
        }
    }

}
