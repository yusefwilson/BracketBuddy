import { Gender } from "../../../src-shared/types.js";
import { serialize } from "../utils.js";
import type { CompetitorDTO } from "../../../src-shared/CompetitorDTO.js";

class Competitor {

    __class: string = 'Competitor'

    id: string

    firstName: string
    lastName: string
    gender: Gender
    officialWeight: number | null // in lbs by default
    paid: boolean

    constructor(id?: string, gender: Gender = 'Male', firstName: string = 'First', lastName: string = 'Last', officialWeight: number | null = null, paid: boolean = false) {

        this.id = firstName + lastName + String(Math.random() * 1000000);

        this.firstName = firstName;
        this.lastName = lastName;
        this.gender = gender;
        this.officialWeight = officialWeight;
        this.paid = paid;
    }

    name() {
        return this.firstName + ' ' + this.lastName;
    }

    serialize(): string {
        return serialize(this);
    }

    toDTO(): CompetitorDTO {
        return {
            id: this.id,
            firstName: this.firstName,
            lastName: this.lastName,
            gender: this.gender,
            officialWeight: this.officialWeight,
            paid: this.paid
        }
    }

    static fromDTO(dto: CompetitorDTO)
    {
        return new Competitor(
            dto.id,
            dto.gender,
            dto.firstName,
            dto.lastName,
            dto.officialWeight,
            dto.paid
        )
    }
}

export default Competitor;
