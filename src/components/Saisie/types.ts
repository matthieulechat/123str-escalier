import type { StairInput } from '../../stair.ts'

export type NumKey = { [K in keyof StairInput]: StairInput[K] extends number ? K : never }[keyof StairInput]

export interface SaisieProps {
  value: StairInput
  onChange: (v: StairInput) => void
}
