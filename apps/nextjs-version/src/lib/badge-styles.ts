export const getStatusColor = (status: string) => {
  switch (status.normalize().toLowerCase()) {
    case "active":
    case "verified":
    case "published":
      return "text-green-700 bg-green-50 ring-green-600/20 dark:text-green-400 dark:bg-green-400/10 dark:ring-green-400/20";

    case "pending":
    case "processing":
      return "text-amber-700 bg-amber-50 ring-amber-600/20 dark:text-amber-400 dark:bg-amber-400/10 dark:ring-amber-400/20";

    case "error":
    case "suspended":
    case "rejected":
    case "banned":
    case "deleted": // Added here (Destructive/Critical)
      return "text-red-700 bg-red-50 ring-red-600/20 dark:text-red-400 dark:bg-red-400/10 dark:ring-red-400/20";

    case "inactive":
    case "archived":
    case "draft":
      return "text-slate-700 bg-slate-50 ring-slate-600/20 dark:text-slate-400 dark:bg-slate-400/10 dark:ring-slate-400/20";

    default:
      return "text-slate-700 bg-slate-50 ring-slate-600/20 dark:text-slate-400 dark:bg-slate-400/10 dark:ring-slate-400/20";
  }
};

export const getRoleColor = (role: string) => {
  switch (role.normalize().toLowerCase()) {
    case "admin":
    case "administrator":
      // Purple represents Authority/Royalty (Red is too close to "Error")
      return "text-violet-700 bg-violet-50 ring-violet-600/20 dark:text-violet-400 dark:bg-violet-400/10 dark:ring-violet-400/20";

    case "editor":
      // Blue represents Information/Management
      return "text-blue-700 bg-blue-50 ring-blue-600/20 dark:text-blue-400 dark:bg-blue-400/10 dark:ring-blue-400/20";

    case "maintainer":
    case "developer":
      // Teal/Cyan represents Technical/Engineering (Distinct from Success Green)
      return "text-teal-700 bg-teal-50 ring-teal-600/20 dark:text-teal-400 dark:bg-teal-400/10 dark:ring-teal-400/20";

    case "author":
    case "creator":
      // Orange/Amber represents Creativity
      return "text-orange-700 bg-orange-50 ring-orange-600/20 dark:text-orange-400 dark:bg-orange-400/10 dark:ring-orange-400/20";

    case "subscriber":
    case "user":
    case "guest":
      // Base users should be Neutral to reduce visual noise in lists
      return "text-slate-600 bg-slate-50 ring-slate-500/20 dark:text-slate-400 dark:bg-slate-400/10 dark:ring-slate-400/20";

    default:
      return "text-slate-600 bg-slate-50 ring-slate-500/20 dark:text-slate-400 dark:bg-slate-400/10 dark:ring-slate-400/20";
  }
};
