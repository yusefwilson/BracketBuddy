import { Gender } from "./types"

interface CompetitorDTO {

    id: string

    firstName: string
    lastName: string
    gender: Gender
    officialWeight: number | null // in lbs by default
    paid: boolean
}
export type { CompetitorDTO };