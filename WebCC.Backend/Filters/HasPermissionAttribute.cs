using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace WebCC.Backend.Filters;

public class HasPermissionAttribute : TypeFilterAttribute
{
    public HasPermissionAttribute(string permission) : base(typeof(HasPermissionFilter))
    {
        Arguments = new object[] { permission };
    }
}

public class HasPermissionFilter : IAuthorizationFilter
{
    private readonly string _permission;

    public HasPermissionFilter(string permission)
    {
        _permission = permission;
    }

    public void OnAuthorization(AuthorizationFilterContext context)
    {
        // Require user to be authenticated
        if (!context.HttpContext.User.Identity?.IsAuthenticated ?? true)
        {
            context.Result = new UnauthorizedResult();
            return;
        }

        // Admin role bypasses all permission checks
        if (context.HttpContext.User.IsInRole("Admin"))
        {
            return;
        }

        // Check if the user has the required permission claim
        var userPermissions = context.HttpContext.User.Claims
            .Where(c => c.Type == "Permission")
            .Select(c => c.Value)
            .ToList();

        var hasPermission = userPermissions.Contains(_permission);

        if (!hasPermission)
        {
            context.Result = new ForbidResult();
        }
    }
}
