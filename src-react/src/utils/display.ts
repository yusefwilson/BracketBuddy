import { WeightLimit } from "../../../src-shared/types";

export const displayWeightLimit = (weightLimit: WeightLimit): string =>
{
    return weightLimit === 'Superheavyweight' ? 'SHW' : 
    weightLimit === 'Overall' ? 'OVE' :
    `${weightLimit} lbs`
}