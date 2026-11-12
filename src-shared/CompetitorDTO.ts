import { Gender } from "./types"

interface CompetitorDTO {

    // optional only when creating a competitor: the backend assigns the id. DTOs it sends back always have one.
    id?: string

    firstName: string
    lastName: string
    gender: Gender
    officialWeight?: number | null // in lbs by default
    paid?: boolean
}

export type { CompetitorDTO };
