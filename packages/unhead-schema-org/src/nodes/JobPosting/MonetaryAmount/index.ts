import type { Thing } from '../../../types'

export interface MonetaryAmountSimple extends Thing {
  '@type'?: 'MonetaryAmount'

  /**
   * The currency in which the monetary amount is expressed.
   */
  currency: string

  /**
   * The value of the quantitative value or property value node.
   */
  value: QuantitativeValue | string
}

export interface MonetaryAmount extends MonetaryAmountSimple {}

export interface QuantitativeSimple extends Thing {
  '@type'?: 'QuantitativeValue'
  value?: number
  minValue?: number
  maxValue?: number
  unitText: 'HOUR' | 'DAY' | 'WEEK' | 'MONTH' | 'YEAR'
}

export interface QuantitativeValue extends QuantitativeSimple {}
