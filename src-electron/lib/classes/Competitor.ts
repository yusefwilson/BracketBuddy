import { Gender } from "../../../src-shared/types.js";
import { serialize } from "../utils.js";

class Competitor {

    __class: string = 'Competitor'

    id: string

    firstName: string
    lastName: string
    gender: Gender
    officialWeight: number | null // in lbs by default

    constructor(gender: Gender = 'Male', firstName: string = 'First', lastName: string = 'Last', officialWeight: number | null = null, paid: boolean = false) {

        this.id = firstName + lastName + String(Math.random() * 1000000);

        this.firstName = firstName;
        this.lastName = lastName;
        this.gender = gender;
        this.officialWeight = officialWeight;

    }

    name() {
        return this.firstName + ' ' + this.lastName;
    }

    serialize(): string {
        return serialize(this);
    }
}

export default Competitor;
