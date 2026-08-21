// Empty recipe registry — app-clone themes don't use the section/recipe
// system. The contract requires this file to exist; an empty registry is
// the explicit "no recipes" signal.
import type { ThemeRecipeRegistry } from '../../types'

export const themeRecipes: ThemeRecipeRegistry = {}

export default themeRecipes
