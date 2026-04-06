import { DEFAULT_THEME_ID } from './manifest'
import { resolveThemeId } from './theme-selection'
import { THEME_CUSTOMIZATION_CONTRACTS } from './generated/theme-contract-registry.generated'
import type { ThemeCustomizationContract } from './types'

const EMPTY_CONTRACT: ThemeCustomizationContract = {
  meta: {
    id: DEFAULT_THEME_ID,
    name: DEFAULT_THEME_ID,
    description: '',
    status: 'stable',
  },
  sections: {},
  recipes: {},
  tokens: {},
}

export function getThemeCustomizationContract(themeId: unknown): ThemeCustomizationContract {
  const resolved = resolveThemeId(themeId)
  return (
    THEME_CUSTOMIZATION_CONTRACTS[resolved] ||
    THEME_CUSTOMIZATION_CONTRACTS[DEFAULT_THEME_ID] ||
    Object.values(THEME_CUSTOMIZATION_CONTRACTS)[0] ||
    EMPTY_CONTRACT
  )
}

export function listThemeCustomizationContracts(): ThemeCustomizationContract[] {
  const contracts = Object.values(THEME_CUSTOMIZATION_CONTRACTS)
  return contracts.length > 0 ? contracts : [EMPTY_CONTRACT]
}
