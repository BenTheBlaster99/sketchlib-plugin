/** Matches backend AccessService / web dashboard gating. */

export function hasFullLibraryAccess(user) {
  if (!user) return false
  if (user.is_beta) return true
  const status = user.active_subscription?.status
  return status === 'active' || status === 'beta'
}

export function canAccessCategory(categoryId, user, packCategoryIds = []) {
  if (hasFullLibraryAccess(user)) return true
  return packCategoryIds.includes(categoryId)
}
