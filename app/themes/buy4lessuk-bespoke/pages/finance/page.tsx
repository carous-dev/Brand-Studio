import type { ThemePageProps } from '../../../types'
import PageHero from '../../components/PageHero'
import PageShell from '../../components/PageShell'
import FinanceCalc from './FinanceCalc'

export function Buy4lessukFinancePage(_: ThemePageProps) {
  return (
    <>
      <PageHero title="Car finance in 60 seconds" eyebrow="Finance" slot="finance" />
      <PageShell>
        <FinanceCalc />
      </PageShell>
    </>
  )
}

export default Buy4lessukFinancePage
