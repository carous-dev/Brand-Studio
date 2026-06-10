import type { ThemeRecipeRegistry } from '../../types'

// fbm-motors ships its configurable text via recipes/text-recipe.json (consumed
// by the dashboard /create + /update forms and the AI brand generator). The
// section-recipe registry below is intentionally empty — the theme does not
// expose composable section presets at this time.
export const themeRecipes: ThemeRecipeRegistry = {}
